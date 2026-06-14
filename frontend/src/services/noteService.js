// getNotes

// createNote

// updateNote

// deleteNote
import api from "@/api/api";

const noteService = {
  getNotes: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/notes`);
      return response.data;
    } catch (error) {
      console.error("Get notes error:", error);
      throw error;
    }
  },
  createNote: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/notes`, data);
      return response.data;
    } catch (error) {
      console.error("Create note error:", error);
      throw error;
    }
  },
  updateNote: async (projectId, noteId, data) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/notes/${noteId}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Update note error:", error);
      throw error;
    }
  },
  deleteNote: async (projectId, noteId) => {
    try {
      const response = await api.delete(
        `/projects/${projectId}/notes/${noteId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Delete note error:", error);
      throw error;
    }
  },
};

export default noteService;
