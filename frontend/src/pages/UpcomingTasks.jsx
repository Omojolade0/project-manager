import Layout from "@/layouts/Layout";
import TaskCard from "@/features/tasks/TaskCard";
import TaskModal from "@/features/tasks/TaskModal";
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
        <div className="text-center py-20">
          <p className="text-sm text-slate-400 mb-4">
            {error?.response?.status === 403
              ? "You don't have permission to view this."
              : "Something went wrong."}
          </p>
          <button
            onClick={() => fetchTasks({ pageNum: 1 })}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Try again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
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
        <div className="flex gap-2 mb-6">
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
              <div
                key={i}
                className="h-28 bg-slate-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              No tasks yet
            </p>
            <p className="text-sm text-slate-400">
              Tasks across your projects will show up here
            </p>
          </div>
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