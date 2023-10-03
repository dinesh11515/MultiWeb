require("@nomicfoundation/hardhat-toolbox");
//dotenv
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
      viaIR: true,
    },
  },

  networks: {
    mumbai: {
      url: "https://endpoints.omniatech.io/v1/matic/mumbai/public",
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
    avalanche: {
      url: "https://rpc.ankr.com/avalanche_fuji",
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrum: {
      url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
      accounts: [process.env.PRIVATE_KEY],
    },
    base: {
      url: "https://base-goerli.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },

    celo: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
    },

    moonbeam: {
      url: "https://moonbase.unitedbloc.com:1000",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_API_KEY,
      optimisticGoerli: process.env.OPTIMISM_API_KEY,
      bscTestnet: process.env.BSC_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      arbitrumGoerli: process.env.ARBITRUM_API_KEY,
      avalancheFujiTestnet: process.env.AVALANCHE_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      base: process.env.BASE_API_KEY,
      celo: process.env.CELO_API_KEY,
      moonbaseAlpha: process.env.MOONBEAM_API_KEY,
    },
    customChains: [
      {
        network: "base",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org/",
        },
      },
      {
        network: "celo",
        chainId: 0xaef3,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io/",
        },
      },
    ],
  },
};
