const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

const pkTestnet = process.env.PRIVATE_KEY_TESTNET
const pkMainnet = process.env.PRIVATE_KEY_MAINNET

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(pkTestnet, 'https://speedy-nodes-nyc.moralis.io/26ffb328f314564ec266b2f8/bsc/testnet'),
      network_id: 97,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    bsc_mainnet: {
      provider: () => new HDWalletProvider(pkMainnet, 'https://speedy-nodes-nyc.moralis.io/26ffb328f314564ec266b2f8/bsc/mainnet'),
      network_id: 56,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    bscscan: process.env.BSCSCAN_API_KEY
  }
}
