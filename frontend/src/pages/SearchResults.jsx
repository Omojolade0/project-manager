import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Layout from "@/layouts/Layout";
import { Input } from "@/components/ui/input";
import searchService from "@/services/searchService";
import Skeleton from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { getPageNumbers, ELLIPSIS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const LIMIT = 10;

const TABS = [
  { value: "all", label: "All" },
  { value: "projects", label: "Projects" },
  { value: "tasks", label: "Tasks" },
];

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryInput, setQueryInput] = useState(q);
  const isInitialLoading = loading && !data;

  useEffect(() => {
    setQueryInput(q);
  }, [q]);

  useEffect(() => {
    if (!q.trim()) {
      setData(null);
      return;
    }

    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await searchService.searchFull({
          q,
          type,
          page,
          limit: LIMIT,
        });
        if (!ignore) setData(response);
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [q, type, page]);

  function changeTab(nextType) {
    setSearchParams({ q, type: nextType, page: "1" });
  }

  function submitQuery(e) {
    e.preventDefault();
    const text = queryInput.trim();
    if (!text) return;
    setSearchParams({ q: text, type, page: "1" });
  }

  function goToPage(nextPage) {
    setSearchParams({ q, type, page: String(nextPage) });
  }

  function goToProject(projectId) {
    navigate(`/projects/${projectId}`);
  }

  const projectsPage = data?.projects;
  const tasksPage = data?.tasks;
  const activePage = type === "projects" ? projectsPage : tasksPage;
  const activeTotalPages = activePage
    ? Math.max(1, Math.ceil(activePage.total / activePage.limit))
    : 1;

  const isEmpty =
    !loading &&
    data &&
    (type === "projects"
      ? (projectsPage?.items?.length ?? 0) === 0
      : type === "tasks"
        ? (tasksPage?.items?.length ?? 0) === 0
        : (projectsPage?.items?.length ?? 0) === 0 &&
          (tasksPage?.items?.length ?? 0) === 0);

  return (
    <Layout>
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="mb-6">
          <h2 className="text-section font-semibold text-foreground mb-3">
            Search results
          </h2>
          <form onSubmit={submitQuery} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="rounded-xl pl-9 bg-card border-border text-body"
              placeholder="Search..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
            />
          </form>
          <p className="text-small text-muted-foreground mt-2">
            {q ? `Results for "${q}"` : "Enter a search term to see results"}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => changeTab(tab.value)}
              className={[
                "px-4 py-1.5 rounded-lg text-small font-medium transition-colors",
                type === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState
            variant="page"
            title="Couldn't load search results"
            actionLabel="Retry"
            onAction={() => setSearchParams({ q, type, page: String(page) })}
          />
        ) : isInitialLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="list-row" />
            ))}
          </div>
        ) : !q.trim() ? null : isEmpty ? (
          <EmptyState
            icon={Search}
            title={`No results for "${q}"`}
            subtext="Try a different search term"
          />
        ) : (
          <>
            {(type === "all" || type === "projects") && projectsPage && (
              <div className="mb-6">
                {type === "all" && (
                  <h3 className="text-caption font-normal uppercase tracking-wide text-muted-foreground mb-2">
                    Projects
                  </h3>
                )}
                {projectsPage.items.length === 0 ? (
                  <p className="text-small text-muted-foreground">No matching projects</p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {projectsPage.items.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => goToProject(project.id)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted transition-colors"
                      >
                        <FolderKanban className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 min-w-0 text-body text-foreground truncate">
                          {project.name}
                        </span>
                        <span className="ml-auto text-caption font-normal uppercase tracking-wide text-muted-foreground shrink-0">
                          Project
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(type === "all" || type === "tasks") && tasksPage && (
              <div>
                {type === "all" && (
                  <h3 className="text-caption font-normal uppercase tracking-wide text-muted-foreground mb-2">
                    Tasks
                  </h3>
                )}
                {tasksPage.items.length === 0 ? (
                  <p className="text-small text-muted-foreground">No matching tasks</p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {tasksPage.items.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => goToProject(task.project_id)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <div className="text-body text-foreground truncate">
                            {task.title}
                          </div>
                          <div className="text-small text-muted-foreground truncate">
                            {task.project_name}
                          </div>
                        </div>
                        <span className="ml-auto text-caption font-normal uppercase tracking-wide text-muted-foreground shrink-0">
                          Task
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {type !== "all" && activeTotalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-border">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-body font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {getPageNumbers(page, activeTotalPages).map((pageNum, i) =>
                  pageNum === ELLIPSIS ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-9 h-9 flex items-center justify-center text-small text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "w-9 h-9 rounded-full text-small font-semibold transition-colors",
                        pageNum === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={
                    !(type === "projects"
                      ? projectsPage?.has_more
                      : tasksPage?.has_more)
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-body font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default SearchResults;
