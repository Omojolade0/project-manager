// - [ ] Add getProjects() function
// - [ ] Add getProjectById(id) function
// - [ ] Add createProject(data) function
// - [ ] Add updateProject(id, data) function
// - [ ] Add deleteProject(id) function

import api from "@/api/api";

const projectService = {
  getProjects: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/projects", { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error("Get projects error:", error);
      throw error;
    }
  },
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get project error:", error);
      throw error;
    }
  },
  createProject: async (data) => {
    try {
      const response = await api.post("/projects", data);
      return response.data;
    } catch (error) {
      console.error("Create project error:", error);
      throw error;
    }
  },
  updateProject: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update project error:", error);
      throw error;
    }
  },
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
