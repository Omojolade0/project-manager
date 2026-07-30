import Layout from "@/layouts/Layout";
import ProjectCard from "@/features/projects/ProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { useState } from "react";
import { FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORTS = [
  { value: "updated", label: "Last updated" },
  { value: "created", label: "Date created" },
  { value: "alphabetical", label: "Alphabetical" },
];

function ProjectList() {
  const [filter, setFilter] = useState("All");
  const {
    projects,
    loading,
    error,
    page,
    total,
    hasMore,
    sort,
    fetchProjects,
    goToNextPage,
    goToPrevPage,
  } = useProjects({ autoFetch: true });

  const filters = ["All", "Active", "Completed", "Inactive"];
  const activeSort = sort ?? "updated";

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
    fetchProjects(1, { status: nextFilter === "All" ? null : nextFilter });
  }

  function changeSort(nextSort) {
    fetchProjects(1, { sort: nextSort });
  }

  if (error) {
    return (
      <Layout>
        <ErrorState
          variant="page"
          title="Couldn't load projects"
          message={
            error?.response?.status === 404
              ? "Projects not found."
              : error?.response?.status === 403
                ? "You don't have permission to view this."
                : "Something went wrong."
          }
          actionLabel="Retry"
          onAction={() => fetchProjects(1)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Projects
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {total} total
            </p>
          </div>
          <ProjectModal onSuccess={() => fetchProjects(1)} />
        </div>

        {/* Filter tabs + sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => changeFilter(f)}
                className={[
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>
          <Select value={activeSort} onValueChange={changeSort}>
            <SelectTrigger className="w-full sm:w-44 h-9 rounded-lg border-slate-200 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={filter === "All" ? "No projects yet" : `No ${filter} projects`}
            subtext={
              filter === "All"
                ? "Create your first project to get started"
                : "Try a different filter"
            }
            action={
              filter === "All" ? (
                <ProjectModal onSuccess={() => fetchProjects(1)} />
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => fetchProjects(page)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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

export default ProjectList;