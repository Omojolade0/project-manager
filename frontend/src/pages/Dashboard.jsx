import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import projectService from "@/services/projectService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  FolderCheck,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const activeProjects = projects.filter((p) => p.status === "Active");
  const completedProjects = projects.filter((p) => p.status === "Completed");

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active",
      value: activeProjects.length,
      icon: CheckSquare,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Completed",
      value: completedProjects.length,
      icon: FolderCheck,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <Layout>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              My Projects
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Your most recent projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ProjectModal onSuccess={fetchProjects} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-slate-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              No projects yet
            </p>
            <p className="text-sm text-slate-400">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
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

export default Dashboard;
