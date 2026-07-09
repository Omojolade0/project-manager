import api from "@/api/api";

const searchService = {
  search: async (text) => {
    try {
      const response = await api.get("/search", { params: { text } });
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },
};

export default searchService;