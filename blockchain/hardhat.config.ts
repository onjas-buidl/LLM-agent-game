import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

// THIS IS ONLY TEST USE. DO NOT USE THIS MNEMONIC IN PRODUCTION.
// deployer: 0x6a41B628F5c620AbDa09e77ea7Ea694aC51e4D07
const DEFAULT_MNEMONIC = 'police volume sort advance pass tuna join sample chalk spend into hollow';
const mnemonic = process.env.MNEMONIC || DEFAULT_MNEMONIC;


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      }
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: mnemonic,
      }
    },
    localhost: {
      chainId: 1337,
      url: "http://127.0.0.1:8545",
    }
  },
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
};

export default config;
