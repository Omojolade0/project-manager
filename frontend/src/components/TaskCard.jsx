import { Trash2 } from "lucide-react";
import taskService from "@/services/taskService";

const statusStyles = {
  Todo: "bg-slate-50 text-slate-500",
  Inprogress: "bg-amber-50 text-amber-700",
  Done: "bg-green-50 text-green-700",
};

function TaskCard({ task, onDelete, projectId }) {
  async function handleDelete(e) {
    e.stopPropagation();
    try {
      await taskService.deleteTask(projectId, task.id);
      onDelete();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <div className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug pr-2 line-clamp-1">
          {task.title}
        </h3>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {task.description || "No description"}
      </p>

      {/* Status */}
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[task.status] || "bg-slate-50 text-slate-500"}`}
      >
        {task.status === "Inprogress" ? "In Progress" : task.status}
      </span>
    </div>
  );
}

export default TaskCard;
