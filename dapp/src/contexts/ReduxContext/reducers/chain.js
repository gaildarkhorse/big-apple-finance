import { createSlice } from "@reduxjs/toolkit";
import { convertToString, convertToInteger } from './tools'

const initialState = {
  chainId: 0,
  explorer: "",
  rpc: "",
};

const chain = createSlice({
  name: "chain",
  initialState,
  reducers: {
    updateChainId: (state, action) => {
      state.chainId = convertToInteger(action.payload)
    },
    updateExplorer: (state, action) => {
      state.explorer = convertToString(action.payload)
    },
    updateRPC: (state, action) => {
      state.rpc = convertToString(action.payload)
    }
  },
});

export const { updateChainId, updateExplorer, updateRPC } =
  chain.actions;

export default chain.reducer;
