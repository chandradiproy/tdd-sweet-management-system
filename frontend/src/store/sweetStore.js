// File Path: frontend/src/store/sweetStore.js
import { create } from "zustand";
import api from "../lib/api";
import { toast } from "@/hooks/use-toast";

const useSweetStore = create((set) => ({
  sweets: [],
  // Add state to hold pagination data
  page: 1,
  pages: 1,
  total: 0,
  isLoading: true,

  // Pass page and limit to the fetch function
  fetchSweets: async (searchTerm = "", page = 1, limit = 8, category = "", sort = "") => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/sweets", { 
        params: { search: searchTerm, page, limit, category, sort } 
      });
      // Store the full paginated response
      set({ 
        sweets: data.sweets,
        page: data.page,
        pages: data.pages,
        total: data.total,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch sweets", error);
      toast({
        title: "Error",
        description: "Could not fetch sweets. Please try again later.",
        variant: "destructive",
      });
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
      // Refresh the current page to show the new sweet
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
      toast({
        title: "Error Adding Sweet",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  },

  updateSweet: async (sweetId, sweetData) => {
    try {
      await api.put(`/sweets/${sweetId}`, sweetData);
      toast({
        title: "Success!",
        description: `${sweetData.name} has been updated.`,
      });
      // Refresh the current page
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
       toast({
        title: "Error Updating Sweet",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  },
  
  purchaseSweet: async (sweetId, sweetName) => {
    try {
      await api.post(`/sweets/${sweetId}/purchase`);
      toast({
        title: "Purchase Successful!",
        description: `You purchased one ${sweetName}.`,
      });
      // No full refresh needed, just update the single sweet in the list
      set((state) => ({
        sweets: state.sweets.map((s) =>
          s._id === sweetId ? { ...s, quantity: s.quantity - 1 } : s
        ),
      }));
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
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
      toast({
        title: "Restock Failed",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  },

  deleteSweetById: async (sweetId) => {
    try {
      await api.delete(`/sweets/${sweetId}`);
      toast({
        title: "Success",
        description: "The sweet has been deleted.",
      });
       // After deleting, refresh the current page's data
      useSweetStore.getState().fetchSweets("", useSweetStore.getState().page);
    } catch (error) {
       toast({
        title: "Error Deleting Sweet",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  },
}));

export default useSweetStore;