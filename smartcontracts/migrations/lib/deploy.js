var ABI = require('ethereumjs-abi')
var fs = require('fs');

let web3Inst;

const setWeb3 = (web3) => {
    web3Inst = web3
}

const syncDeployInfo = (_network, _name, _info, _total) => {
    _total = [..._total.filter(t => t.name !== _name), _info];
    fs.writeFileSync(`migrations/deploy-${_network}.json`, JSON.stringify(_total));
    return _total;
}

const buildCallData = (functionName, types, values) => {
    var methodID = ABI.methodID(functionName, types);

    var encoded = buildEncodedData(types, values)

    return methodID.toString('hex') + encoded;
}

const buildEncodedData = (types, values) => {
    var encoded = web3Inst.eth.abi.encodeParameters(types, values);
    if (encoded.slice(0, 2) === '0x') {
        encoded = encoded.slice(2);
    }
    return encoded;

    var encoded = ABI.rawEncode(types, values);
    return encoded.toString('hex');
}

const deployContract = async (deployer, name, ContractImpl, ...args) => {
    await deployer.deploy(ContractImpl, ...args);
    let cImpl = await ContractImpl.deployed();
    let cImplAddress = cImpl.address;

    // console.log(`${name} contract:`, cImplAddress);

    return {
        name: name,
        imple: cImplAddress
    }
}

const deployContractAndProxy = async (deployer, name, ContractImpl, ContractProxy, admin, initializer, types, values, impleWriter) => {
    let cImplAddress
    if (typeof ContractImpl === "string") {
        cImplAddress = ContractImpl
    } else {
        await deployer.deploy(ContractImpl)
        let cImpl = await ContractImpl.deployed()
        cImplAddress = cImpl.address

        if (impleWriter) {
            impleWriter(cImplAddress)
        }
    }

    let proxyConstructorParam = buildCallData(initializer, types, values);

    await deployer.deploy(ContractProxy, cImplAddress, admin, "0x" + proxyConstructorParam);
    let cProxy = await ContractProxy.deployed();
    let cProxyAddress = cProxy.address;

    let cProxyConstructParams = buildEncodedData(["address", "address", "bytes"], [
        cImplAddress, admin, Buffer.from(proxyConstructorParam, "hex")
    ])

    // console.log(`${name} contract:`, cImplAddress);
    // console.log(`${name} proxy:`, cProxyAddress);
    // console.log(`${name} proxy constructor params:`, cProxyConstructParams);

    return {
        name: name,
        imple: cImplAddress,
        proxy: cProxyAddress,
        params: cProxyConstructParams
    }
}

const getProxyParam = async (name, initializer, types, values) => {
    let proxyConstructorParam = buildCallData(initializer, types, values);
    return {
        name: name,
        calldata: proxyConstructorParam
    }
}

module.exports = { setWeb3, syncDeployInfo, deployContract, deployContractAndProxy, getProxyParam, buildEncodedData};
