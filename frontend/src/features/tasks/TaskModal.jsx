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
  DialogClose,
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
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useTasks } from "@/hooks/useTasks";
import projectService from "@/services/projectService";

function TaskModal({ projectId, task, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState(
    task ? task.status : "Todo",
  );
  const [selectedPriority, setSelectedPriority] = useState(
    task ? task.priority : null,
  );
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [open, setOpen] = useState(false);
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

  const statuses = [
    {
      id: "Todo",
      label: "Todo",
      color: "text-slate-500 border-slate-200 bg-slate-50",
      active: "border-slate-400 bg-slate-50",
    },
    {
      id: "Inprogress",
      label: "In Progress",
      color: "text-amber-700 border-amber-200 bg-amber-50",
      active: "border-amber-500 bg-amber-50",
    },
    {
      id: "Done",
      label: "Done",
      color: "text-green-700 border-green-200 bg-green-50",
      active: "border-green-500 bg-green-50",
    },
  ];
  const Priority = [
    {
      id: "Low",
      label: "Low",
      color: "text-green-700 border-green-200 bg-green-50",
      active: "border-green-500 bg-green-50",
    },
    {
      id: "Medium",
      label: "Medium",
      color: "text-amber-700 border-amber-200 bg-amber-50",
      active: "border-amber-500 bg-amber-50",
    },
    {
      id: "High",
      label: "High",
      color: "text-red-700 border-red-200 bg-red-50",
      active: "border-red-500 bg-red-50",
    },
  ];

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
      setSelectedStatus("Todo");
      setSelectedPriority(null);
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
      setSelectedStatus("Todo");
      setSelectedPriority(null);
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
      {task ? (
        <DialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {task ? "Edit Task" : "New Task"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {task
                ? "Update this task"
                : needsProjectPicker
                  ? "Add a task and choose which project it belongs to"
                  : "Add a task to this project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {needsProjectPicker && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Project
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm">
                    <SelectValue
                      placeholder={
                        projectsLoading ? "Loading projects..." : "Select a project"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Task Name
              </Label>
              <Input
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
                required={true}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] bg-slate-50 border-slate-200 rounded-xl text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Pin to the top
              </Label>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Status
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStatus(s.id)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-medium transition-all",
                      selectedStatus === s.id
                        ? `${s.active} border-2`
                        : `${s.color} border hover:opacity-80`,
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Priority
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {Priority.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriority(p.id)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-medium transition-all",
                      selectedPriority === p.id
                        ? `${p.active} border-2`
                        : `${p.color} border hover:opacity-80`,
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Date</Label>
              <Input
                placeholder="Any additional data?"
                type="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <DialogClose
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </DialogClose>

          {task ? (
            <Button
              onClick={() => handleEdit(task.id)}
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskModal;
