import Layout from "@/layouts/Layout";
import ProjectCard from "@/features/projects/ProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import UpcomingSection from "@/features/tasks/UpcomingSection";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
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
  const {
    stats: projectStats,
    loading: statsLoading,
    error: statsError,
    fetchStats,
  } = useProjectStats({ autoFetch: true });
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
        <ErrorState
          variant="page"
          title="Couldn't load your dashboard"
          message={
            error?.response?.status === 403
              ? "You don't have permission to view this."
              : "Something went wrong."
          }
          actionLabel="Retry"
          onAction={fetchProjects}
        />
      </Layout>
    );
  }
  return (
    <Layout>
      {/* Stats */}
      {statsError ? (
        <div className="bg-card border border-border rounded-lg shadow-card mb-8">
          <ErrorState
            title="Couldn't load your stats"
            onAction={fetchStats}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="stat-card" />)
            : stats.map((s, i) => (
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
      )}

      {/* Projects section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            subtext="Create your first project to get started"
            action={<ProjectModal onSuccess={refetchDashboard} />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="mt-5">
        <UpcomingSection />
      </div>
    </Layout>
  );
}

export default Dashboard;
