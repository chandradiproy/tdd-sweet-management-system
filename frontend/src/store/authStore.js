// File Path: frontend/src/store/authStore.js
import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    set({ user: data, token: data.token });
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    set({ user: data, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
    delete api.defaults.headers.common["Authorization"];
  },

  // New action to update the currently logged-in user's data
  updateCurrentUser: (updatedUserData) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const newUser = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  }
}));

export default useAuthStore;
