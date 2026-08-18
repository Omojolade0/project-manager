import { useState, useEffect } from "react";
import taskService from "@/services/taskService";
import { useAllTasksStore } from "@/store/useAllTasksStore";

const LIMIT = 10;

export function useAllTasks({ autoFetch = false } = {}) {
  const { tasks, setTasks } = useAllTasksStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isInitialLoading = loading && tasks.length === 0;

  async function fetchTasks({ pageNum = page, sortValue = sort } = {}) {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks({
        sort: sortValue,
        page: pageNum,
        limit: LIMIT,
      });
      setTasks(response.items);
      setTotal(response.total);
      setHasMore(response.has_more);
      setPage(pageNum);
      setSort(sortValue);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function goToNextPage() {
    if (hasMore) fetchTasks({ pageNum: page + 1 });
  }

  function goToPrevPage() {
    if (page > 1) fetchTasks({ pageNum: page - 1 });
  }

  function changeSort(newSort) {
    fetchTasks({ pageNum: 1, sortValue: newSort });
  }

  useEffect(() => {
    if (!autoFetch) return;
    fetchTasks({ pageNum: 1, sortValue: sort });
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tasks,
    loading,
    isInitialLoading,
    error,
    page,
    limit: LIMIT,
    total,
    hasMore,
    sort,
    fetchTasks,
    goToNextPage,
    goToPrevPage,
    changeSort,
  };
}