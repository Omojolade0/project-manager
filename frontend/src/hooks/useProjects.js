import { useState, useEffect } from "react";
import projectService from "@/services/projectService";
import { useProjectStore } from "@/store/useProjectStore";

export function useProjects() {
  const { projects, setProjects, addProject, updateProject, deleteProject } =
    useProjectStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  async function fetchProjects() {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(response);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }
  async function fetchProjectById(id) {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(id);
      setSelectedProject(response);
      return response;
    } catch (error) {
      setError(error);
      // rethrow so UI can handle it (e.g. show toast)
    } finally {
      setLoading(false);
    }
  }

  async function createProject(data) {
    try {
      const response = await projectService.createProject(data);
      addProject(response); // ← updates store directly, no refetch
      return response;
    } catch (error) {
      setError(error);
      // rethrow so UI can handle it (e.g. show toast)
    }
  }

  async function editProject(id, data) {
    try {
      const response = await projectService.updateProject(id, data);
      updateProject(response); // ← updates store directly
      return response;
    } catch (error) {
      setError(error);
      // rethrow so UI can handle it (e.g. show toast)
    }
  }

  async function removeProject(id) {
    try {
      await projectService.deleteProject(id);
      deleteProject(id); // ← removes from store directly
    } catch (error) {
      setError(error); // rethrow so UI can handle it (e.g. show toast)
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    editProject,
    removeProject,
  };
}
