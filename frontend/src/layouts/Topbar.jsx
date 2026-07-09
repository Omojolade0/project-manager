import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { Bell, Search, FolderKanban, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import searchService from "@/services/searchService";

const titles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/settings": "Settings",
};

const getTitle = (pathname) => {
  const match = Object.keys(titles)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(path + "/"));
  return titles[match] ?? "Page";
};

const SEARCH_DEBOUNCE_MS = 300;

function Topbar() {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const title = useMemo(() => getTitle(pathname), [pathname]);
  const navigate = useNavigate();

  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setResults(null);
      setOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchService.search(text);
        setResults(response);
        setOpen(true);
      } catch {
        setResults(null);
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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToProject(projectId) {
    setOpen(false);
    setQuery("");
    navigate(`/projects/${projectId}`);
  }

  const hasResults =
    results && ((results.projects?.length ?? 0) > 0 || (results.tasks?.length ?? 0) > 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF8] border-b border-slate-100">
      <div className="flex items-center justify-between px-8 py-4">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative" ref={containerRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="w-56 rounded-xl pl-9 bg-white border-slate-200 text-sm"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => hasResults && setOpen(true)}
            />
            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-100 shadow-lg py-2 max-h-80 overflow-y-auto">
                {!hasResults ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No results
                  </p>
                ) : (
                  <>
                    {results.projects?.map((project) => (
                      <button
                        key={`project-${project.id}`}
                        onClick={() => goToProject(project.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-900 truncate">
                          {project.name}
                        </span>
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 shrink-0">
                          Project
                        </span>
                      </button>
                    ))}
                    {results.tasks?.map((task) => (
                      <button
                        key={`task-${task.id}`}
                        onClick={() => goToProject(task.project_id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-900 truncate">
                          {task.title}
                        </span>
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 shrink-0">
                          Task
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-200 transition-all bg-transparent"
          >
            <Bell className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;