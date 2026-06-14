import api from "@/api/api";

const intelligenceService = {
  generateTasks: async (project_id, data) => {
    try {
      const response = await api.post(
        `/projects/${project_id}/intelligence/generate-tasks`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Generate tasks error:", error);
      throw error;
    }
  },
};

export default intelligenceService;
