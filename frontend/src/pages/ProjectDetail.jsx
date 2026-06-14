import { useEffect, useState } from "react";
import TaskCard from "@/features/tasks/TaskCard";
import NoteCard from "@/features/notes/NoteCard";
import TaskModal from "@/features/tasks/TaskModal";
import NoteModal from "@/features/notes/NoteModal";
import Layout from "@/layouts/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckSquare, FileText } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);

  const {
    tasks,
    error: tasksError,
    loading: tasksLoading,
    fetchTasks,
  } = useTasks(id);
  const {
    notes,
    error: notesError,
    loading: notesLoading,
    fetchNotes,
  } = useNotes(id);
  const { fetchProjectById } = useProjects();

  async function loadProject() {
    try {
      setProjectLoading(true);
      const response = await fetchProjectById(id);
      setProject(response);
    } catch (error) {
      console.error("Error fetching project:", error);
      setProjectError(error);
    } finally {
      setProjectLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  if (projectLoading) {
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

  if (projectError) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-sm text-slate-400 mb-4">Something went wrong.</p>
          <button
            onClick={loadProject}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Try again
          </button>
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
        {tasksError ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center py-10">
            <p className="text-sm text-slate-400 mb-2">Failed to load tasks.</p>
            <button
              onClick={() => fetchTasks(id)}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tasks
                  </h3>
                  <p className="text-xs text-slate-400">{tasks.length} total</p>
                </div>
              </div>
              <TaskModal projectId={id} />
            </div>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {notesError ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center py-10">
            <p className="text-sm text-slate-400 mb-2">Failed to load notes.</p>
            <button
              onClick={() => fetchNotes(id)}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notes
                  </h3>
                  <p className="text-xs text-slate-400">{notes.length} total</p>
                </div>
              </div>
              <NoteModal projectId={id} />
            </div>
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} projectId={id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProjectDetail;
