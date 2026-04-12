import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

function Topbar() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const title = useMemo(() => getTitle(pathname), [pathname]);
  const showSearch = pathname === "/projects";
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === "/projects") {
      navigate(`/projects?search=${search}`);
    }
  }, [search]);

  useEffect(() => {
    setSearch("");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF8] border-b border-slate-100">
      <div className="flex items-center justify-between px-8 py-4">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="w-56 rounded-xl pl-9 bg-white border-slate-200 text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
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
