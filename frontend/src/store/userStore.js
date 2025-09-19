// File Path: frontend/src/store/userStore.js
import { create } from "zustand";
import api from "../lib/api";
import { toast } from "@/hooks/use-toast";
import useAuthStore from "./authStore"; // Import the auth store

const useUserStore = create((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/users");
      set({ users: data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Users",
        description: error.response?.data?.message || "Could not retrieve user data.",
      });
      set({ isLoading: false });
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role });
      set((state) => ({
        users: state.users.map((u) => (u._id === userId ? { ...u, role: data.role } : u)),
      }));

      // **THE FIX**: Check if the updated user is the current user
      const { user, updateCurrentUser } = useAuthStore.getState();
      if (user && user._id === userId) {
        updateCurrentUser({ role: data.role });
      }

      toast({ title: "Success", description: "User role updated successfully!" });
      return data;
    } catch (error) {
      console.error("Failed to update user role", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update user role.",
      });
      throw error;
    }
  },
}));

export default useUserStore;

