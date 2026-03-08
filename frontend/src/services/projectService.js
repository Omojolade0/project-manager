// - [ ] Add getProjects() function
// - [ ] Add getProjectById(id) function
// - [ ] Add createProject(data) function
// - [ ] Add updateProject(id, data) function
// - [ ] Add deleteProject(id) function

import api from "./api";

const projectService = {
  getProjects: async () => {
    const response = await api.get("/projects/");
    return response.data;
  },
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },
  createProject: async (data) => {
    const response = await api.post("/projects/", data);
    return response.data;
  },
  updateProject: async (id, data) => {
    const response = await api.put(`/projects/${id}/`, data);
    return response.data;
  },
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}/`);
    return response.data;
  },
};

export default projectService;
