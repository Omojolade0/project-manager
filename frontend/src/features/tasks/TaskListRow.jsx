import { useState } from "react";
import { Check, Pin } from "lucide-react";
import toast from "react-hot-toast";
import StatusDropdown from "@/components/StatusDropdown";
import TaskMenu from "@/features/tasks/TaskMenu";
import { PriorityBadge, DueDatePill } from "@/features/tasks/taskDisplay";
import { useTasks } from "@/hooks/useTasks";

function TaskListRow({ task, projectId, onChange, onDuplicate }) {
  const [togglingDone, setTogglingDone] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { editTask } = useTasks(projectId);
  const isDone = task.status === "Done";

  async function handleToggleDone() {
    try {
      setTogglingDone(true);
      await editTask(task.id, { status: isDone ? "Todo" : "Done" });
      onChange?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setTogglingDone(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      setUpdatingStatus(true);
      await editTask(task.id, { status: newStatus });
      onChange?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-muted/50 shadow-card hover:bg-muted hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <button
        onClick={handleToggleDone}
        disabled={togglingDone}
        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          isDone
            ? "bg-status-done border-status-done text-primary-foreground"
            : "border-border hover:border-primary"
        }`}
      >
        {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {task.is_pinned && (
            <Pin className="w-3 h-3 text-primary shrink-0 fill-primary" />
          )}
          <h4
            className={`text-body font-medium truncate ${
              isDone ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
        </div>
        {task.description && (
          <p className="text-small text-muted-foreground truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />
        <DueDatePill dueDate={task.due_date} isDone={isDone} />
      </div>

      <StatusDropdown
        currentStatus={task.status}
        statuses={["Todo", "Inprogress", "Done"]}
        onStatusChange={handleStatusChange}
        updatingStatus={updatingStatus}
      />

      <TaskMenu
        task={task}
        projectId={projectId}
        onChange={onChange}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}

export default TaskListRow;
