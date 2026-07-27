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
  searchFull: async ({ q, type = "all", page = 1, limit = 10 }) => {
    try {
      const response = await api.get("/search/full", {
        params: { q, type, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Search full error:", error);
      throw error;
    }
  },
};

export default searchService;