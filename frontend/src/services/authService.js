// - [ ] Add login(data) function
// - [ ] Add register(data) function
// - [ ] Add getMe() function

import api from "@/api/api";

const authService = {
  login: async (data) => {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get me error:", error);
      throw error;
    }
  },
  updateMe: async (data) => {
    try {
      const response = await api.put("/auth/me", data);
      return response.data;
    } catch (error) {
      console.error("Update me error:", error);
      throw error;
    }
  },
  deleteMe: async () => {
    try {
      const response = await api.delete("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Delete me error:", error);
      throw error;
    }
  },
};

export default authService;
