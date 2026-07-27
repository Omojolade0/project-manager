import Layout from "@/layouts/Layout";
import ProjectCard from "@/features/projects/ProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStats } from "@/hooks/useProjectStats";
import {
  FolderKanban,
  FolderCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const { projects, loading, error, fetchProjects } = useProjects({ autoFetch: true });
  const { stats: projectStats, fetchStats } = useProjectStats({ autoFetch: true });
  const navigate = useNavigate();

  function refetchDashboard() {
    fetchProjects();
    fetchStats();
  }

  const stats = [
    {
      label: "Overdue Tasks",
      value: projectStats?.overdue_tasks ?? 0,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Due This Week",
      value: projectStats?.due_this_week_tasks ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Active Projects",
      value: projectStats?.active_projects ?? 0,
      icon: FolderKanban,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Completed Projects",
      value: projectStats?.completed_projects ?? 0,
      icon: FolderCheck,
      color: "bg-green-50 text-green-600",
    },
  ];

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
            onClick={fetchProjects}
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
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
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
            <ProjectModal onSuccess={refetchDashboard} />
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
                onDelete={refetchDashboard}
                onStatusChange={refetchDashboard}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
