import { useState, useEffect } from "react";
import taskService from "@/services/taskService";
import { useTaskStore } from "@/store/useTaskStore";

export function useTasks(projectId) {
  const { tasks, setTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchTasks(projectId) {
    try {
      setLoading(true);
      const response = await taskService.getTasks(projectId);
      setTasks(response);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(data) {
    try {
      const response = await taskService.createTask(projectId, data);
      addTask(response); // ← updates store directly, no refetch
      return response;
    } catch (error) {
      setError(error);
      throw error; // rethrow so UI can handle it (e.g. show toast)
    }
  }

  async function editTask(taskId, data) {
    try {
      const response = await taskService.updateTask(projectId, taskId, data);
      updateTask(response);
      return response;
    } catch (error) {
      console.error("Update task error:", error);
      setError(error);
      throw error;
    }
  }

  async function removeTask(taskId) {
    try {
      await taskService.deleteTask(projectId, taskId);
      deleteTask(taskId); // ← removes from store directly
    } catch (error) {
      setError(error);
      throw error; // rethrow so UI can handle it (e.g. show toast)
    }
  }

  useEffect(() => {
    if (!projectId) return; // ← don't fetch if no projectId
    fetchTasks(projectId);
  }, [projectId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    editTask,
    removeTask,
  };
}
