import { createSlice } from '@reduxjs/toolkit'
import { convertToString, convertToInteger } from './tools'

const initialState = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,

    owner: "",
    supply: "",
    price: "",
    circulatingSupply: "",
    lastRebasedTime: 0,
    tickNow: 0,
    initRebaseTime: 0,
    rebaseRate: "",
    rebasePeriod: 0,
    balance: "",
    balanceETH: "",
    treasuryAddress: "",
    treasuryBalance: "",
    treasuryUSDC: "",
    firePitAddress: "",
    firePitBalance: "",
    insuranceReceiverAddress: "",
    insuranceReceiverUSDC: "",
    poolBalance: "",
    maxWallet: "",
    remToBuy: "",
    remToSell: "",
    isFeeExempt: false,
    ethPrice: "",
}

const token = createSlice({
    name: 'token',
    initialState,
    reducers: {
        updateAddress: (state, action) => {
            state.address = convertToString(action.payload)
        },
        updateName: (state, action) => {
            state.name = convertToString(action.payload)
        },
        updateSymbol: (state, action) => {
            state.symbol = convertToString(action.payload)
        },
        updateDecimals: (state, action) => {
            state.decimals = convertToInteger(action.payload)
        },
        updateOwner: (state, action) => {
            state.owner = convertToString(action.payload)
        },
        updateSupply: (state, action) => {
            state.supply = convertToString(action.payload)
        },
        updatePrice: (state, action) => {
            state.price = convertToString(action.payload)
        },
        updateCirculatingSupply: (state, action) => {
            state.circulatingSupply = convertToString(action.payload)
        },
        updateLastRebasedTime: (state, action) => {
            state.lastRebasedTime = convertToInteger(action.payload)
            state.tickNow = Math.floor((new Date()).getTime() / 1000)
        },
        updateInitRebaseTime: (state, action) => {
            state.initRebaseTime = convertToInteger(action.payload)
        },
        updateRebaseRate: (state, action) => {
            state.rebaseRate = convertToString(action.payload)
        },
        updateRebasePeriod: (state, action) => {
            state.rebasePeriod = convertToInteger(action.payload)
        },
        updateBalance: (state, action) => {
            state.balance = convertToString(action.payload)
        },
        updateBalanceETH: (state, action) => {
            state.balanceETH = convertToString(action.payload)
        },
        updateTreasuryAddress: (state, action) => {
            state.treasuryAddress = convertToString(action.payload)
        },
        updateTreasuryBalance: (state, action) => {
            state.treasuryBalance = convertToString(action.payload)
        },
        updateTreasuryUSDC: (state, action) => {
            state.treasuryUSDC = convertToString(action.payload)
        },
        updateFirePitAddress: (state, action) => {
            state.firePitAddress = convertToString(action.payload)
        },
        updateFirePitBalance: (state, action) => {
            state.firePitBalance = convertToString(action.payload)
        },
        updateInsuranceReceiverAddress: (state, action) => {
            state.insuranceReceiverAddress = convertToString(action.payload)
        },
        updateInsuranceReceiverUSDC: (state, action) => {
            state.insuranceReceiverUSDC = convertToString(action.payload)
        },
        updatePoolBalance: (state, action) => {
            state.poolBalance = convertToString(action.payload)
        },
        updateMaxWallet: (state, action) => {
            state.maxWallet = convertToString(action.payload)
        },
        updateRemainingToBuy: (state, action) => {
            state.remToBuy = convertToString(action.payload)
        },
        updateRemainingToSell: (state, action) => {
            state.remToSell = convertToString(action.payload)
        },
        updateFeeExempted: (state, action) => {
            state.isFeeExempt = action.payload
        },
        updateETHPrice: (state, action) => {
            state.ethPrice = convertToString(action.payload)
        },
    }
})

export const { updateAddress, updateName, updateSymbol, updateDecimals,
    updateOwner, updateSupply, updatePrice, updateCirculatingSupply,
    updateLastRebasedTime, updateInitRebaseTime, updateRebaseRate, updateRebasePeriod, updateBalance,
    updateBalanceETH, updateTreasuryAddress, updateTreasuryUSDC, updateTreasuryBalance,
    updateFirePitAddress, updateFirePitBalance, updateInsuranceReceiverAddress,
    updateInsuranceReceiverUSDC, updatePoolBalance, updateMaxWallet,
    updateRemainingToBuy, updateRemainingToSell, updateFeeExempted,
    updateETHPrice } = token.actions

export default token.reducer
