import { useState, useEffect } from "react";
import noteService from "@/services/noteService";
import { useNoteStore } from "@/store/useNoteStore";

export function useNotes(projectId) {
  const { notes, setNotes, addNote, updateNote, deleteNote } = useNoteStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchNotes(projectId) {
    try {
      setLoading(true);
      const response = await noteService.getNotes(projectId);
      setNotes(response);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  async function createNote(data) {
    try {
      const response = await noteService.createNote(projectId, data);
      addNote(response); // ← updates store directly, no refetch
      return response;
    } catch (error) {
      setError(error);
      // rethrow so UI can handle it (e.g. show toast)
    }
  }

  async function editNote(noteId, data) {
    try {
      const response = await noteService.updateNote(projectId, noteId, data);
      updateNote(response);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    }
  }

  async function removeNote(noteId) {
    try {
      await noteService.deleteNote(projectId, noteId);
      deleteNote(noteId);
    } catch (error) {
      setError(error);
      throw error;
    }
  }

  useEffect(() => {
    if (!projectId) return; // ← don't fetch if no projectId
    fetchNotes(projectId);
  }, [projectId]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    editNote,
    removeNote,
  };
}
