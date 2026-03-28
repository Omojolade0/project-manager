import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import projectService from "@/services/projectService";
import ProjectModal from "./ProjectModal";
import StatusDropdown from "./StatusDropdown";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();

  function handleNavigate() {
    navigate(`/projects/${project.id}`);
  }

  async function handleDelete(e) {
    e.stopPropagation();
    try {
      await projectService.deleteProject(project.id);
      onDelete();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }
  async function handleStatusChange(newStatus) {
    try {
      await projectService.updateProject(project.id, {
        status: newStatus,
      });
      onDelete();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  return (
    <div
      onClick={handleNavigate}
      className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 cursor-pointer hover:border-slate-200 hover:shadow-sm transition-all duration-150"
    >
      {/* Header */}
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
        {/* <span
          className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[project.status] || "bg-slate-50 text-slate-500"}`}
        >
          {project.status}
        </span> */}
        <StatusDropdown
          currentStatus={project.status}
          statuses={["Active", "Inactive", "Completed"]}
          onStatusChange={handleStatusChange}
          statusStyles={statusStyles}
        />
      </div>
    </div>
  );
}

export default ProjectCard;
