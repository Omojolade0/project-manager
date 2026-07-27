import { useEffect, useState, useCallback } from "react";
import TaskCard from "@/features/tasks/TaskCard";
import TaskBoard from "@/features/tasks/TaskBoard";
import NoteCard from "@/features/notes/NoteCard";
import TaskModal from "@/features/tasks/TaskModal";
import NoteModal from "@/features/notes/NoteModal";
import Layout from "@/layouts/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckSquare, FileText, ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusStyles = {
  Active: "bg-green-50 text-green-700",
  Completed: "bg-blue-50 text-blue-700",
  Inactive: "bg-slate-50 text-slate-500",
};

const TASK_STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "Todo", label: "Todo" },
  { value: "Inprogress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

const TASK_SORTS = [
  { value: "deadline", label: "Deadline" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "priority", label: "Priority" },
];

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [tasksView, setTasksView] = useState("list");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskSort, setTaskSort] = useState("");

  const {
    tasks,
    error: tasksError,
    loading: tasksLoading,
    page: tasksPage,
    total: tasksTotal,
    hasMore: tasksHasMore,
    fetchTasks,
    goToNextPage: tasksNextPage,
    goToPrevPage: tasksPrevPage,
  } = useTasks(id, { autoFetch: true });

  // The Kanban board must always show the full, unfiltered task set — list-view
  // filter/sort selections are intentionally not applied there.
  function changeTasksView(view) {
    setTasksView(view);
    if (view === "board") {
      fetchTasks(id, 1, { status: null, sort: null });
    } else {
      fetchTasks(id, 1, { status: taskStatusFilter || null, sort: taskSort || null });
    }
  }

  function changeTaskStatusFilter(value) {
    setTaskStatusFilter(value);
    fetchTasks(id, 1, { status: value || null, sort: taskSort || null });
  }

  function changeTaskSort(value) {
    setTaskSort(value);
    fetchTasks(id, 1, { status: taskStatusFilter || null, sort: value || null });
  }

  const {
    notes,
    error: notesError,
    loading: notesLoading,
    page: notesPage,
    total: notesTotal,
    hasMore: notesHasMore,
    fetchNotes,
    goToNextPage: notesNextPage,
    goToPrevPage: notesPrevPage,
  } = useNotes(id, { autoFetch: true });

  const { fetchProjectById } = useProjects();

  const loadProject = useCallback(async () => {
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
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProject();
  }, [id, loadProject]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <p className="text-xs text-slate-400">{tasksTotal} total</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-50 rounded-lg p-0.5">
                  <button
                    onClick={() => changeTasksView("list")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      tasksView === "list"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button
                    onClick={() => changeTasksView("board")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      tasksView === "board"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Board
                  </button>
                </div>
                <TaskModal projectId={id} onSuccess={() => fetchTasks(id, 1)} />
              </div>
            </div>
            {tasksView === "list" && (
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex gap-1.5">
                  {TASK_STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => changeTaskStatusFilter(f.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        taskStatusFilter === f.value
                          ? "bg-slate-900 text-white"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <Select
                  value={taskSort || "deadline"}
                  onValueChange={changeTaskSort}
                >
                  <SelectTrigger className="w-36 h-8 rounded-lg border-slate-200 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_SORTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                <p className="text-sm text-slate-400">
                  {taskStatusFilter ? "No matching tasks" : "No tasks yet"}
                </p>
              </div>
            ) : tasksView === "board" ? (
              <TaskBoard tasks={tasks} projectId={id} />
            ) : (
              <>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectId={id}
                      onChange={() => fetchTasks(id)}
                    />
                  ))}
                </div>
                {tasksTotal > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={tasksPrevPage}
                      disabled={tasksPage === 1}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="text-xs text-slate-400">Page {tasksPage}</span>
                    <button
                      onClick={tasksNextPage}
                      disabled={!tasksHasMore}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
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
                  <p className="text-xs text-slate-400">{notesTotal} total</p>
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
              <>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <NoteCard key={note.id} note={note} projectId={id} />
                  ))}
                </div>
                {notesTotal > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={notesPrevPage}
                      disabled={notesPage === 1}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="text-xs text-slate-400">Page {notesPage}</span>
                    <button
                      onClick={notesNextPage}
                      disabled={!notesHasMore}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProjectDetail;