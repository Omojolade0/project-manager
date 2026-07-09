import Layout from "@/layouts/Layout";
import ProjectCard from "@/features/projects/ProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import { useState } from "react";
import { FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

function ProjectList() {
  const [filter, setFilter] = useState("All");
  const {
    projects,
    loading,
    error,
    page,
    total,
    hasMore,
    fetchProjects,
    goToNextPage,
    goToPrevPage,
  } = useProjects({ autoFetch: true });

  const filters = ["All", "Active", "Completed", "Inactive"];

  const filtered = projects.filter(
    (p) => filter === "All" || p.status === filter,
  );

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-sm text-slate-400 mb-4">
            {error?.response?.status === 404
              ? "Projects not found."
              : error?.response?.status === 403
                ? "You don't have permission to view this."
                : "Something went wrong."}
          </p>
          <button
            onClick={() => fetchProjects(1)}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
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

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 bg-slate-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              {filter === "All" ? "No projects yet" : `No ${filter} projects`}
            </p>
            <p className="text-sm text-slate-400">
              {filter === "All"
                ? "Create your first project to get started"
                : "Try a different filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((project) => (
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