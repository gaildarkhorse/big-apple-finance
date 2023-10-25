const BN = require('bignumber.js')

const addressZero = '0x0000000000000000000000000000000000000000'
const addressDead = '0x000000000000000000000000000000000000dEaD'
const bytes32Zero = '0x0000000000000000000000000000000000000000000000000000000000000000'
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const WBNB = artifacts.require("WBNB")
const PancakeRouter = artifacts.require("PancakeRouter")
const PancakeFactory = artifacts.require("PancakeFactory")
const PancakePair = artifacts.require("PancakePair")

const DividendDistributor = artifacts.require('DividendDistributor')
const Nova = artifacts.require('Nova')

module.exports = {
    addressZero, addressDead, bytes32Zero, maxUint256,
    WBNB, PancakeRouter, PancakeFactory, PancakePair,
    DividendDistributor, Nova
};
