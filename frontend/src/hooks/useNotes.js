import { useState, useEffect } from "react";
import noteService from "@/services/noteService";
import { useNoteStore } from "@/store/useNoteStore";

const LIMIT = 10;

export function useNotes(projectId, { autoFetch = false } = {}) {
  const { notes, setNotes, addNote, updateNote, deleteNote } = useNoteStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isInitialLoading = loading && notes.length === 0;

  async function fetchNotes(pid, pageNum = page) {
    try {
      setLoading(true);
      const response = await noteService.getNotes(pid, pageNum, LIMIT);
      setNotes(response.items);
      setTotal(response.total);
      setHasMore(response.has_more);
      setPage(pageNum);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function goToNextPage() {
    if (hasMore) fetchNotes(projectId, page + 1);
  }

  function goToPrevPage() {
    if (page > 1) fetchNotes(projectId, page - 1);
  }

  async function createNote(data) {
    try {
      setLoading(true);
      const response = await noteService.createNote(projectId, data);
      addNote(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function editNote(noteId, data) {
    try {
      setLoading(true);
      const response = await noteService.updateNote(projectId, noteId, data);
      updateNote(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function removeNote(noteId) {
    try {
      setLoading(true);
      await noteService.deleteNote(projectId, noteId);
      deleteNote(noteId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoFetch) return;
    if (!projectId) return;
    fetchNotes(projectId, 1);
  }, [projectId, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notes,
    loading,
    isInitialLoading,
    error,
    page,
    limit: LIMIT,
    total,
    hasMore,
    fetchNotes,
    goToNextPage,
    goToPrevPage,
    createNote,
    editNote,
    removeNote,
  };
}