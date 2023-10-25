var fs = require('fs')
const BN = require('bignumber.js')

const { syncDeployInfo, deployContract, deployContractAndProxy } = require('./deploy')
const { addressZero, addressDead, bytes32Zero, maxUint256,
  WBNB, PancakeRouter, PancakeFactory, 
  DividendDistributor, Nova } = require('./const')

const deploy_localhost = async (web3, deployer, accounts, specialAccounts) => {
    let network = 'localhost'
    const { owner, pancakeFeeSetter } = specialAccounts

    let totalRet = []
    try {
      let readInfo = fs.readFileSync(`migrations/deploy-${network}.json`);
      totalRet = JSON.parse(readInfo);
    } catch(err) {
      console.log(`${err.message}`);
    }
    // console.log(totalRet);

    let wbnbInfo = totalRet.find(t => t.name === "WBNB")
    let factoryInfo = totalRet.find(t => t.name === "PancakeFactory")
    let routerInfo = totalRet.find(t => t.name === "PancakeRouter")

    let reflectionInfo = totalRet.find(t => t.name === "DividendDistributor")
    let tokenInfo = totalRet.find(t => t.name === "Nova")

    wbnbInfo = await deployContract(deployer, "WBNB", WBNB)
    totalRet = syncDeployInfo(network, "WBNB", wbnbInfo, totalRet)

    factoryInfo = await deployContract(deployer, "PancakeFactory", PancakeFactory, pancakeFeeSetter)
    totalRet = syncDeployInfo(network, "PancakeFactory", factoryInfo, totalRet)

    routerInfo = await deployContract(deployer, "PancakeRouter", PancakeRouter, factoryInfo.imple, wbnbInfo.imple)
    totalRet = syncDeployInfo(network, "PancakeRouter", routerInfo, totalRet)

    let routerContract = await PancakeRouter.at(routerInfo.imple)
    let factoryContract = await PancakeFactory.at(factoryInfo.imple)

    let wethAddr = await routerContract.WETH()
    console.log('WETH:', wethAddr)

    console.log("Pancake Factory Pair HASH:", await factoryContract.INIT_CODE_PAIR_HASH())

    tokenInfo = await deployContract(deployer, "Nova", Nova, "Nova Test", "$NVT", routerInfo.imple, accounts[5], accounts[6], accounts[7], accounts[8], accounts[9])
    totalRet = syncDeployInfo(network, "Nova", tokenInfo, totalRet)

    reflectionInfo = await deployContract(deployer, "DividendDistributor", DividendDistributor, tokenInfo.imple)
    totalRet = syncDeployInfo(network, "DividendDistributor", reflectionInfo, totalRet)

    const tokenContract = await Nova.at(tokenInfo.imple)
    await tokenContract.setDistributor(reflectionInfo.imple)
    await tokenContract.setETHRewardEnabled(true)
    await tokenContract.setAutoRebase(false)

    const reflectionContract = await DividendDistributor.at(reflectionInfo.imple)
    await reflectionContract.setExempt(
      [
        await tokenContract.treasuryReceiver(),
        await tokenContract.autoLiquidityReceiver(),
        await tokenContract.insuranceFundReceiver(),
        await tokenContract.firePit(),
        tokenContract.address,
        await tokenContract.pair(),
        await tokenContract.owner(),
        addressZero,
        addressDead,
      ], true)
}

module.exports = { deploy_localhost }
