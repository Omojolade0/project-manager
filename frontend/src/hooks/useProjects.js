import { useState, useEffect } from "react";
import projectService from "@/services/projectService";
import { useProjectStore } from "@/store/useProjectStore";

const LIMIT = 10;

export function useProjects({ autoFetch = false } = {}) {
  const { projects, setProjects, addProject, updateProject, deleteProject } =
    useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState(null);
  const [sort, setSort] = useState(null);

  async function fetchProjects(
    pageNum = page,
    { status: statusValue = status, sort: sortValue = sort } = {},
  ) {
    try {
      setLoading(true);
      const response = await projectService.getProjects(pageNum, LIMIT, {
        status: statusValue,
        sort: sortValue,
      });
      setProjects(response.items);
      setTotal(response.total);
      setHasMore(response.has_more);
      setPage(pageNum);
      setStatus(statusValue);
      setSort(sortValue);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function goToNextPage() {
    if (hasMore) fetchProjects(page + 1);
  }

  function goToPrevPage() {
    if (page > 1) fetchProjects(page - 1);
  }

  async function fetchProjectById(id) {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(id);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createProject(data) {
    try {
      setLoading(true);
      const response = await projectService.createProject(data);
      addProject(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function editProject(id, data) {
    try {
      setLoading(true);
      const response = await projectService.updateProject(id, data);
      updateProject(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function removeProject(id) {
    try {
      await projectService.deleteProject(id);
      deleteProject(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  }

  useEffect(() => {
    if (!autoFetch) return;
    fetchProjects(1);
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    projects,
    loading,
    error,
    page,
    total,
    hasMore,
    status,
    sort,
    fetchProjects,
    goToNextPage,
    goToPrevPage,
    fetchProjectById,
    createProject,
    editProject,
    removeProject,
  };
}