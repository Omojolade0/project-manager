// - [ ] Add login(data) function
// - [ ] Add register(data) function
// - [ ] Add getMe() function

import api from "@/api/api";

const authService = {
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default authService;
