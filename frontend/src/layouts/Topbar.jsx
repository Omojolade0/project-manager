import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { Bell, Search, FolderKanban, CheckSquare, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import searchService from "@/services/searchService";
import CommandPalette from "@/components/CommandPalette";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const titles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/settings": "Settings",
  "/search": "Search",
  "/tasks": "Upcoming Tasks",
};

const getTitle = (pathname) => {
  const match = Object.keys(titles)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(path + "/"));
  return titles[match] ?? "Page";
};

const SEARCH_DEBOUNCE_MS = 300;

function Topbar({ onOpenMobileNav }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const title = useMemo(() => getTitle(pathname), [pathname]);
  const navigate = useNavigate();

  const flatResults = useMemo(() => {
    const projectItems = (results?.projects ?? []).map((project) => ({
      type: "project",
      id: project.id,
      label: project.name,
    }));
    const taskItems = (results?.tasks ?? []).map((task) => ({
      type: "task",
      id: task.id,
      label: task.title,
      projectId: task.project_id,
    }));
    return [...projectItems, ...taskItems];
  }, [results]);

  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setResults(null);
      setOpen(false);
      setHighlightedIndex(-1);
      setSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await searchService.search(text);
        setResults(response);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch {
        setResults(null);
        setHighlightedIndex(-1);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  function goToProject(projectId) {
    setOpen(false);
    setQuery("");
    setHighlightedIndex(-1);
    navigate(`/projects/${projectId}`);
  }

  function selectItem(item) {
    if (!item) return;
    goToProject(item.type === "project" ? item.id : item.projectId);
  }

  function handleKeyDown(e) {
    if (!open || flatResults.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        selectItem(flatResults[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      e.currentTarget.blur();
    }
  }

  function goToFullResults() {
    const text = query.trim();
    setOpen(false);
    setQuery("");
    setHighlightedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(text)}&type=all`);
  }

  const hasResults =
    results && ((results.projects?.length ?? 0) > 0 || (results.tasks?.length ?? 0) > 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onOpenMobileNav}
            className="md:hidden h-9 w-9 shrink-0 rounded-xl flex items-center justify-center hover:bg-muted border border-transparent hover:border-border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </button>
          {pathname === "/dashboard" && (
            <h2 className="text-page-title font-semibold text-foreground tracking-tight truncate">
              {title}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden md:block" ref={containerRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-56 rounded-xl pl-9 bg-card border-border text-body"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (hasResults) {
                  setOpen(true);
                  setHighlightedIndex(-1);
                }
              }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={open}
              aria-controls="topbar-search-listbox"
            />
            {searching && (
              <LoadingSpinner
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            )}
            {open && (
              <div
                id="topbar-search-listbox"
                role="listbox"
                className="absolute right-0 mt-2 w-72 bg-popover rounded-xl border border-border shadow-lg py-2 max-h-80 overflow-y-auto"
              >
                {!hasResults ? (
                  <p className="text-small text-muted-foreground text-center py-4">
                    No results
                  </p>
                ) : (
                  <>
                    {results.projects?.map((project, i) => (
                      <button
                        key={`project-${project.id}`}
                        ref={(el) => (itemRefs.current[i] = el)}
                        role="option"
                        aria-selected={highlightedIndex === i}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onClick={() => goToProject(project.id)}
                        className={[
                          "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                          highlightedIndex === i ? "bg-accent" : "hover:bg-accent/60",
                        ].join(" ")}
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-body text-popover-foreground truncate">
                          {project.name}
                        </span>
                        <span className="ml-auto text-caption font-normal uppercase tracking-wide text-muted-foreground shrink-0">
                          Project
                        </span>
                      </button>
                    ))}
                    {results.tasks?.map((task, j) => {
                      const i = (results.projects?.length ?? 0) + j;
                      return (
                        <button
                          key={`task-${task.id}`}
                          ref={(el) => (itemRefs.current[i] = el)}
                          role="option"
                          aria-selected={highlightedIndex === i}
                          onMouseEnter={() => setHighlightedIndex(i)}
                          onClick={() => goToProject(task.project_id)}
                          className={[
                            "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                            highlightedIndex === i ? "bg-accent" : "hover:bg-accent/60",
                          ].join(" ")}
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-body text-popover-foreground truncate">
                            {task.title}
                          </span>
                          <span className="ml-auto text-caption font-normal uppercase tracking-wide text-muted-foreground shrink-0">
                            Task
                          </span>
                        </button>
                      );
                    })}
                    <button
                      onClick={goToFullResults}
                      className="w-full text-center text-caption font-medium text-primary hover:text-primary/80 py-2 mt-1 border-t border-border"
                    >
                      See all results
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <CommandPalette />
          <button
            type="button"
            aria-label="Notifications"
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted border border-transparent hover:border-border transition-all bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;