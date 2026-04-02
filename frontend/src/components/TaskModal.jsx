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
import taskService from "@/services/taskService";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

function TaskModal({ projectId, onSuccess, task }) {
  const [selectedStatus, setSelectedStatus] = useState(
    task ? task.status : "Todo",
  );
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setSelectedStatus(task.status);
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

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    try {
      setLoading(true);
      await taskService.createTask(projectId, {
        title,
        description,
        status: selectedStatus,
      });
      setTitle("");
      setDescription("");
      setSelectedStatus("Todo");
      setOpen(false);

      onSuccess();
      toast.success("Task created");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setTitle("");
    setDescription("");
    setSelectedStatus("Todo");
    setOpen(false);
  }
  async function handleEdit(taskId) {
    try {
      setLoading(true);
      await taskService.updateTask(projectId, taskId, {
        title,
        description,
        status: selectedStatus,
      });
      setTitle("");
      setDescription("");
      setSelectedStatus("Todo");
      setOpen(false);

      toast.success("Task updated");
      onSuccess();
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
              {task ? "Update this task" : "Add a task to this project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
