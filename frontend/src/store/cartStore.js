// File Path: frontend/src/store/cartStore.js
import { create } from "zustand";
import api from "../lib/api";
import { toast } from "@/hooks/use-toast";
import useSweetStore from "./sweetStore"; // Import the sweet store

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  totalPrice: 0,
  isLoading: true,
  isCheckingOut: false,

  // Helper to calculate totals
  calculateTotals: (items) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.sweetId.price * item.quantity, 0);
    set({ itemCount, totalPrice });
  },

  // Fetch the cart from the backend
  getCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items || [] });
      get().calculateTotals(data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add an item to the cart
  addToCart: async (sweetId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { sweetId, quantity });
      set({ items: data.items });
      get().calculateTotals(data.items);
      toast({
        title: "Added to Cart!",
        description: `The item has been successfully added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Could not add item to cart.",
        variant: "destructive",
      });
    }
  },

  // Update item quantity
  updateItemQuantity: async (sweetId, quantity) => {
    try {
        const { data } = await api.put(`/cart/item/${sweetId}`, { quantity });
        set({ items: data.items });
        get().calculateTotals(data.items);
    } catch (error) {
        toast({
            title: "Error",
            description: error.response?.data?.message || "Could not update cart.",
            variant: "destructive",
        });
    }
  },

  // Remove an item from the cart
  removeItem: async (sweetId) => {
    try {
        const { data } = await api.delete(`/cart/item/${sweetId}`);
        set({ items: data.items });
        get().calculateTotals(data.items);
    } catch (error) {
        toast({
            title: "Error",
            description: error.response?.data?.message || "Could not remove item.",
            variant: "destructive",
        });
    }
  },

  // Checkout
  checkout: async () => {
    set({ isCheckingOut: true });
    try {
      const { data } = await api.post('/cart/checkout');
      toast({
        title: "Checkout Successful!",
        description: data.message,
      });
      set({ items: [], itemCount: 0, totalPrice: 0 });
      // **THE FIX**: After a successful checkout, trigger a refresh of the sweets data.
      useSweetStore.getState().fetchSweets(); 
      return true; // Indicate success
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: error.response?.data?.message || "An error occurred during checkout.",
        variant: "destructive",
      });
      return false; // Indicate failure
    } finally {
      set({ isCheckingOut: false });
    }
  },
  
  clearCart: () => {
    set({ items: [], itemCount: 0, totalPrice: 0 });
  }
}));

export default useCartStore;