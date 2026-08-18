import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Layout from "@/layouts/Layout";
import TaskRow from "@/features/tasks/TaskRow";
import TaskModal from "@/features/tasks/TaskModal";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { useAllTasks } from "@/hooks/useAllTasks";
import taskService from "@/services/taskService";
import { ListTodo, ChevronLeft, ChevronRight } from "lucide-react";

const SORTS = [
  { value: "deadline", label: "Deadline" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "status", label: "Status" },
];

function UpcomingTasks() {
  const {
    tasks,
    isInitialLoading,
    error,
    page,
    limit,
    total,
    hasMore,
    sort,
    fetchTasks,
    changeSort,
  } = useAllTasks({ autoFetch: true });
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const activeSort = sort ?? "deadline";

  function refetch() {
    fetchTasks();
  }

  function goToTask(task) {
    navigate(`/projects/${task.project.id}`);
  }

  async function handleToggleDone(task) {
    if (task.status === "Done" || updatingId) return;
    try {
      setUpdatingId(task.id);
      await taskService.updateTask(task.project.id, task.id, { status: "Done" });
      await fetchTasks();
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  }

  if (error) {
    return (
      <Layout>
        <ErrorState
          variant="page"
          title="Couldn't load your tasks"
          message={
            error?.response?.status === 403
              ? "You don't have permission to view this."
              : "Something went wrong."
          }
          actionLabel="Retry"
          onAction={() => fetchTasks({ pageNum: 1 })}
        />
      </Layout>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <Layout>
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-section text-foreground">Upcoming Tasks</h1>
            <span className="text-caption font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {total}
            </span>
          </div>
          <TaskModal onSuccess={refetch} />
        </div>

        {/* Sort controls */}
        <div className="inline-flex flex-wrap items-center gap-1 bg-muted rounded-full p-1 mb-6">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => changeSort(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-small font-medium transition-colors",
                activeSort === s.value
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isInitialLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="list-row" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            subtext="Tasks across your projects will show up here"
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                updating={updatingId === task.id}
                onToggleDone={handleToggleDone}
                onNavigate={goToTask}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-border">
            <p className="text-small text-muted-foreground">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchTasks({ pageNum: page - 1 })}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-small font-semibold bg-card text-foreground shadow-card hover:shadow-lg transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchTasks({ pageNum })}
                    className={cn(
                      "w-9 h-9 rounded-full text-small font-semibold shadow-card transition-all",
                      pageNum === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchTasks({ pageNum: page + 1 })}
                disabled={!hasMore}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-small font-semibold bg-card text-foreground shadow-card hover:shadow-lg transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UpcomingTasks;
