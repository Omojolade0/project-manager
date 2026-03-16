import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import projectService from "@/services/projectService";
import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  async function fetchProjects() {
    try {
      const response = await projectService.getProjects();
      setProjects(response);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const filters = ["All", "Active", "Completed", "Inactive"];

  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.status === filter);

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
              {projects.length} total
            </p>
          </div>
          <ProjectModal onSuccess={fetchProjects} />
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
                onDelete={fetchProjects}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProjectList;
