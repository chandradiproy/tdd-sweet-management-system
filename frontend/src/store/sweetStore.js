// File Path: frontend/src/store/sweetStore.js
import { create } from "zustand";
import api from "../lib/api";
import { toast } from 'react-hot-toast';


const useSweetStore = create((set, get) => ({
  sweets: [],
  isLoading: true,

  fetchSweets: async (searchTerm) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/sweets", { params: { search: searchTerm } });
      set({ sweets: data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch sweets", error);
      toast.error("Failed to load sweets.");
      set({ isLoading: false });
    }
  },

  purchaseSweet: async (sweetId, sweetName) => {
    try {
      const { data } = await api.post(`/sweets/${sweetId}/purchase`);
      set((state) => ({
        sweets: state.sweets.map((s) => (s._id === data._id ? data : s)),
      }));
      toast.success(`Successfully purchased ${sweetName}!`);
    } catch (error) {
       toast.error(error.response?.data?.message || 'Purchase failed.');
    }
  },
  
  restockSweet: async (sweetId, quantity, sweetName) => {
    try {
      const { data } = await api.post(`/sweets/${sweetId}/restock`, { quantity });
      set((state) => ({
        sweets: state.sweets.map((s) => (s._id === data._id ? data : s)),
      }));
      toast.success(`Restocked ${quantity} of ${sweetName}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restock failed.');
    }
  },

  // FIX: Created a dedicated addSweet function
  addSweet: async (sweetData) => {
    try {
      const { data } = await api.post('/sweets', sweetData);
      set((state) => ({ sweets: [data, ...state.sweets] }));
      toast.success(`Added "${sweetData.name}" to the inventory!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add sweet.');
    }
  },

  // FIX: Created a dedicated updateSweet function
  updateSweet: async (sweetId, sweetData) => {
    try {
      const { data } = await api.put(`/sweets/${sweetId}`, sweetData);
      set((state) => ({
        sweets: state.sweets.map((s) => (s._id === data._id ? data : s)),
      }));
       toast.success(`Updated "${sweetData.name}"!`);
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to update sweet.');
    }
  },

  deleteSweetById: async (sweetId) => {
    try {
      await api.delete(`/sweets/${sweetId}`);
      set((state) => ({
        sweets: state.sweets.filter((s) => s._id !== sweetId),
      }));
      toast.success('Sweet has been deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete sweet.');
    }
  },
}));

export default useSweetStore;
