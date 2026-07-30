import { Trash2, Pin, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskModal from "@/features/tasks/TaskModal";
import StatusDropdown from "@/components/StatusDropdown";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
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
  Todo: "bg-slate-50 text-slate-500",
  Inprogress: "bg-amber-50 text-amber-700",
  Done: "bg-green-50 text-green-700",
};
const priorityStyles = {
  Low: "bg-green-50 text-green-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

function TaskCard({ task, projectId, project, onChange }) {
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pinning, setPinning] = useState(false);
  const { removeTask, editTask } = useTasks(projectId);
  const navigate = useNavigate();

  function handleNavigateToProject() {
    if (project) navigate(`/projects/${project.id}`);
  }

  // add this helper above the component
  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function handleDelete(e) {
    e.stopPropagation();
    try {
      setDeleting(true);
      await removeTask(task.id);
      toast.success("Task deleted");
      onChange?.();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }
  async function handleStatusChange(newStatus) {
    try {
      setUpdatingStatus(true);
      await editTask(task.id, {
        status: newStatus,
      });
      toast.success("Task Status Updated");
      onChange?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to Update task");
    } finally {
      setUpdatingStatus(false);
    }
  }
  async function handlePin() {
    try {
      setPinning(true);
      await editTask(task.id, {
        is_pinned: !task.is_pinned,
      });
      onChange?.();
    } catch (error) {
      toast.error("Failed to pin task");
      console.error("Error pinning task:", error);
    } finally {
      setPinning(false);
    }
  }

  return (
    <div
      onClick={project ? handleNavigateToProject : undefined}
      className={`group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-150 ${project ? "cursor-pointer" : ""}`}
    >
      {/* Header */}
      {deleting && (
        <div className="mb-3">
          <span className="text-sm text-slate-500">Deleting...</span>
        </div>
      )}
      {project && (
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-medium uppercase tracking-wide text-indigo-500">
          <FolderKanban className="w-3 h-3" />
          {project.name}
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug pr-2 line-clamp-1">
          {task.title}
        </h3>
        <div className="flex" onClick={(e) => e.stopPropagation()}>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskModal task={task} projectId={projectId} onSuccess={onChange} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={deleting}
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
                  task.
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
      </div>
      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.priority && (
        <p
          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[task.priority] || "bg-slate-50 text-slate-500"}`}
        >
          {task.priority}
        </p>
      )}
      {task.due_date && <p>{formatDate(task.due_date)}</p>}

      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePin();
        }}
        disabled={pinning}
        className={`p-1 rounded-lg ${task.is_pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Pin
          className={`w-3.5 h-3.5 ${task.is_pinned ? "text-indigo-500" : "text-slate-300"}`}
        />
      </button>

      <div onClick={(e) => e.stopPropagation()}>
        <StatusDropdown
          currentStatus={task.status}
          statuses={["Todo", "Inprogress", "Done"]}
          onStatusChange={handleStatusChange}
          statusStyles={statusStyles}
          updatingStatus={updatingStatus}
        />
      </div>
    </div>
  );
}

export default TaskCard;
