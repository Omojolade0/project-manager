import { NavLink, useNavigate } from "react-router-dom";
import ItemsNav from "./ItemsNav";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

function Sidebar({ isCollapsed, setIsCollapsed, mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // On mobile the drawer always shows full content; on desktop it follows the
  // hover-driven isCollapsed state.
  const expanded = mobileOpen || !isCollapsed;

  const navItems = [
    { label: "Dashboard", to: "/dashboard", Icon: LayoutDashboard },
    { label: "Projects", to: "/projects", Icon: FolderKanban },
    { label: "Upcoming Tasks", to: "/tasks", Icon: ListTodo },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        onClick={(e) => {
          if (mobileOpen && e.target.closest("a, button")) onMobileClose?.();
        }}
        className={[
          "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border w-64",
          "transition-transform md:transition-all duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
        ].join(" ")}
        style={{
          borderRadius: "0 24px 24px 0",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex h-full flex-col px-3 py-5">
          {/* Logo */}
          <div
            className={[
              "flex items-center mb-8 px-2",
              expanded ? "" : "justify-center",
            ].join(" ")}
          >
            {expanded ? (
              <div className="flex items-center gap-2">
                <img src="/coeus-favicon.svg" alt="" className="w-7 h-7 shrink-0" />
                <span className="text-section font-semibold text-foreground tracking-tight">
                  Coeus
                </span>
              </div>
            ) : (
              <img src="/coeus-favicon.svg" alt="Coeus" className="w-8 h-8" />
            )}
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {/* Search only lives in the topbar on desktop — on mobile the
                topbar search is hidden, so it needs an entry point here. */}
            <div className="md:hidden">
              <ItemsNav
                item={{ label: "Search", to: "/search", Icon: Search }}
                collapsed={!expanded}
              />
            </div>
            {navItems.map((item) => (
              <ItemsNav key={item.to} item={item} collapsed={!expanded} />
            ))}
          </nav>

          {/* Bottom */}
          <div className="mt-auto flex flex-col gap-1">
            {/* User profile */}
            {expanded && user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-muted rounded-xl">
                <div className="w-8 h-8 rounded-full bg-secondary-tint flex items-center justify-center shrink-0">
                  <span className="text-caption font-semibold text-primary">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="leading-tight overflow-hidden">
                  <p className="text-body font-medium text-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-small text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            )}

            {!expanded && user && (
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary-tint flex items-center justify-center">
                  <span className="text-caption font-semibold text-primary">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body transition-colors",
                  "hover:bg-muted text-muted-foreground hover:text-foreground",
                  isActive ? "bg-muted text-foreground" : "",
                  expanded ? "" : "justify-center",
                ].join(" ")
              }
            >
              <Settings className="h-4 w-4 shrink-0" />
              {expanded && <span>Settings</span>}
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body transition-colors",
                "hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full",
                expanded ? "" : "justify-center",
              ].join(" ")}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {expanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
