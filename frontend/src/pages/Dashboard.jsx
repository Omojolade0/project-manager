import { useState } from "react";
import Layout from "@/layouts/Layout";
import DashboardProjectCard from "@/features/projects/DashboardProjectCard";
import ProjectModal from "@/features/projects/ProjectModal";
import UpcomingSection from "@/features/tasks/UpcomingSection";
import Skeleton from "@/components/common/Skeleton";
import ErrorState from "@/components/common/ErrorState";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStats } from "@/hooks/useProjectStats";
import useAuth from "@/hooks/useAuth";
import {
  FolderKanban,
  FolderCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";

const PROJECTS_DISPLAY_LIMIT = 5;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatGreetingDate(date) {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  return `${weekday} ${date.getDate()} ${month}`;
}

function Dashboard() {
  const { projects, total, loading, error, fetchProjects } = useProjects({
    autoFetch: true,
  });
  const {
    stats: projectStats,
    loading: statsLoading,
    error: statsError,
    fetchStats,
  } = useProjectStats({ autoFetch: true });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  function refetchDashboard() {
    fetchProjects();
    fetchStats();
  }

  const stats = [
    {
      label: "Overdue Tasks",
      value: projectStats?.overdue_tasks ?? 0,
      icon: AlertTriangle,
      iconBg: "bg-status-overdue-tint",
      iconText: "text-status-overdue",
      barBg: "bg-status-overdue",
    },
    {
      label: "Due This Week",
      value: projectStats?.due_this_week_tasks ?? 0,
      icon: Clock,
      iconBg: "bg-status-due-tint",
      iconText: "text-status-due",
      barBg: "bg-status-due",
    },
    {
      label: "Active Projects",
      value: projectStats?.active_projects ?? 0,
      icon: FolderKanban,
      iconBg: "bg-secondary",
      iconText: "text-primary",
      barBg: "bg-primary",
    },
    {
      label: "Completed Projects",
      value: projectStats?.completed_projects ?? 0,
      icon: FolderCheck,
      iconBg: "bg-status-done-tint",
      iconText: "text-status-done",
      barBg: "bg-status-done",
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

  const now = new Date();

  return (
    <Layout>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-page-title text-foreground">
          {getGreeting()}
          {user?.username ? `, ${user.username}` : ""}
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          {formatGreetingDate(now)}
        </p>
      </div>

      {/* Stats */}
      {statsError ? (
        <div className="bg-card rounded-lg shadow-card mb-8">
          <ErrorState title="Couldn't load your stats" onAction={fetchStats} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="stat-card" />)
            : stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-5 flex flex-col shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-3 ${s.iconBg} ${s.iconText}`}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                  <p className="text-small text-muted-foreground mt-0.5">{s.label}</p>
                  <div className={`h-1 w-10 rounded-full mt-4 ${s.barBg}`} />
                </div>
              ))}
        </div>
      )}

      {/* Projects section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-section text-foreground">My Projects</h2>
            <span className="text-caption font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {total ?? projects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="group inline-flex items-center gap-1.5 text-small font-medium text-primary bg-secondary hover:bg-border rounded-full pl-3.5 pr-3 py-1.5 transition-all duration-200"
          >
            View all projects
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, PROJECTS_DISPLAY_LIMIT).map((project) => (
              <DashboardProjectCard key={project.id} project={project} />
            ))}

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border hover:border-primary bg-transparent hover:bg-secondary p-5 min-h-[160px] text-center transition-colors duration-200"
            >
              <span className="w-9 h-9 rounded-full bg-secondary group-hover:bg-card flex items-center justify-center transition-colors duration-200">
                <Plus className="w-4 h-4 text-primary transition-transform duration-200 group-hover:rotate-90" />
              </span>
              <span className="text-small font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                Start a new project
              </span>
            </button>
          </div>
        )}

        <ProjectModal
          hideTrigger
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={refetchDashboard}
        />
      </div>

      <div className="mt-5">
        <UpcomingSection />
      </div>
    </Layout>
  );
}

export default Dashboard;
