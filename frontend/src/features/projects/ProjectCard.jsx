import { useNavigate } from "react-router-dom";
import { Trash2, Pin } from "lucide-react";
import ProjectModal from "./ProjectModal";
import StatusDropdown from "../../components/StatusDropdown";
import toast from "react-hot-toast";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

function ProjectCard({ project, onDelete, onStatusChange }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { removeProject, editProject } = useProjects();

  function handleNavigate() {
    navigate(`/projects/${project.id}`);
  }

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const taskCount = project.task_count ?? 0;
  const completedCount = project.completed_count ?? 0;
  const progressPct =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

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
      navigate(`/dashboard`);
    }
  }
  async function handleStatusChange(newStatus) {
    try {
      setUpdatingStatus(true);
      await editProject(project.id, {
        status: newStatus,
      });
      toast.success("Project updated");
      onStatusChange?.();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div
      onClick={handleNavigate}
      className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all duration-150"
    >
      {/* Header */}
      {deleting && (
        <div className="mb-3">
          <span className="text-sm text-slate-500">Deleting...</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug pr-2 line-clamp-1">
          {project.name}
        </h3>
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ProjectModal project={project} />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={deleting}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
            </button>
          </AlertDialogTrigger>
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
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {project.description || "No description"}
      </p>

      {/* Progress + meta */}
      <div className="mb-4">
        {taskCount > 0 && (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {completedCount}/{taskCount} tasks
          </span>
          <span>
            {project.updated_at
              ? `Updated ${formatDate(project.updated_at)}`
              : "Never updated"}
          </span>
        </div>
        {project.one_pinned_task && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600">
            <Pin className="w-3 h-3 shrink-0" />
            <span className="truncate">{project.one_pinned_task.title}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <StatusDropdown
          currentStatus={project.status}
          statuses={["Active", "Inactive", "Completed"]}
          onStatusChange={handleStatusChange}
          statusStyles={statusStyles}
          updatingStatus={updatingStatus}
        />
      </div>
    </div>
  );
}

export default ProjectCard;
