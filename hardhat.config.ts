import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.6",
  networks: {
    // evmos_mainnet: {
    //   forking: {
    //     url:"",
    //   }
    // },
    // hardhat: {
    //   forking: {
    //     url: "https://grpc.bd.evmos.dev:9090",
    //     // blockNumber: 1439000
    //   }
    // }  
  },

};

export default config;
