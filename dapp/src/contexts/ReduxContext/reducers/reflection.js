import { createSlice } from "@reduxjs/toolkit";
import { convertToString, convertToInteger } from './tools'

const initialState = {
    totalShare: "",
    totalReward: "",
    totalDistributed: "",
    secsToReward: 0,
    secsNow: 0,
    rewardPeriod: 0,
    rewardedETH: "",
    unpaidETH: "",
};

const reflection = createSlice({
    name: "reflection",
    initialState,
    reducers: {
        updateTotalShare: (state, action) => {
            state.totalShare = convertToString(action.payload)
        },
        updateTotalReward: (state, action) => {
            state.totalReward = convertToString(action.payload)
        },
        updateTotalDistributed: (state, action) => {
            state.totalDistributed = convertToString(action.payload)
        },
        updateSecsToReward: (state, action) => {
            state.secsToReward = convertToInteger(action.payload)
            const t = (new Date()).getTime() / 1000
            state.secsNow =  ~~t
        },
        updateRewardPeriod: (state, action) => {
            state.rewardPeriod = convertToInteger(action.payload)
        },
        updateRewardedAmount: (state, action) => {
            state.rewardedETH = convertToString(action.payload)
        },
        updateUnpaidAmount: (state, action) => {
            state.unpaidETH = convertToString(action.payload)
        },
    },
});

export const { updateTotalShare, updateTotalReward, updateTotalDistributed, updateSecsToReward, updateRewardPeriod,
    updateRewardedAmount, updateUnpaidAmount } = reflection.actions;

export default reflection.reducer;
