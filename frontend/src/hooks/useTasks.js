import { useState, useEffect } from "react";
import taskService from "@/services/taskService";
import { useTaskStore } from "@/store/useTaskStore";

const LIMIT = 10;

export function useTasks(projectId, { autoFetch = false } = {}) {
  const { tasks, setTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState(null);
  const [sort, setSort] = useState(null);

  async function fetchTasks(
    pid,
    pageNum = page,
    { status: statusValue = status, sort: sortValue = sort } = {},
  ) {
    try {
      setLoading(true);
      const response = await taskService.getTasks(pid, pageNum, LIMIT, {
        status: statusValue,
        sort: sortValue,
      });
      setTasks(response.items);
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
    if (hasMore) fetchTasks(projectId, page + 1);
  }

  function goToPrevPage() {
    if (page > 1) fetchTasks(projectId, page - 1);
  }

  async function createTask(data) {
    try {
      const response = await taskService.createTask(projectId, data);
      addTask(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }

  async function editTask(taskId, data) {
    try {
      const response = await taskService.updateTask(projectId, taskId, data);
      updateTask(response);
      return response;
    } catch (err) {
      console.error("Update task error:", err);
      setError(err);
      throw err;
    }
  }

  async function removeTask(taskId) {
    try {
      await taskService.deleteTask(projectId, taskId);
      deleteTask(taskId);
    } catch (err) {
      setError(err);
      throw err;
    }
  }

  async function reorderTasks(columns) {
    try {
      const response = await taskService.reorderTasks(projectId, columns);
      return response;
    } catch (err) {
      console.error("Reorder tasks error:", err);
      throw err;
    }
  }

  useEffect(() => {
    if (!autoFetch) return;
    if (!projectId) return;
    fetchTasks(projectId, 1);
  }, [projectId, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tasks,
    loading,
    error,
    page,
    total,
    hasMore,
    status,
    sort,
    fetchTasks,
    goToNextPage,
    goToPrevPage,
    createTask,
    editTask,
    removeTask,
    reorderTasks,
  };
}