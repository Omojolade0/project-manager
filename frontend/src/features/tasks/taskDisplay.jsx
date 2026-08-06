import { BarChart2 } from "lucide-react";
import { formatDuePill } from "@/lib/taskUrgency";
import { STATUS_META } from "@/lib/taskStatus";

const PRIORITY_META = {
  Low: "bg-status-done-tint text-status-done",
  Medium: "bg-status-progress-tint text-status-progress",
  High: "bg-status-overdue-tint text-status-overdue",
};

const DUE_TONE_CLASSES = {
  overdue: "bg-status-overdue-tint text-status-overdue",
  due: "bg-status-due-tint text-status-due",
  default: "bg-muted text-muted-foreground",
};

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption font-medium shrink-0 ${
        PRIORITY_META[priority] || "bg-muted text-muted-foreground"
      }`}
    >
      <BarChart2 className="w-3 h-3" />
      {priority}
    </span>
  );
}

function formatPlainDate(dueDate) {
  return new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Done tasks show a plain date instead of urgency wording — a completed
// task that was once overdue shouldn't still read as "2d overdue".
export function DueDatePill({ dueDate, isDone = false }) {
  if (!dueDate) return null;
  if (isDone) {
    return (
      <span className="px-2 py-1 rounded-full text-caption font-medium shrink-0 bg-muted text-muted-foreground">
        {formatPlainDate(dueDate)}
      </span>
    );
  }
  const pill = formatDuePill(dueDate);
  if (!pill) return null;
  return (
    <span
      className={`px-2 py-1 rounded-full text-caption font-medium shrink-0 ${DUE_TONE_CLASSES[pill.tone]}`}
    >
      {pill.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium shrink-0 ${meta.tint}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
