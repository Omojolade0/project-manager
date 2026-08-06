import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { getUrgency } from "@/lib/taskUrgency";
import { STATUS_META, STATUS_ORDER } from "@/lib/taskStatus";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function lastSevenDays() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function ProjectInsights({ tasks, loading }) {
  const stats = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "Done");
    const dueThisWeek = open.filter((t) => getUrgency(t.due_date) === "due");
    const overdue = open.filter((t) => getUrgency(t.due_date) === "overdue");

    const byStatus = STATUS_ORDER.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
    }));

    const days = lastSevenDays();
    const completedByDay = days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = tasks.filter((t) => {
        if (t.status !== "Done" || !t.updated_at) return false;
        const updated = new Date(t.updated_at);
        return updated >= day && updated < next;
      }).length;
      return { day, count };
    });
    const completedThisWeek = completedByDay.reduce((sum, d) => sum + d.count, 0);

    return {
      total: tasks.length,
      openCount: open.length,
      dueThisWeekCount: dueThisWeek.length,
      overdueCount: overdue.length,
      byStatus,
      completedByDay,
      completedThisWeek,
    };
  }, [tasks]);

  const insight = (() => {
    if (stats.overdueCount > 0) {
      return {
        tone: "overdue",
        text: `${stats.overdueCount} overdue task${stats.overdueCount === 1 ? "" : "s"} ${
          stats.overdueCount === 1 ? "is" : "are"
        } holding the ring back.`,
      };
    }
    if (stats.dueThisWeekCount > 0) {
      return {
        tone: "due",
        text: `${stats.dueThisWeekCount} task${stats.dueThisWeekCount === 1 ? "" : "s"} due this week — stay ahead of it.`,
      };
    }
    if (stats.openCount === 0 && stats.total > 0) {
      return { tone: "done", text: "All caught up — nice work!" };
    }
    return {
      tone: "default",
      text: `${stats.openCount} task${stats.openCount === 1 ? "" : "s"} still open.`,
    };
  })();

  const INSIGHT_TONE_CLASSES = {
    overdue: "bg-status-overdue-tint text-status-overdue",
    due: "bg-status-due-tint text-status-due",
    done: "bg-status-done-tint text-status-done",
    default: "bg-muted text-muted-foreground",
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-secondary-tint rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-card-title text-foreground">Insights</h3>
          <p className="text-caption text-muted-foreground">
            {stats.total} task{stats.total === 1 ? "" : "s"} tracked
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="stat-card" />
        </div>
      ) : stats.total === 0 ? (
        <EmptyState compact icon={BarChart3} title="No tasks to analyze yet" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl bg-muted p-3.5">
              <p className="text-page-title text-foreground leading-none mb-1.5">
                {stats.openCount}
              </p>
              <p className="text-caption text-muted-foreground">Open</p>
            </div>
            <div className="rounded-xl bg-status-progress-tint p-3.5">
              <p className="text-page-title text-status-progress leading-none mb-1.5">
                {stats.dueThisWeekCount}
              </p>
              <p className="text-caption text-status-progress">Due this week</p>
            </div>
            <div className="rounded-xl bg-status-overdue-tint p-3.5">
              <p className="text-page-title text-status-overdue leading-none mb-1.5">
                {stats.overdueCount}
              </p>
              <p className="text-caption text-status-overdue">Overdue</p>
            </div>
          </div>

          <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Status mix
          </p>
          <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden bg-muted mb-2">
            {stats.byStatus.map(
              ({ status, count }) =>
                count > 0 && (
                  <div
                    key={status}
                    className={STATUS_META[status].dot}
                    style={{ width: `${(count / stats.total) * 100}%`, height: "100%" }}
                  />
                ),
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap mb-5">
            {stats.byStatus.map(({ status, count }) => (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 text-caption text-muted-foreground"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[status].dot}`} />
                {STATUS_META[status].label}
                <span className="font-semibold text-foreground">{count}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
              Completed this week
            </p>
            <p className="text-caption text-muted-foreground">
              {stats.completedThisWeek} task{stats.completedThisWeek === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-10 mb-1.5">
            {stats.completedByDay.map(({ count }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-md ${count > 0 ? "bg-primary" : "bg-muted"}`}
                  style={{ height: count > 0 ? `${Math.min(count, 4) * 20 + 20}%` : "10%" }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-1.5 mb-5">
            {stats.completedByDay.map(({ day }, i) => {
              const isToday = i === stats.completedByDay.length - 1;
              return (
                <span
                  key={i}
                  className={`flex-1 text-center text-caption ${
                    isToday ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {DAY_LABELS[day.getDay()]}
                </span>
              );
            })}
          </div>

          <div className={`rounded-xl px-3.5 py-2.5 text-caption ${INSIGHT_TONE_CLASSES[insight.tone]}`}>
            {insight.text}
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectInsights;
