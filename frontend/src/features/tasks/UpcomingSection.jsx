import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import taskService from "@/services/taskService";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import TaskRow from "@/features/tasks/TaskRow";
import { daysLate } from "@/lib/taskUrgency";

const FETCH_LIMIT = 20;
const DISPLAY_LIMIT = 5;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue" },
  { id: "week", label: "This week" },
];

const EMPTY_MESSAGES = {
  all: "Nothing due — you're all caught up.",
  overdue: "No overdue tasks",
  week: "Nothing due this week",
};

function matchesFilter(task, filter) {
  if (filter === "all") return true;
  if (!task.due_date) return false;
  const late = daysLate(task.due_date);
  if (filter === "overdue") return late > 0;
  if (filter === "week") return late <= 0 && late >= -7;
  return true;
}

function UpcomingSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks({
        sort: "deadline",
        page: 1,
        limit: FETCH_LIMIT,
      });
      setTasks(response.items);
    } catch (err) {
      console.error("Error fetching upcoming tasks:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesFilter(task, filter)).slice(0, DISPLAY_LIMIT),
    [tasks, filter],
  );

  function goToTask(task) {
    navigate(`/projects/${task.project.id}`);
  }

  async function handleToggleDone(task) {
    if (task.status === "Done" || updatingId) return;
    try {
      setUpdatingId(task.id);
      await taskService.updateTask(task.project.id, task.id, { status: "Done" });
      await fetchUpcoming();
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Failed to update task");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-section text-foreground">Upcoming Tasks</h2>
          <span className="text-caption font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {filteredTasks.length}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1 self-start sm:self-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-small font-medium transition-colors",
                filter === f.id
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState title="Couldn't load upcoming tasks" onAction={fetchUpcoming} />
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="list-row" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState compact title={EMPTY_MESSAGES[filter]} />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              updating={updatingId === task.id}
              onToggleDone={handleToggleDone}
              onNavigate={goToTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingSection;
