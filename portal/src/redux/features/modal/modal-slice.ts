import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addModal: {
    isOpen: false,
    modalId: null,
    data: null,
  },
  editModal: {
    isOpen: false,
    modalId: null,
    data: null,
  },

  viewModal: {
    isOpen: false,
    modalId: null,
    data: null,
  },
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openAddModal(state, action) {
      state.addModal.isOpen = true;
      state.addModal.modalId = action.payload.modalId;
      state.addModal.data = action.payload.data;
    },
    openEditModal(state, action) {
      state.editModal.isOpen = true;
      state.editModal.modalId = action.payload.modalId;
      state.editModal.data = action.payload.data;
    },
    updateEditModalData(state, action) {
      state.editModal.data = action.payload.data;
    },
    closeAddModal(state) {
      state.addModal.isOpen = false;
      state.addModal.modalId = null;
      state.addModal.data = null;
    },
    closeEditModal(state) {
      state.editModal.isOpen = false;
      state.editModal.modalId = null;
      state.editModal.data = null;
    },
    openViewModal(state, action) {
      state.viewModal.isOpen = true;
      state.viewModal.modalId = action.payload.modalId;
      state.viewModal.data = action.payload.data;
    },
    closeViewModal(state) {
      state.viewModal.isOpen = false;
      state.viewModal.modalId = null;
      state.viewModal.data = null;
    },
  },
});

export const {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
  closeViewModal,
  openViewModal,
  updateEditModalData,
} = modalSlice.actions;

export default modalSlice;
