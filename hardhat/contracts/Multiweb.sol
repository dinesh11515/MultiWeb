// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./interfaces/IWormholeRelayer.sol";
import "./interfaces/IWormholeReceiver.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Multiweb is IWormholeReceiver, Initializable {
    // Interface for the connext xcall function
    IWormholeRelayer public wormholeRelayer;
    uint256 constant GAS_LIMIT = 2_000_000;

    // This function is used to initialize the variables
    function initialize(address _wormholeRelayer) public initializer {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    function quoteCrossChainGreeting(
        uint16 targetChain
    ) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }

    // This function is used to deploy the contract across multiple chains
    // @param target - the address of the target contract
    // @param destinationDomain - a array of the destination chain IDs
    // @param salt - the salt used to create the contract address
    // @param bytecode - the bytecode of the contract
    // @param relayerFee - a array of the fee the relayer will charge for the xcall function to call the target contract
    // @param initializable - a boolean to determine if the contract is initializable
    // @param initializeData - the data used to initialize the contract
    // @param totalFee - the total fee the user will pay for the xcall function to execute this accross multiple chains
    function xDeployer(
        uint16[] calldata destinationChains,
        bytes32 salt,
        bytes memory bytecode,
        bytes memory initializeData,
        uint256 totalFee
    ) external payable {
        require(msg.value >= totalFee, "msg.value must equal totalFee");
        deployContract(salt, bytecode, initializeData);
        bytes memory payload = abi.encode(salt, bytecode, initializeData);
        for (uint i = 0; i < destinationChains.length; ) {
            uint256 cost = quoteCrossChainGreeting(destinationChains[i]);
            wormholeRelayer.sendPayloadToEvm{value: cost}(
                destinationChains[i],
                address(this),
                payload,
                0,
                GAS_LIMIT
            );
            unchecked {
                ++i;
            }
        }
    }

    // This function is called by the connext xcall function
    // @param _callData - the encoded calldata to send
    // @return bytes - the encoded return data
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory, // additionalVaas
        bytes32, // address that called 'sendPayloadToEvm' (HelloWormhole contract address)
        uint16,
        bytes32 // this can be stored in a mapping deliveryHash => bool to prevent duplicate deliveries
    ) public payable override {
        require(msg.sender == address(wormholeRelayer), "Only relayer allowed");

        // Unpack the _callData
        (bytes32 salt, bytes memory bytecode, bytes memory initializeData) = abi
            .decode(payload, (bytes32, bytes, bytes));
        deployContract(salt, bytecode, initializeData);
    }

    // This function is used to deploy and initialize a contract
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @param initializable - whether the contract is initializable
    // @param initializeData - the data used to initialize the contract
    // @return address - the address of the deployed contract
    function deployContract(
        bytes32 salt,
        bytes memory bytecode,
        bytes memory initializeData
    ) public returns (address) {
        address deployedAddress = deploy(salt, bytecode);
        // transfer ownership to the _originSender
        if (initializeData.length > 0) {
            (bool success, ) = deployedAddress.call(initializeData);
            require(success, "initiailse failed");
        }
        return deployedAddress;
    }

    // @dev This function is used to deploy a contract using CREATE2
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @return address - the address of the deployed contract
    function deploy(
        bytes32 salt,
        bytes memory bytecode
    ) public returns (address) {
        return Create2.deploy(0, salt, bytecode);
    }

    // This function is used to compute the address of the contract that will be deployed
    // @param salt - the salt used to generate the address
    // @param bytecode - the bytecode of the contract
    // @return address - the computed address of the contract that will be deployed
    function computeAddress(
        bytes32 salt,
        bytes memory bytecode
    ) public view returns (address) {
        return Create2.computeAddress(salt, keccak256(bytecode));
    }

    receive() external payable {}
}
