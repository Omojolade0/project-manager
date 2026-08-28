import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysLate, getUrgency } from "@/lib/taskUrgency";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const DOT_STYLES = {
  overdue: "bg-status-overdue",
  due: "bg-status-due",
  default: "bg-status-todo",
};

function formatDateBadge(dueDate) {
  const d = new Date(dueDate);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function DateBadge({ dueDate, overdue }) {
  if (!dueDate) {
    return (
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-muted-foreground shrink-0">
        <span className="text-body font-semibold leading-none">—</span>
      </div>
    );
  }
  const { day, month } = formatDateBadge(dueDate);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-11 h-11 rounded-xl shrink-0",
        overdue ? "bg-status-overdue-tint text-status-overdue" : "bg-secondary text-primary",
      )}
    >
      <span className="text-body font-semibold leading-none">{day}</span>
      <span className="text-caption font-medium tracking-wide mt-0.5">{month}</span>
    </div>
  );
}

function DueLabel({ dueDate }) {
  if (!dueDate) {
    return null;
  }
  const late = daysLate(dueDate);
  if (late > 0) {
    return (
      <span className="text-small font-medium px-2.5 py-1 rounded-full bg-status-overdue-tint text-status-overdue shrink-0">
        {late} day{late === 1 ? "" : "s"} late
      </span>
    );
  }
  if (late === 0) {
    return (
      <span className="text-small font-medium px-2.5 py-1 rounded-full bg-status-due-tint text-status-due shrink-0">
        Due today
      </span>
    );
  }
  const remaining = Math.abs(late);
  return (
    <span className="text-small font-medium px-2.5 py-1 rounded-full bg-secondary text-primary shrink-0">
      Due in {remaining} day{remaining === 1 ? "" : "s"}
    </span>
  );
}

function TickCircle({ done, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || done}
      aria-label={done ? "Task completed" : "Mark task as done"}
      className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        done
          ? "bg-status-done border-status-done text-primary-foreground"
          : "border-border hover:border-primary",
      )}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : done ? (
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      ) : null}
    </button>
  );
}

function TaskRow({ task, updating = false, onToggleDone, onNavigate }) {
  const urgency = getUrgency(task.due_date);
  const done = task.status === "Done";

  return (
    <div
      onClick={() => onNavigate(task)}
      className={cn(
        "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border border-transparent transition-all duration-150 hover:translate-x-1 hover:bg-card hover:border-border hover:shadow-card",
        done && "opacity-60",
      )}
    >
      <DateBadge dueDate={task.due_date} overdue={urgency === "overdue"} />

      <div onClick={(e) => e.stopPropagation()}>
        <TickCircle done={done} loading={updating} onClick={() => onToggleDone(task)} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-body font-medium truncate",
            done ? "line-through text-muted-foreground" : "text-foreground",
          )}
        >
          {task.title}
        </p>
        {task.project?.name && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_STYLES[urgency]}`} />
            <span className="text-small text-muted-foreground truncate">
              {task.project.name}
            </span>
          </div>
        )}
      </div>

      <DueLabel dueDate={task.due_date} />
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}

export default TaskRow;
