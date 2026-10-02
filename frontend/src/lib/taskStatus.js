export const STATUS_META = {
  Todo: { label: "Todo", dot: "bg-status-todo", tint: "bg-status-todo-tint text-status-todo" },
  Inprogress: {
    label: "In Progress",
    dot: "bg-status-progress",
    tint: "bg-status-progress-tint text-status-progress",
  },
  Done: { label: "Done", dot: "bg-status-done", tint: "bg-status-done-tint text-status-done" },
};

export const STATUS_ORDER = ["Todo", "Inprogress", "Done"];

// Done tasks beyond this count start collapsed behind a "Show more" control,
// in both the task list and the Kanban board's Done column.
export const DONE_TASKS_CAP = 5;
