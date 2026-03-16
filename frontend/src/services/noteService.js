// getNotes

// createNote

// updateNote

// deleteNote
import api from "@/api/api";

const noteService = {
  getNotes: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/notes/`);
    return response.data;
  },
  createNote: async (projectId, data) => {
    const response = await api.post(`/projects/${projectId}/notes/`, data);
    return response.data;
  },
  updateNote: async (projectId, noteId, data) => {
    const response = await api.put(
      `/projects/${projectId}/notes/${noteId}/`,
      data,
    );
    return response.data;
  },
  deleteNote: async (projectId, noteId) => {
    const response = await api.delete(
      `/projects/${projectId}/notes/${noteId}/`,
    );
    return response.data;
  },
};

export default noteService;
