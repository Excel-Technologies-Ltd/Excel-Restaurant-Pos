import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  sidebarOpen: true,
};

// Create a slice
const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarOpen(state, action) {
      state.sidebarOpen = action ? action?.payload : !state.sidebarOpen;
      // state.sidebarOpen = action.payload;
    },
  },
});

// Export actions
export const { setSidebarOpen } = sidebarSlice.actions;

// Export reducer
export default sidebarSlice.reducer;
