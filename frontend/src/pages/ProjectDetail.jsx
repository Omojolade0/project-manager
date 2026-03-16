import projectService from "@/services/projectService";
import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import NoteCard from "@/components/NoteCard";
import taskService from "@/services/taskService";
import noteService from "@/services/noteService";
import TaskModal from "@/components/TaskModal";
import NoteModal from "@/components/NoteModal";
import Layout from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckSquare, FileText } from "lucide-react";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

function ProjectDetail() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  async function fetchProject(id) {
    try {
      const response = await projectService.getProjectById(id);
      setProject(response);
      fetchTasks(response.id);
      fetchNotes(response.id);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks(projectId) {
    try {
      const response = await taskService.getTasks(projectId);
      setTasks(response);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function fetchNotes(projectId) {
    try {
      const response = await noteService.getNotes(projectId);
      setNotes(response);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }

  useEffect(() => {
    fetchProject(id);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-slate-50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-sm text-slate-400">
            Project not found or has been deleted.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Back to projects
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Project header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {project.name}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              {project.description}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 ml-4 ${statusStyles[project.status] || "bg-slate-50 text-slate-500"}`}
          >
            {project.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Tasks</h3>
                <p className="text-xs text-slate-400">{tasks.length} total</p>
              </div>
            </div>
            <TaskModal projectId={id} onSuccess={() => fetchTasks(id)} />
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <CheckSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectId={id}
                  onDelete={() => fetchTasks(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
                <p className="text-xs text-slate-400">{notes.length} total</p>
              </div>
            </div>
            <NoteModal projectId={id} onSuccess={() => fetchNotes(id)} />
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  projectId={id}
                  onDelete={() => fetchNotes(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ProjectDetail;
