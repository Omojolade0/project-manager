import { useEffect, useState, useCallback, useMemo } from "react";
import TaskListRow from "@/features/tasks/TaskListRow";
import TaskBoard from "@/features/tasks/TaskBoard";
import NoteCard from "@/features/notes/NoteCard";
import TaskModal from "@/features/tasks/TaskModal";
import NoteModal from "@/features/notes/NoteModal";
import ProjectModal from "@/features/projects/ProjectModal";
import ProjectInsights from "@/features/projects/ProjectInsights";
import Layout from "@/layouts/Layout";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTasks } from "@/hooks/useTasks";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import taskService from "@/services/taskService";
import { getUrgency } from "@/lib/taskUrgency";
import { STATUS_META, STATUS_ORDER } from "@/lib/taskStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";

const PROJECT_STATUS_BADGE = {
  Active: "bg-status-done-tint text-status-done",
  Inactive: "bg-muted text-muted-foreground",
  Completed: "bg-primary/10 text-primary",
};

const TASK_STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "Todo", label: STATUS_META.Todo.label },
  { value: "Inprogress", label: STATUS_META.Inprogress.label },
  { value: "Done", label: STATUS_META.Done.label },
];

const GROUP_OPTIONS = [
  { value: "none", label: "No grouping", sort: "" },
  { value: "status", label: "By status", sort: "" },
  { value: "priority", label: "By priority", sort: "priority" },
  { value: "due", label: "By due date", sort: "deadline" },
];

const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ percent, complete }) {
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 44 44" className="w-16 h-16 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={RING_RADIUS}
          strokeWidth="4"
          className={`fill-none ${complete ? "stroke-[hsl(var(--status-done)/0.2)]" : "stroke-[hsl(var(--primary)/0.2)]"}`}
        />
        <circle
          cx="22"
          cy="22"
          r={RING_RADIUS}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`fill-none transition-all duration-300 ${complete ? "stroke-status-done" : "stroke-primary"}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-body font-semibold text-foreground">
        {percent}%
      </span>
    </div>
  );
}

function ProjectHeaderMenu({ project, onEdited }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { removeProject } = useProjects();

  async function handleDelete() {
    try {
      setDeleting(true);
      await removeProject(project.id);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5" /> Edit project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectModal
        project={project}
        hideTrigger
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onEdited}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project along with its tasks and notes.
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
    </>
  );
}

function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [tasksView, setTasksView] = useState("list");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskSort, setTaskSort] = useState("");
  const [groupBy, setGroupBy] = useState("none");

  const {
    tasks,
    error: tasksError,
    isInitialLoading: tasksInitialLoading,
    page: tasksPage,
    total: tasksTotal,
    hasMore: tasksHasMore,
    fetchTasks,
    goToNextPage: tasksNextPage,
    goToPrevPage: tasksPrevPage,
    createTask,
    reorderTasks,
  } = useTasks(id, { autoFetch: true });

  // Frontend-only stats source: the full, unfiltered task set, fetched
  // independently of the list view's filter/sort/pagination. Powers the
  // header progress ring, filter-tab counts, and the Insights panel — none
  // of which should shift when the list view's filter changes.
  const [statsTasks, setStatsTasks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const statsInitialLoading = statsLoading && statsTasks.length === 0;

  const refreshStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await taskService.getTasks(id, 1, 200, {});
      setStatsTasks(response.items);
    } catch (error) {
      console.error("Error fetching task stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    refreshStats();
  }, [id, refreshStats]);

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

  function changeGroupBy(value) {
    const option = GROUP_OPTIONS.find((o) => o.value === value) || GROUP_OPTIONS[0];
    setGroupBy(value);
    setTaskSort(option.sort);
    fetchTasks(id, 1, { status: taskStatusFilter || null, sort: option.sort || null });
  }

  // Refetches whatever the current view needs, then refreshes the
  // view-independent stats used by the ring, filter counts, and Insights.
  function handleTasksChanged() {
    if (tasksView === "board") {
      fetchTasks(id, 1, { status: null, sort: null });
    } else {
      fetchTasks(id, tasksPage, { status: taskStatusFilter || null, sort: taskSort || null });
    }
    refreshStats();
  }

  // Duplicate reuses the existing create-task endpoint, then the existing
  // reorder endpoint to place the copy directly below the original within
  // the same status column. No new backend endpoint is involved.
  async function handleDuplicateTask(task) {
    try {
      const copy = await createTask({
        title: `${task.title} copy`,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        status: task.status,
        is_pinned: false,
      });
      const columnTasks = tasks
        .filter((t) => t.status === task.status)
        .sort((a, b) => a.position - b.position);
      const originalIndex = columnTasks.findIndex((t) => t.id === task.id);
      const ordered = [...columnTasks];
      ordered.splice(originalIndex === -1 ? ordered.length : originalIndex + 1, 0, copy);
      await reorderTasks([
        { status: task.status, task_ids: ordered.map((t) => t.id) },
      ]);
      toast.success("Task duplicated");
    } catch (error) {
      console.error("Error duplicating task:", error);
      toast.error("Failed to duplicate task");
    } finally {
      handleTasksChanged();
    }
  }

  const {
    notes,
    error: notesError,
    isInitialLoading: notesInitialLoading,
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

  const filterCounts = useMemo(
    () => ({
      "": statsTasks.length,
      Todo: statsTasks.filter((t) => t.status === "Todo").length,
      Inprogress: statsTasks.filter((t) => t.status === "Inprogress").length,
      Done: statsTasks.filter((t) => t.status === "Done").length,
    }),
    [statsTasks],
  );

  const totalCount = statsTasks.length;
  const completedCount = statsTasks.filter((t) => t.status === "Done").length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && progressPct === 100;

  const groupedTasks = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_ORDER.map((status) => ({
        key: status,
        label: STATUS_META[status].label,
        items: tasks.filter((t) => t.status === status),
      })).filter((g) => g.items.length > 0);
    }
    if (groupBy === "priority") {
      const groups = ["High", "Medium", "Low"].map((p) => ({
        key: p,
        label: `${p} priority`,
        items: tasks.filter((t) => t.priority === p),
      }));
      const none = tasks.filter((t) => !t.priority);
      if (none.length) groups.push({ key: "none", label: "No priority", items: none });
      return groups.filter((g) => g.items.length > 0);
    }
    if (groupBy === "due") {
      const openTasks = tasks.filter((t) => t.status !== "Done");
      const groups = [
        {
          key: "overdue",
          label: "Overdue",
          items: openTasks.filter((t) => getUrgency(t.due_date) === "overdue"),
        },
        {
          key: "due",
          label: "Due this week",
          items: openTasks.filter((t) => getUrgency(t.due_date) === "due"),
        },
        {
          key: "later",
          label: "Later",
          items: openTasks.filter(
            (t) => t.due_date && getUrgency(t.due_date) === "default",
          ),
        },
        {
          key: "nodue",
          label: "No due date",
          items: openTasks.filter((t) => !t.due_date),
        },
        {
          key: "done",
          label: "Done",
          items: tasks.filter((t) => t.status === "Done"),
        },
      ];
      return groups.filter((g) => g.items.length > 0);
    }
    return null;
  }, [tasks, groupBy]);

  if (projectLoading) {
    return (
      <Layout>
        <div className="space-y-5">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton variant="card" className="h-72" />
            <Skeleton variant="card" className="h-72" />
          </div>
        </div>
      </Layout>
    );
  }

  if (projectError) {
    return (
      <Layout>
        <ErrorState
          variant="page"
          title="Couldn't load this project"
          actionLabel="Retry"
          onAction={loadProject}
        />
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <ErrorState
          variant="page"
          title="Project not found"
          message="It may have been deleted, or you don't have access to it."
          actionLabel="Back to projects"
          onAction={() => navigate("/projects")}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-card p-6">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <ProgressRing percent={progressPct} complete={isComplete} />
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-page-title text-foreground">{project.name}</h1>
                  <span
                    className={`text-caption font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      PROJECT_STATUS_BADGE[project.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-small text-muted-foreground max-w-xl mt-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <ProjectHeaderMenu project={project} onEdited={loadProject} />
          </div>
        </div>

        {/* Tasks */}
        {tasksError ? (
          <div className="bg-card rounded-2xl shadow-card p-6">
            <ErrorState title="Failed to load tasks" onAction={() => fetchTasks(id)} />
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-status-progress-tint rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-status-progress" />
                </div>
                <div>
                  <h3 className="text-card-title text-foreground">Tasks</h3>
                  <p className="text-caption text-muted-foreground">
                    {totalCount} total · {completedCount} done
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => changeTasksView("list")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-caption font-medium transition-colors ${
                      tasksView === "list"
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button
                    onClick={() => changeTasksView("board")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-caption font-medium transition-colors ${
                      tasksView === "board"
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" /> Board
                  </button>
                </div>
                <TaskModal projectId={id} onSuccess={handleTasksChanged} />
              </div>
            </div>

            {tasksView === "list" && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {TASK_STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => changeTaskStatusFilter(f.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption font-medium transition-colors ${
                        taskStatusFilter === f.value
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {f.label}
                      <span
                        className={
                          taskStatusFilter === f.value
                            ? "text-background/70"
                            : "text-muted-foreground/70"
                        }
                      >
                        {filterCounts[f.value] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
                <Select value={groupBy} onValueChange={changeGroupBy}>
                  <SelectTrigger className="w-full sm:w-40 h-8 rounded-lg border-border text-caption">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tasksInitialLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="list-row" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                compact
                icon={CheckSquare}
                title={taskStatusFilter ? "No matching tasks" : "No tasks yet"}
              />
            ) : tasksView === "board" ? (
              <TaskBoard
                tasks={tasks}
                projectId={id}
                onChange={handleTasksChanged}
                onDuplicate={handleDuplicateTask}
              />
            ) : groupedTasks ? (
              <div className="space-y-5">
                {groupedTasks.map((group) => (
                  <div key={group.key}>
                    <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      {group.label} · {group.items.length}
                    </p>
                    <div className="space-y-2.5">
                      {group.items.map((task) => (
                        <TaskListRow
                          key={task.id}
                          task={task}
                          projectId={id}
                          onChange={handleTasksChanged}
                          onDuplicate={handleDuplicateTask}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <TaskListRow
                      key={task.id}
                      task={task}
                      projectId={id}
                      onChange={handleTasksChanged}
                      onDuplicate={handleDuplicateTask}
                    />
                  ))}
                </div>
                {tasksTotal > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={tasksPrevPage}
                      disabled={tasksPage === 1}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="text-caption text-muted-foreground">Page {tasksPage}</span>
                    <button
                      onClick={tasksNextPage}
                      disabled={!tasksHasMore}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Notes + Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notesError ? (
            <div className="bg-card rounded-2xl shadow-card p-6">
              <ErrorState title="Failed to load notes" onAction={() => fetchNotes(id)} />
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary-tint rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-card-title text-foreground">Notes</h3>
                    <p className="text-caption text-muted-foreground">
                      {notesTotal} note{notesTotal === 1 ? "" : "s"} ·{" "}
                      {notes.filter((n) => n.is_pinned).length} pinned
                    </p>
                  </div>
                </div>
                <NoteModal projectId={id} onSuccess={() => fetchNotes(id, 1)} />
              </div>
              {notesInitialLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="list-row" />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <EmptyState compact icon={FileText} title="No notes yet" />
              ) : (
                <>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} projectId={id} />
                    ))}
                  </div>
                  {notesTotal > 0 && (
                    <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border">
                      <button
                        onClick={notesPrevPage}
                        disabled={notesPage === 1}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <span className="text-caption text-muted-foreground">Page {notesPage}</span>
                      <button
                        onClick={notesNextPage}
                        disabled={!notesHasMore}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <ProjectInsights tasks={statsTasks} loading={statsInitialLoading} />
        </div>
      </div>
    </Layout>
  );
}

export default ProjectDetail;
