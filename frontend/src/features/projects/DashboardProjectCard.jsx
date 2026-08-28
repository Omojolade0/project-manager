import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Pin, Trash2 } from "lucide-react";
import ProjectModal from "./ProjectModal";
import toast from "react-hot-toast";
import { useProjects } from "@/hooks/useProjects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_BADGE = {
  Active: "bg-status-done-tint text-status-done",
  Inactive: "bg-muted text-muted-foreground",
  Completed: "bg-primary/10 text-primary",
};

const SEGMENTS = 8;
const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function ProgressRing({ percent, complete }) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          strokeWidth="4"
          className={`fill-none ${complete ? "stroke-[hsl(var(--status-done)/0.2)]" : "stroke-[hsl(var(--primary)/0.2)]"}`}
        />
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`fill-none transition-all duration-300 ${complete ? "stroke-status-done" : "stroke-primary"}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-caption font-semibold text-foreground">
        {percent}%
      </span>
    </div>
  );
}

function DashboardProjectCard({
  project,
  manageable = false,
  surface = "tint",
  onDelete,
  onChange,
}) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { removeProject } = useProjects();

  const taskCount = project.task_count ?? 0;
  const completedCount = project.completed_count ?? 0;
  const progressPct =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const isComplete = taskCount > 0 && progressPct === 100;
  const filledSegments =
    taskCount > 0 ? Math.round((progressPct / 100) * SEGMENTS) : 0;

  async function handleDelete() {
    try {
      setDeleting(true);
      await removeProject(project.id);
      toast.success("Project deleted");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className={`group relative rounded-2xl p-5 cursor-pointer shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
        surface === "white" ? "bg-card" : "bg-secondary-tint"
      }`}
    >
      {manageable && (
        <div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ProjectModal
            project={project}
            onSuccess={onChange}
            hideTrigger
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:opacity-90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <ProgressRing percent={progressPct} complete={isComplete} />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap pr-8">
            <h3 className="text-card-title text-foreground truncate">
              {project.name}
            </h3>
            <span
              className={`text-caption font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[project.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-small text-muted-foreground truncate mt-0.5">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <p className="text-small text-muted-foreground mb-2">
        {taskCount > 0 ? `${completedCount}/${taskCount} tasks` : "No tasks yet"}
      </p>

      {taskCount > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < filledSegments
                  ? isComplete
                    ? "bg-status-done"
                    : "bg-primary"
                  : "bg-[hsl(var(--primary)/0.15)]"
              }`}
            />
          ))}
        </div>
      )}

      {project.one_pinned_task && (
        <div
          className={`inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-caption text-primary max-w-full ${
            surface === "white" ? "bg-primary/10" : "bg-card"
          }`}
        >
          <Pin className="w-3 h-3 shrink-0" />
          <span className="truncate">{project.one_pinned_task.title}</span>
        </div>
      )}

      {project.updated_at && (
        <div className="text-right">
          <span className="text-caption text-muted-foreground">
            {`Updated ${formatDate(project.updated_at)}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default DashboardProjectCard;
