import { Pin } from "lucide-react";
import TaskMenu from "@/features/tasks/TaskMenu";
import { PriorityBadge, DueDatePill } from "@/features/tasks/taskDisplay";

function TaskCard({ task, projectId, onChange, onDuplicate }) {
  const isDone = task.status === "Done";

  return (
    <div className="group bg-card rounded-xl p-3.5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {task.is_pinned && (
            <Pin className="w-3 h-3 text-primary shrink-0 fill-primary" />
          )}
          <h4
            className={`text-small font-semibold leading-snug truncate ${
              isDone ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
        </div>
        <TaskMenu
          task={task}
          projectId={projectId}
          onChange={onChange}
          onDuplicate={onDuplicate}
        />
      </div>

      {task.description && (
        <p className="text-caption text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {(task.priority || task.due_date) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <DueDatePill dueDate={task.due_date} isDone={isDone} />
        </div>
      )}
    </div>
  );
}

export default TaskCard;
