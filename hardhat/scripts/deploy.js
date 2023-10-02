// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Create2Deployer = await hre.ethers.getContractFactory(
    "Create2Deployer"
  );
  const create2Deployer = await Create2Deployer.attach(
    "0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2"
  );

  const XDeployer = await hre.ethers.getContractFactory("Multichain");
  const salt =
    "0x0000000000000000000000000000000000000000000000000000000000001011";
  console.log("salt", salt);

  await create2Deployer.deploy(0, salt, XDeployer.bytecode);
  const bytecodehash = hre.ethers.utils.keccak256(XDeployer.bytecode);
  const address = await create2Deployer.computeAddress(salt, bytecodehash);
  console.log("address", address);

  const xDeployer = await XDeployer.attach(address);
  await xDeployer.initialize("0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0");
  console.log("xDeployer", xDeployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
