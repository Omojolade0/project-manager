import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import taskService from "@/services/taskService";
import { Plus, Edit } from "lucide-react";

function TaskModal({ projectId, onSuccess, task }) {
  const [selectedStatus, setSelectedStatus] = useState(
    task ? task.status : "Todo",
  );
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");

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
    try {
      await taskService.createTask(projectId, {
        title,
        description,
        status: selectedStatus,
      });
      setTitle("");
      setDescription("");
      setSelectedStatus("Todo");
      onSuccess();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  function handleCancel() {
    setTitle("");
    setDescription("");
    setSelectedStatus("Todo");
  }
  async function handleEdit(taskId) {
    try {
      await taskService.updateTask(projectId, taskId, {
        title,
        description,
        status: selectedStatus,
      });
      setTitle("");
      setDescription("");
      setSelectedStatus("Todo");
      onSuccess();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  return (
    <AlertDialog>
      {task ? (
        <AlertDialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <AlertDialogHeader className="mb-5">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              {task ? "Edit Task" : "New Task"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-400">
              {task ? "Update this task" : "Add a task to this project"}
            </AlertDialogDescription>
          </AlertDialogHeader>

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

        <AlertDialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </AlertDialogCancel>

          {task ? (
            <AlertDialogAction
              onClick={() => handleEdit(task.id)}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              Save Changes
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={handleCreate}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              Create Task
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default TaskModal;
