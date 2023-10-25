/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

 const HDWalletProvider = require('@truffle/hdwallet-provider');
 const fs = require('fs');
 const pvKey = fs.readFileSync(".secret").toString().trim();
 const mnemonicTest = "dice off awake occur broken hamster play elegant vague obtain below tackle";

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */



  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
     development: {
      provider: () => new HDWalletProvider(mnemonicTest, `http://127.0.0.1:8545`),
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      timeoutBlocks: 9999999,

     },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }

    bsctestnet: {
      provider: () => new HDWalletProvider(pvKey, `https://data-seed-prebsc-1-s3.binance.org:8545/`), //`https://data-seed-prebsc-1-s1.binance.org:8545/`
      network_id: 97,   // This network is yours, in the cloud.
      production: true,    // Treats this network as if it was a public net. (default: false)
      timeoutBlocks: 9999999,
      skipDryRun: true
    },

    bscmainnet: {
      provider: () => new HDWalletProvider(pvKey, `https://bsc-dataseed.binance.org/`),
      network_id: 56,   // This network is yours, in the cloud.
      production: true,    // Treats this network as if it was a public net. (default: false)
      timeoutBlocks: 9999999,
      skipDryRun: true
    },

    ethereum: {
      provider: () => new HDWalletProvider(pvKey, `https://mainnet.infura.io/v3/7535811d19b1410e98c261fbb638651a`),
      network_id: 1,   // This network is yours, in the cloud.
      production: true,    // Treats this network as if it was a public net. (default: false)
      timeoutBlocks: 9999999,
      skipDryRun: true
    },

    goerli: {
      provider: () => new HDWalletProvider(pvKey, `https://eth-goerli.g.alchemy.com/v2/NIZ86SMaasaawNVp7cEDm0LhVAcjv3uo`),
      network_id: 5,   // This network is yours, in the cloud.
      production: true,    // Treats this network as if it was a public net. (default: false)
      timeoutBlocks: 9999999,
      skipDryRun: true
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 10000000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.16",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows: 
  // $ truffle migrate --reset --compile-all
  //
  // db: {
    // enabled: false,
    // host: "127.0.0.1",
    // adapter: {
    //   name: "sqlite",
    //   settings: {
    //     directory: ".db"
    //   }
    // }
  // }

  dashboard: {
    port: 25012,
    host: "localhost"
  },

  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys : {
    bscscan : "JAKBSWZ3IT7ZF7EF3EZPWN7HPKEHXPJMVE"
  }
};
