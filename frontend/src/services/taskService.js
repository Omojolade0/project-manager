// - [ ] Add getTasks(projectId) function
// - [ ] Add createTask(projectId, data) function
// - [ ] Add updateTask(projectId, taskId, data) function
// - [ ] Add deleteTask(projectId, taskId) function

import api from "@/api/api";

const taskService = {
  getTasks: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks/`);
    return response.data;
  },
  createTask: async (projectId, data) => {
    const response = await api.post(`/projects/${projectId}/tasks/`, data);
    return response.data;
  },
  updateTask: async (projectId, taskId, data) => {
    const response = await api.put(
      `/projects/${projectId}/tasks/${taskId}/`,
      data,
    );
    return response.data;
  },
  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(
      `/projects/${projectId}/tasks/${taskId}/`,
    );
    return response.data;
  },
};

export default taskService;
