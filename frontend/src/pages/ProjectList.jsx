import Layout from "@/layouts/Layout";
import DashboardProjectCard from "@/features/projects/DashboardProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { useState, useEffect } from "react";
import { FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStatusCounts } from "@/hooks/useProjectStatusCounts";
import { getPageNumbers, ELLIPSIS } from "@/lib/pagination";
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

const FILTERS = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Inactive", label: "Inactive" },
];

function ProjectList() {
  const [filter, setFilter] = useState("All");
  const {
    projects,
    isInitialLoading,
    error,
    page,
    limit,
    total,
    hasMore,
    sort,
    fetchProjects,
  } = useProjects({ autoFetch: true });
  const { counts, fetchCounts } = useProjectStatusCounts();

  const activeSort = sort ?? "updated";

  useEffect(() => {
    fetchCounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function refetchAll() {
    fetchProjects(1);
    fetchCounts();
  }

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

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-page-title text-foreground">Projects</h1>
            <span className="text-caption font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {counts.All ?? total}
            </span>
          </div>
          <p className="text-small text-muted-foreground mt-1">
            {counts.All ?? total} projects · {counts.Active ?? 0} active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-muted rounded-full p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => changeFilter(f.value)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-small font-medium transition-colors",
                  filter === f.value
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {f.label}
                <span className="text-caption font-semibold text-primary">
                  {counts[f.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <Select value={activeSort} onValueChange={changeSort}>
            <SelectTrigger className="w-full sm:w-44 h-9 rounded-full border-border bg-card text-small">
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

          <ProjectModal onSuccess={refetchAll} />
        </div>
      </div>

      {/* Content */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={
            filter === "All" ? "No projects yet" : `No ${filter.toLowerCase()} projects`
          }
          subtext={
            filter === "All"
              ? "Create your first project to get started"
              : "Try a different filter"
          }
          action={
            filter === "All" ? <ProjectModal onSuccess={refetchAll} /> : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <DashboardProjectCard
              key={project.id}
              project={project}
              manageable
              surface="white"
              onDelete={refetchAll}
              onChange={refetchAll}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-border">
          <p className="text-small text-muted-foreground">
            Showing {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchProjects(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-small font-semibold bg-card text-foreground shadow-card hover:shadow-lg transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {getPageNumbers(page, totalPages).map((pageNum, i) =>
              pageNum === ELLIPSIS ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-9 h-9 flex items-center justify-center text-small text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => fetchProjects(pageNum)}
                  className={[
                    "w-9 h-9 rounded-full text-small font-semibold shadow-card transition-all",
                    pageNum === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {pageNum}
                </button>
              ),
            )}
            <button
              onClick={() => fetchProjects(page + 1)}
              disabled={!hasMore}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-small font-semibold bg-card text-foreground shadow-card hover:shadow-lg transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ProjectList;
