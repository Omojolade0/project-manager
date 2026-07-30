import Layout from "@/layouts/Layout";
import TaskCard from "@/features/tasks/TaskCard";
import TaskModal from "@/features/tasks/TaskModal";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { useAllTasks } from "@/hooks/useAllTasks";
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
    loading,
    error,
    page,
    total,
    hasMore,
    sort,
    fetchTasks,
    goToNextPage,
    goToPrevPage,
    changeSort,
  } = useAllTasks({ autoFetch: true });

  const activeSort = sort ?? "deadline";

  function refetch() {
    fetchTasks();
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

  return (
    <Layout>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Upcoming Tasks
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {total} total, across all your projects
            </p>
          </div>
          <TaskModal onSuccess={refetch} />
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => changeSort(s.value)}
              className={[
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeSort === s.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            subtext="Tasks across your projects will show up here"
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={task.project.id}
                project={task.project}
                onChange={refetch}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-center gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={goToPrevPage}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-400">Page {page}</span>
            <button
              onClick={goToNextPage}
              disabled={!hasMore}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UpcomingTasks;