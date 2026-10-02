import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ListChecks, Pin, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useTasks } from "@/hooks/useTasks";
import projectService from "@/services/projectService";
import { daysLate } from "@/lib/taskUrgency";

const STATUSES = [
  { id: "Todo", label: "Todo", dot: "bg-status-todo" },
  { id: "Inprogress", label: "In Progress", dot: "bg-status-progress" },
  { id: "Done", label: "Done", dot: "bg-status-done" },
];

const PRIORITIES = [
  {
    id: "Low",
    label: "Low",
    bar: "bg-status-done",
    ring: "border-status-done",
    tint: "bg-status-done-tint",
    hoverRing: "hover:border-status-done",
    hoverTint: "hover:bg-status-done-tint",
    hoverBar: "group-hover:bg-status-done",
  },
  {
    id: "Medium",
    label: "Medium",
    bar: "bg-status-progress",
    ring: "border-status-progress",
    tint: "bg-status-progress-tint",
    hoverRing: "hover:border-status-progress",
    hoverTint: "hover:bg-status-progress-tint",
    hoverBar: "group-hover:bg-status-progress",
  },
  {
    id: "High",
    label: "High",
    bar: "bg-status-overdue",
    ring: "border-status-overdue",
    tint: "bg-status-overdue-tint",
    hoverRing: "hover:border-status-overdue",
    hoverTint: "hover:bg-status-overdue-tint",
    hoverBar: "group-hover:bg-status-overdue",
  },
];

function toDateInputValue(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function dueHint(dateStr) {
  if (!dateStr) return null;
  const late = daysLate(dateStr);
  if (late > 0) return `${late} day${late === 1 ? "" : "s"} late`;
  if (late === 0) return "Today";
  const remaining = Math.abs(late);
  if (remaining === 1) return "Tomorrow";
  return `In ${remaining} days`;
}

function quickDateClass(active) {
  return cn(
    "px-3.5 py-1.5 rounded-full text-small font-medium border transition-colors shrink-0",
    active
      ? "border-primary text-primary bg-primary/5"
      : "border-border text-foreground hover:bg-muted",
  );
}

function TaskModal({
  projectId,
  task,
  onSuccess,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  defaultStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    task ? task.status : defaultStatus || "Todo",
  );
  const [selectedPriority, setSelectedPriority] = useState(
    task ? task.priority : "Low",
  );
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(
    task ? (task.due_date ? task.due_date.split("T")[0] : null) : null,
  );
  const [isPinned, setIsPinned] = useState(
    task ? task.is_pinned || false : false,
  );

  // No projectId was supplied (e.g. "New Task" from a cross-project page) —
  // the user must pick which project this task belongs to.
  const needsProjectPicker = !projectId;
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    if (!needsProjectPicker || !open) return;
    let ignore = false;
    (async () => {
      try {
        setProjectsLoading(true);
        const response = await projectService.getProjects(1, 100);
        if (!ignore) setAvailableProjects(response.items);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        if (!ignore) setProjectsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [needsProjectPicker, open]);

  const effectiveProjectId = projectId || selectedProjectId || task?.project_id;
  const { createTask, editTask } = useTasks(effectiveProjectId);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setSelectedStatus(task.status);
      setSelectedPriority(task.priority);
      setDate(task.due_date ? task.due_date.split("T")[0] : null); // ← only take the date part
      setIsPinned(task.is_pinned || false);
    }
  }, [task]);

  const todayValue = toDateInputValue(new Date());
  const tomorrowValue = toDateInputValue(addDays(new Date(), 1));
  const nextWeekValue = toDateInputValue(addDays(new Date(), 7));

  function selectQuickDate(days) {
    setDate(toDateInputValue(addDays(new Date(), days)));
  }

  const isValid = title.trim() && (!needsProjectPicker || selectedProjectId);

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (needsProjectPicker && !selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    try {
      setLoading(true);
      await createTask({
        title,
        description,
        status: selectedStatus,
        priority: selectedPriority,
        due_date: date || null,
        is_pinned: isPinned,
      });
      setTitle("");
      setDescription("");
      setSelectedStatus(defaultStatus || "Todo");
      setSelectedPriority("Low");
      setDate(null);
      setIsPinned(false);
      setSelectedProjectId("");
      setOpen(false);
      toast.success("Task created");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (!task) {
      setTitle("");
      setDescription("");
      setSelectedStatus(defaultStatus || "Todo");
      setSelectedPriority("Low");
      setDate(null);
      setIsPinned(false);
      setSelectedProjectId("");
    }
    setOpen(false);
  }

  async function handleEdit(taskId) {
    try {
      setLoading(true);
      await editTask(taskId, {
        title,
        description,
        status: selectedStatus,
        priority: selectedPriority,
        due_date: date || null,
        is_pinned: isPinned,
      });
      setOpen(false);
      toast.success("Task updated");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger &&
        (task ? (
          <DialogTrigger asChild>
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-body h-9 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-body h-9 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </DialogTrigger>
        ))}

      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl p-6">
        <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shrink-0">
            <ListChecks className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-section font-semibold text-foreground">
              {task ? "Edit task" : "New task"}
            </DialogTitle>
            <DialogDescription className="text-small text-muted-foreground">
              {task
                ? "Update this task's details."
                : needsProjectPicker
                  ? "Add a task and choose which project it belongs to"
                  : "Add a task to this project"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 border-0 rounded-none shadow-none bg-transparent px-4 text-body focus-visible:ring-0"
            />
            <Textarea
              placeholder="Add more details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[70px] border-0 rounded-none shadow-none bg-muted/50 px-4 py-3 text-small resize-none focus-visible:ring-0"
            />
          </div>

          {needsProjectPicker && (
            <div className="space-y-1.5">
              <Label htmlFor="task-project" className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Project <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="task-project" className="h-11 rounded-full bg-card border-border text-small">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        selectedProjectId ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    <SelectValue
                      placeholder={
                        projectsLoading ? "Loading projects..." : "Select a project"
                      }
                    />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => {
                    const open = Math.max(
                      (project.task_count ?? 0) - (project.completed_count ?? 0),
                      0,
                    );
                    return (
                      <SelectItem key={project.id} value={project.id}>
                        <span className="flex items-center justify-between w-full gap-4">
                          <span className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate">{project.name}</span>
                          </span>
                          <span className="text-caption text-muted-foreground shrink-0">
                            {open} open
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <div className="inline-flex items-center gap-0.5 bg-muted rounded-full p-1 w-full">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStatus(s.id)}
                    className={cn(
                      "flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-caption font-medium transition-colors whitespace-nowrap flex-1",
                      selectedStatus === s.id
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Priority
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((p) => {
                  const selected = selectedPriority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPriority(p.id)}
                      className={cn(
                        "group flex flex-col items-center gap-1.5 rounded-xl border-2 py-2.5 transition-colors",
                        selected
                          ? `${p.ring} ${p.tint}`
                          : `border-border ${p.hoverRing} ${p.hoverTint}`,
                      )}
                    >
                      <span className="flex items-end gap-0.5">
                        <span
                          className={cn(
                            "w-1 h-1.5 rounded-sm transition-colors",
                            selected ? p.bar : `bg-muted-foreground/30 ${p.hoverBar}`,
                          )}
                        />
                        <span
                          className={cn(
                            "w-1 h-2.5 rounded-sm transition-colors",
                            selected ? p.bar : `bg-muted-foreground/30 ${p.hoverBar}`,
                          )}
                        />
                        <span
                          className={cn(
                            "w-1 h-3.5 rounded-sm transition-colors",
                            selected ? p.bar : `bg-muted-foreground/30 ${p.hoverBar}`,
                          )}
                        />
                      </span>
                      <span className="text-small font-medium text-foreground">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due-date" className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Due date
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => selectQuickDate(0)}
                className={quickDateClass(date === todayValue)}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => selectQuickDate(1)}
                className={quickDateClass(date === tomorrowValue)}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => selectQuickDate(7)}
                className={quickDateClass(date === nextWeekValue)}
              >
                Next week
              </button>
              <Input
                type="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value || null)}
                className="h-9 w-[150px] rounded-full bg-card border-border text-small"
              />
              {date && (
                <span className="text-caption text-muted-foreground whitespace-nowrap">
                  {dueHint(date)}
                </span>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors",
              isPinned ? "bg-secondary-tint" : "bg-muted",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                  isPinned ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground",
                )}
              >
                <Pin className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-small font-semibold",
                    isPinned ? "text-primary" : "text-foreground",
                  )}
                >
                  Pin to the top
                </p>
                <p className="text-caption text-muted-foreground truncate">
                  Show this task first on the project card
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPinned}
              onClick={() => setIsPinned((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isPinned ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-card shadow transition-transform",
                  isPinned ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-4 pt-4 mt-1 border-t border-border sm:justify-between">
          {!task && (
            <p className="text-caption text-muted-foreground">Name and project required</p>
          )}
          <div className="flex items-center gap-4 ml-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="text-small font-medium text-muted-foreground hover:text-foreground transition-all duration-150 hover:-translate-y-0.5"
            >
              Cancel
            </button>
            {task ? (
              <Button
                onClick={() => handleEdit(task.id)}
                disabled={loading || !isValid}
                className={cn(
                  "h-10 px-6 rounded-full text-small font-medium flex items-center gap-2 transition-all duration-150 hover:-translate-y-0.5",
                  loading || !isValid
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary hover:opacity-90 text-primary-foreground",
                )}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Save changes <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={loading || !isValid}
                className={cn(
                  "h-10 px-6 rounded-full text-small font-medium flex items-center gap-2 transition-all duration-150 hover:-translate-y-0.5",
                  loading || !isValid
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary hover:opacity-90 text-primary-foreground",
                )}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Create task <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskModal;
