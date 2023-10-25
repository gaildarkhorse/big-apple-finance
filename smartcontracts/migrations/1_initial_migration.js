const { setWeb3 } = require('./lib/deploy')
const { deploy_localhost } = require('./lib/localhost')

module.exports = function (deployer, network, accounts) {

  let owner = accounts[0]
  let pancakeFeeSetter = accounts[8]

  deployer.then(async () => {
    setWeb3(web3)
    
    if (network === 'development') {
      await deploy_localhost(web3, deployer, accounts, {
        owner: owner,
        pancakeFeeSetter: pancakeFeeSetter
      })
    }
  })
};
