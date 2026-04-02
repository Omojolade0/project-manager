import { Trash2 } from "lucide-react";
import taskService from "@/services/taskService";
import TaskModal from "@/components/TaskModal";
import StatusDropdown from "@/components/StatusDropdown";
import toast from "react-hot-toast";
import { useState } from "react";

const statusStyles = {
  Todo: "bg-slate-50 text-slate-500",
  Inprogress: "bg-amber-50 text-amber-700",
  Done: "bg-green-50 text-green-700",
};

function TaskCard({ task, onRefresh, projectId }) {
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    try {
      setDeleting(true);
      await taskService.deleteTask(projectId, task.id);
      toast.success("Task deleted");
      onRefresh();
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
      await taskService.updateTask(projectId, task.id, {
        status: newStatus,
      });
      toast.success("Task Status Updated");
      onRefresh();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to Update task");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
      {/* Header */}
      {deleting && (
        <div className="mb-3">
          <span className="text-sm text-slate-500">Deleting...</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug pr-2 line-clamp-1">
          {task.title}
        </h3>
        <div className="flex">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskModal
              task={task}
              projectId={projectId}
              onSuccess={onRefresh}
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {task.description || "No description"}
      </p>

      <StatusDropdown
        currentStatus={task.status}
        statuses={["Todo", "Inprogress", "Done"]}
        onStatusChange={handleStatusChange}
        statusStyles={statusStyles}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}

export default TaskCard;
