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
