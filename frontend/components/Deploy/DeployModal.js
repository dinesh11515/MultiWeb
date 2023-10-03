import Image from "next/image";
import React, { useState, useEffect } from "react";
import { AiFillCopy, AiOutlineDeploymentUnit } from "react-icons/ai";
import { readContract, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import Confetti from "react-confetti";
import { useWindowDimensions } from "@/constants/windowSize.js";
import { waitForTransaction } from "@wagmi/core";

import {
  deployerAbi,
  contractAddress,
  wormholeChains,
  rpcUrls,
} from "@/constants";
import { useRouter } from "next/router";
const Backdrop = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="top-0 left-0 fixed bg-black/20 backdrop-blur-md h-screen w-screen"
    ></div>
  );
};

const DeployModal = ({
  onClose,
  bytecode,
  formData,
  setFormData,
  initializable,
  initializableData,
  abi,
}) => {
  const [generatingAddress, setGeneratingAddress] = useState(false);
  const [startDeploying, setStartDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState("");
  const [salt, setSalt] = useState("");
  const [computedAddress, setComputedAddress] = useState("");

  const { height, width } = useWindowDimensions();
  const router = useRouter();
  const computeAddress = async () => {
    try {
      if (salt === "") {
        alert("Please enter salt");
        return;
      }

      const abiCoder = new ethers.utils.AbiCoder();
      const saltbytes = abiCoder.encode(["uint256"], [salt]);

      const address = await readContract({
        address: contractAddress,
        abi: deployerAbi,
        functionName: "computeAddress",
        args: [saltbytes, bytecode],
      });

      setComputedAddress(address);
    } catch (err) {
      console.log(err, "compute address");
    }
  };

  const generateAddressHandler = async () => {
    if (salt === "") {
      alert("Please enter salt");
      return;
    }
    setGeneratingAddress(true);
    await computeAddress();
  };

  const deployContractHandler = async () => {
    try {
      if (salt === "") {
        alert("Please enter salt");
        return;
      }
      setStartDeploying(true);

      const abiCoder = new ethers.utils.AbiCoder();
      const saltbytes = abiCoder.encode(["uint256"], [salt]);
      let domains = [];
      let tx;
      console.log(formData, "multichains");
      if (formData.multichains.length > 0) {
        let totalFee = ethers.utils.parseEther("0");
        for (let i = 0; i < formData.multichains.length; i++) {
          const fee = await readContract({
            address: contractAddress,
            abi: deployerAbi,
            functionName: "quoteCrossChainGreeting",
            args: [wormholeChains[formData.multichains[i].chainName]],
          });
          console.log(fee);
          domains.push(wormholeChains[formData.multichains[i].chainName]);
          totalFee = totalFee.add(fee);
        }

        console.log(domains, totalFee);

        const { hash } = await writeContract({
          address: contractAddress,
          abi: deployerAbi,
          functionName: "xDeployer",
          args: [domains, saltbytes, bytecode, "0x", totalFee],
          value: totalFee,
        });
        console.log(hash, "tx");
        setTx(hash);

        await waitForTransaction({ hash: hash });
      } else {
        const { hash } = await writeContract({
          address: contractAddress,
          abi: deployerAbi,
          functionName: "deployContract",
          args: [saltbytes, bytecode, "0x"],
        });
        console.log(hash, "tx");
        setTx(hash);

        await waitForTransaction({ hash: hash });
      }
      setDeploymentSuccess(true);
    } catch (err) {
      alert(err.message, "DeployContract");
      setStartDeploying(false);
    }
  };

  return (
    <div>
      <Backdrop onClose={onClose} />
      <div className="w-[550px] bg-[#111111] p-10 rounded-2xl absolute top-[50%] left-[50%] shadow-md -translate-x-[50%] -translate-y-[50%] z-10 rounded-b-2xl  overflow-hidden border border-gray-800">
        {startDeploying ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <AiOutlineDeploymentUnit color="white" size={80} />
            <p className="text-green-300 text-sm">
              {deploymentSuccess
                ? "Deployment Success"
                : "Deploying Contract..."}
            </p>

            {deploymentSuccess && (
              <button
                onClick={() => {
                  window.open(
                    "https://wormholescan.io/#/tx/" + tx + "?network=TESTNET"
                  );
                }}
                className="py-3 px-7 rounded-md bg-[#1F423A] hover:bg-[#1a3831] text-green-300 border border-gray-600 mt-4 w-full"
              >
                View on Wormhole Explorer
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-center items-center gap-4">
              <AiOutlineDeploymentUnit color="white" size={80} />
              <p className="text-green-300 text-sm">
                {generatingAddress
                  ? computedAddress
                    ? "Generated Address"
                    : "Generating Address..."
                  : "Successfully Compiled!"}
              </p>
            </div>

            <>
              <p className="text-xs text-gray-400 mt-6 mb-1">
                Enter the salt value
              </p>
              <input
                className="py-2 px-2  text-gray-400 border border-gray-700 rounded-md w-full focus:outline-none bg-transparent"
                type="number"
                id="salt"
                onChange={(e) => setSalt(e.target.value)}
              ></input>

              {computedAddress !== "" && (
                <div>
                  <p className="text-xs text-gray-400 mt-6 mb-1">
                    Generated Address
                  </p>
                  <p className="py-3 px-2 flex items-center justify-between border text-gray-400 border-gray-700 rounded-md w-full">
                    {computedAddress}{" "}
                    <span>
                      <AiFillCopy
                        className="cursor-pointer"
                        size={22}
                        onClick={() => {
                          navigator.clipboard.writeText(computedAddress);
                        }}
                      />
                    </span>
                  </p>
                </div>
              )}
              <button
                onClick={generateAddressHandler}
                className="py-3 px-7 rounded-md bg-[#191919] hover:bg-[#111111] text-gray-300 border border-gray-600 mt-4 w-full"
              >
                Generate Address
              </button>
              <p className="text-xs mt-1 text-gray-400 text-center">
                Generate an address for your compiled contract
              </p>
            </>
            {computedAddress !== "" && (
              <div>
                <p className="text-xs text-gray-400 mt-4 mb-1">
                  If you like the address generated then you can go for
                  deployment otherwise you can alter the salt and generate new
                  address
                </p>
                <button
                  onClick={deployContractHandler}
                  className="py-3 px-7 rounded-md bg-[#1F423A] hover:bg-[#1a3831] text-green-300 border border-gray-600 mt-4 w-full"
                >
                  Deploy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {deploymentSuccess && <Confetti width={width} height={height} />}
    </div>
  );
};

export default DeployModal;
