import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import projectService from "@/services/projectService";
import ProjectModal from "./ProjectModal";
import StatusDropdown from "./StatusDropdown";
import toast from "react-hot-toast";
import { useState } from "react";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  function handleNavigate() {
    navigate(`/projects/${project.id}`);
  }

  async function handleDelete(e) {
    e.stopPropagation();
    try {
      setDeleting(true);
      await projectService.deleteProject(project.id);
      toast.success("Project deleted");
      onDelete();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  }
  async function handleStatusChange(newStatus) {
    try {
      setUpdatingStatus(true);
      await projectService.updateProject(project.id, {
        status: newStatus,
      });
      toast.success("Project updated");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingStatus(false);
      onDelete();
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
          <ProjectModal project={project} onSuccess={onDelete} />
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {project.description || "No description"}
      </p>

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
