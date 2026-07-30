import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import taskService from "@/services/taskService";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";

const LIMIT = 5;
const DUE_SOON_DAYS = 7;

function getUrgency(dueDate) {
  if (!dueDate) return "default";
  const due = new Date(dueDate);
  const now = new Date();
  if (due < now) return "overdue";
  const soonThreshold = new Date(now);
  soonThreshold.setDate(soonThreshold.getDate() + DUE_SOON_DAYS);
  if (due <= soonThreshold) return "due";
  return "default";
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const dotStyles = {
  overdue: "bg-status-overdue",
  due: "bg-status-due",
  default: "bg-status-todo",
};

function UpcomingSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUpcoming = useCallback(async () => {
    let ignore = false;
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks({
        sort: "deadline",
        page: 1,
        limit: LIMIT,
      });
      if (!ignore) setTasks(response.items);
    } catch (err) {
      console.error("Error fetching upcoming tasks:", err);
      if (!ignore) setError(err);
    } finally {
      if (!ignore) setLoading(false);
    }
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  function goToTask(task) {
    navigate(`/projects/${task.project.id}`);
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-4">
      <h2 className="text-section text-foreground mb-3">Upcoming</h2>

      {error ? (
        <ErrorState title="Couldn't load upcoming tasks" onAction={fetchUpcoming} />
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="list-row" className="h-10" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState compact title="Nothing due — you're all caught up." />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const urgency = getUrgency(task.due_date);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => goToTask(task)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-muted transition-colors"
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${dotStyles[urgency]}`}
                />
                <span className="text-body text-foreground truncate flex-1 min-w-0">
                  {task.title}
                </span>
                {task.project?.name && (
                  <span className="text-small text-muted-foreground truncate shrink-0 max-w-[120px]">
                    {task.project.name}
                  </span>
                )}
                {task.due_date && (
                  <span
                    className={`text-small shrink-0 ${
                      urgency === "overdue"
                        ? "text-status-overdue"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatDate(task.due_date)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UpcomingSection;