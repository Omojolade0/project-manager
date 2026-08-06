function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysLate(dueDate) {
  const due = startOfDay(dueDate);
  const today = startOfDay(new Date());
  return Math.round((today - due) / 86400000);
}

export function getUrgency(dueDate) {
  if (!dueDate) return "default";
  const late = daysLate(dueDate);
  if (late > 0) return "overdue";
  if (late >= -7) return "due";
  return "default";
}

// Renders a due-date pill label ("2d overdue" / "Today" / "Tomorrow" / "In 7d")
// alongside the urgency tone used to color it.
export function formatDuePill(dueDate) {
  if (!dueDate) return null;
  const late = daysLate(dueDate);
  if (late > 0) return { label: `${late}d overdue`, tone: "overdue" };
  if (late === 0) return { label: "Today", tone: "due" };
  if (late === -1) return { label: "Tomorrow", tone: "due" };
  return { label: `In ${Math.abs(late)}d`, tone: late >= -7 ? "due" : "default" };
}
