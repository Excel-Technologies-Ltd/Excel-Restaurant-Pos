// modalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rightModalOpen: false,
};

const foodsModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openRightModal: (state) => {
      state.rightModalOpen = true;
    },
    closeRightModal: (state) => {
      state.rightModalOpen = false;
    },
  },
});

export const { openRightModal, closeRightModal } = foodsModalSlice.actions;
export default foodsModalSlice.reducer;
