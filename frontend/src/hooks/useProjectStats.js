import { useState, useEffect } from "react";
import projectService from "@/services/projectService";
import { useProjectStatsStore } from "@/store/useProjectStatsStore";

export function useProjectStats({ autoFetch = false } = {}) {
  const { stats, setStats } = useProjectStatsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await projectService.getStats();
      setStats(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoFetch) return;
    fetchStats();
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}