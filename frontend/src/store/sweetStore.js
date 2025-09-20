// File Path: frontend/src/store/sweetStore.js
import { create } from "zustand";
import api from "../lib/api";
import { toast } from "@/hooks/use-toast";

const handleApiError = (error, title) => {
  let description = "An unexpected error occurred.";
  if (error.response?.data?.errors) {
    description = error.response.data.errors.map(e => e.msg).join('\n');
  } else if (error.response?.data?.message) {
    description = error.response.data.message;
  }
  toast({
    title: title,
    description: description,
    variant: "destructive",
  });
};

const useSweetStore = create((set) => ({
  sweets: [],
  page: 1,
  pages: 1,
  total: 0,
  isLoading: true,

  fetchSweets: async (searchTerm = "", page = 1, limit = 8, category = "", sort = "") => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/sweets", { 
        params: { search: searchTerm, page, limit, category, sort } 
      });
      set({ 
        sweets: data.sweets,
        page: data.page,
        pages: data.pages,
        total: data.total,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch sweets", error);
      handleApiError(error, "Error Fetching Sweets");
      set({ isLoading: false });
    }
  },

  addSweet: async (sweetData) => {
    try {
      await api.post('/sweets', sweetData);
      toast({
        title: "Success!",
        description: `${sweetData.name} has been added to the inventory.`,
      });
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
      handleApiError(error, "Error Adding Sweet");
    }
  },

  updateSweet: async (sweetId, sweetData) => {
    try {
      await api.put(`/sweets/${sweetId}`, sweetData);
      toast({
        title: "Success!",
        description: `${sweetData.name} has been updated.`,
      });
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
       handleApiError(error, "Error Updating Sweet");
    }
  },
  
  purchaseSweet: async (sweetId, sweetName) => {
    try {
      await api.post(`/sweets/${sweetId}/purchase`);
      toast({
        title: "Purchase Successful!",
        description: `You purchased one ${sweetName}.`,
      });
      set((state) => ({
        sweets: state.sweets.map((s) =>
          s._id === sweetId ? { ...s, quantity: s.quantity - 1 } : s
        ),
      }));
    } catch (error) {
      handleApiError(error, "Purchase Failed");
    }
  },
  
  restockSweet: async (sweetId, quantity, sweetName) => {
    try {
      const { data } = await api.post(`/sweets/${sweetId}/restock`, { quantity });
      toast({
        title: "Restock Successful!",
        description: `Added ${quantity} to ${sweetName}. New total: ${data.quantity}.`,
      });
       set((state) => ({
        sweets: state.sweets.map((s) => (s._id === sweetId ? data : s)),
      }));
    } catch (error) {
      handleApiError(error, "Restock Failed");
    }
  },

  deleteSweetById: async (sweetId) => {
    try {
      await api.delete(`/sweets/${sweetId}`);
      toast({
        title: "Success",
        description: "The sweet has been deleted.",
      });
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
       handleApiError(error, "Error Deleting Sweet");
    }
  },
}));

export default useSweetStore;