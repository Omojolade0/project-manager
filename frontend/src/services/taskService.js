// - [ ] Add getTasks(projectId) function
// - [ ] Add createTask(projectId, data) function
// - [ ] Add updateTask(projectId, taskId, data) function
// - [ ] Add deleteTask(projectId, taskId) function

import api from "@/api/api";

const taskService = {
  getTasks: async (projectId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error("Get tasks error:", error);
      throw error;
    }
  },
  createTask: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, data);
      return response.data;
    } catch (error) {
      console.error("Create task error:", error);
      throw error;
    }
  },
  updateTask: async (projectId, taskId, data) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/tasks/${taskId}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Update task error:", error);
      throw error;
    }
  },
  deleteTask: async (projectId, taskId) => {
    try {
      const response = await api.delete(
        `/projects/${projectId}/tasks/${taskId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Delete task error:", error);
      throw error;
    }
  },
};

export default taskService;
