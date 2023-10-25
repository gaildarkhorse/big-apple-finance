const Web3 = require('web3')
const fs = require('fs')
const BN = require('bignumber.js')
const pvkey = fs.readFileSync('.secret').toString().trim();

const PBUSD = require('../build/contracts/PBUSD.json')
const PriceStabilizerUpgradeable = require('../build/contracts/PriceStabilizerUpgradeable.json')
const FeeDistributorUpgradeable = require('../build/contracts/FeeDistributorUpgradeable.json')
const StarLinkSatellite = require('../build/contracts/StarLinkSatellite.json')
const StarLinkSatelliteNodeManager = require('../build/contracts/StarLinkSatelliteNodeManager.json')
const vStarLinkSatellite = require('../build/contracts/vStarLinkSatellite.json')
const StarLinkSatellitePresale = require('../build/contracts/StarLinkSatellitePresale.json')
const PancakeRouter = require('../build/contracts/PancakeRouter.json')
const PancakePair = require('../build/contracts/PancakePair.json')
const PancakeFactory = require('../build/contracts/PancakeFactory.json')

let web3; // = new Web3(chainData.rpcUrls[0]);
let deployParams;
let chainIdNumber;
let jsonPath;
let network = '';
let runMode = '';

const getContract = async (abi, address) => {
    return await new web3.eth.Contract(abi, address);
}

const queryContract = async (tx) => {
    return await tx.call()
}

const executeContract1 = async (contractAddress, tx) => {
//   const networkId = await web3.eth.net.getId();
//   {
//     address: '0x8f4DF07B38E5203eb81Ab4C523DeEAb0AC1f2749',
//     privateKey: '0x76d7....c21d',
//     signTransaction: [Function: signTransaction],
//     sign: [Function: sign],
//     encrypt: [Function: encrypt]
//   }
  const address = await web3.eth.accounts.privateKeyToAccount(pvkey).address;
  const gas = await tx.estimateGas({from: address});
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce, 
      chainId: chainIdNumber
    },
    pvkey
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  // console.log(`Transaction hash: ${receipt.transactionHash}`);
  return receipt;
}

const executeContract2 = async (contractAddress, tx) => {
    // const networkId = await web3.eth.net.getId();
    await web3.eth.accounts.wallet.add(pvkey);

    const address = await web3.eth.accounts.privateKeyToAccount(pvkey).address;
    const gas = await tx.estimateGas({from: address});
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const txData = {
        from: address,
        to: contractAddress,
        data: data,
        gas,
        gasPrice,
        nonce, 
        chainId: chainIdNumber
    };

    const receipt = await web3.eth.sendTransaction(txData);
    // console.log(`Transaction hash: ${receipt.transactionHash}`);
    return receipt;
}

const executeContract = async (contractAddress, tx) => {
  try {
    return await executeContract1(contractAddress, tx);
  } catch (err) {
    console.log(err.message)
  }
}

const parseArguments = async () => {
  let i
  let args = process.argv

  for (i = 0; i < args.length; i ++) {
    if (args[i] === '--network') {
      if (i < args.length - 1) {
        network = args[i + 1]
        i ++
      }
    } else if (args[i] === '--run') {
      if (i < args.length - 1) {
        runMode = args[i + 1]
        i ++
      }
    }
  }

  const networkTable = {
    bscmainnet: {
      rpc: 'https://bsc-dataseed.binance.org/',
      privateKey: pvkey,
      chainId: 56,
      blockExplorer: 'https://bscscan.com/'
    },
    bsctestnet: {
      rpc: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
      privateKey: pvkey,
      chainId: 97,
      blockExplorer: 'https://testnet.bscscan.com/'
    }
  }

  let conf = networkTable[network]

  if (conf?.rpc) {
    web3 = new Web3(conf.rpc)
    await web3.eth.accounts.wallet.add(conf.privateKey)
    chainIdNumber = conf.chainId

    const address = await web3.eth.accounts.privateKeyToAccount(pvkey).address;
    console.log(`Loading web3 with ${conf.rpc}, adding address ${address}`)

    jsonPath = `../migrations/deploy-${network}.json`
    deployParams = require(jsonPath);
  } else {
    console.log('undefined network')
    console.log('#> node scripts/configure.js --network bsctestnet')
    process.exit(1)
  }
}

let syncDeployInfo = (_name, _info, _total) => {
  _total = [..._total.filter(t => t.name !== _name), _info];
  fs.writeFileSync(`migrations/deploy-${network}.json`, JSON.stringify(_total));
  return _total;
}

const configure = async () => {
  let pbusdInfo = deployParams.find(t => t.name === "PBUSD")
  let pricerInfo = deployParams.find(t => t.name === "PriceStabilizerUpgradeable")
  let busdDistInfo = deployParams.find(t => t.name === "FeeDistributorUpgradeable")
  let slsTokenInfo = deployParams.find(t => t.name === "StarLinkSatellite")
  let slsNodeManagerInfo = deployParams.find(t => t.name === "StarLinkSatelliteNodeManager")
  let vSlsTokenInfo = deployParams.find(t => t.name === "vStarLinkSatellite")
  let slsPresaleInfo = deployParams.find(t => t.name === "StarLinkSatellitePresale")
  let routerInfo = deployParams.find(t => t.name === "PancakeRouter")

  let pbusd = await getContract(PBUSD.abi, pbusdInfo.imple)
  let pricer = await getContract(PriceStabilizerUpgradeable.abi, pricerInfo.proxy)
  let busdDistributor = await getContract(FeeDistributorUpgradeable.abi, busdDistInfo.proxy)
  let slsToken = await getContract(StarLinkSatellite.abi, slsTokenInfo.proxy)
  let slsNodeManager = await getContract(StarLinkSatelliteNodeManager.abi, slsNodeManagerInfo.proxy)
  let vSlsToken = await getContract(vStarLinkSatellite.abi, vSlsTokenInfo.proxy)
  let slsPresale = await getContract(StarLinkSatellitePresale.abi, slsPresaleInfo.proxy)
  let router = await getContract(PancakeRouter.abi, routerInfo.imple)

  let factoryAddress = await router.methods.factory().call()
  let factory = await getContract(PancakeFactory.abi, factoryAddress)

  let pairAddress = await slsToken.methods.uniswapV2Pair().call()
  let pair = await getContract(PancakePair.abi, pairAddress)

  let feeRx1 = '0x4Ce5CD0718948701951eDBEe9ff2B1CA87cbeE7c'
  let feeRx2 = '0xd35045c3AFfEea18fd2F6AA0c3060D9108B1963a'

  let busdShare1 = 8000
  let busdShare2 = 2000

  let OneToken = BN('1e18')

  const initializeContracts = async () => {
    console.log('Initializing Price Stabilizer(Treasury)')
    await executeContract(pricer._address, pricer.methods.updateTargetToken(slsToken._address))
    
    console.log('Initializing BUSD distributor')
    await executeContract(busdDistributor._address, busdDistributor.methods.updateFeeAddresses([feeRx1, feeRx2]))
    await executeContract(busdDistributor._address, busdDistributor.methods.updateFeeShares([busdShare1, busdShare2]))

    console.log('Initializing GSLS token')
    await executeContract(slsToken._address, slsToken.methods.updateBUSDDistributor(busdDistributor._address))
    await executeContract(slsToken._address, slsToken.methods.setDistributionThreshold(BN("100").times(OneToken)))
    await executeContract(slsToken._address, slsToken.methods.setNodeManagerAddr(slsNodeManager._address))

    console.log('Initializing GSLS Node Manager')
    await executeContract(slsNodeManager._address, slsNodeManager.methods.setPromoToken(vSlsToken._address))
    await executeContract(slsNodeManager._address, slsNodeManager.methods.setTokenAddr(slsToken._address))
    await executeContract(slsNodeManager._address, slsNodeManager.methods.setNodePriceOriginal(BN("10").times(OneToken)))
    await executeContract(slsNodeManager._address, slsNodeManager.methods.setNodePricePromotional(BN("10").times(OneToken)))

    console.log('Initializing vGSLS token')
    await executeContract(vSlsToken._address, vSlsToken.methods.enableMinter(slsPresale._address, true));
    await executeContract(vSlsToken._address, vSlsToken.methods.enableBurner(slsNodeManager._address, true));

    console.log('Initializing presale')
    await executeContract(slsPresale._address, slsPresale.methods.updateVTokenPrice(BN("12500000000")));

    console.log('You should deposit some BUSD to price stabilizer(treasury) contract')

    let pair = {
      name: "PancakePair",
      imple: await queryContract(slsToken.methods.uniswapV2Pair())
    }
    deployParams = syncDeployInfo("PancakePair", pair, deployParams)
  }

  await initializeContracts()

  console.log('Done!')
}

const stabilize = async () => {
  let pricerInfo = deployParams.find(t => t.name === "PriceStabilizerUpgradeable")
  let slsTokenInfo = deployParams.find(t => t.name === "StarLinkSatellite")

  let pricer = await getContract(PriceStabilizerUpgradeable.abi, pricerInfo.proxy)
  let slsToken = await getContract(StarLinkSatellite.abi, slsTokenInfo.proxy)

  const updateContracts = async () => {
    console.log('Setting price range')
    await executeContract(pricer._address, pricer.methods.updatePriceRange(26000000000, 24000000000))
    await executeContract(slsToken._address, slsToken.methods.enablePriceStabilizing(true))
  }

  await updateContracts()

  console.log('Done!')
}

const main = async () => {
  await parseArguments()

  if (runMode === 'configure') {
    await configure()
  } else if (runMode === 'stabilize') {
    await stabilize()
  }
}

main()