import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ItemsNav from "./ItemsNav";
import authService from "@/services/authService";
import { LayoutDashboard, FolderKanban, Settings, LogOut } from "lucide-react";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    async function getData() {
      try {
        const result = await authService.getMe();
        setUser(result);
      } catch (error) {
        handleLogout();
        console.error("Error fetching user data:", error);
      }
    }
    getData();
  }, []);

  const navItems = [
    { label: "Dashboard", to: "/dashboard", Icon: LayoutDashboard },
    { label: "Projects", to: "/projects", Icon: FolderKanban },
  ];

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={[
        "fixed left-0 top-0 z-50 h-screen bg-white",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      ].join(" ")}
      style={{
        borderRight: "1px solid #f1f5f9",
        borderRadius: "0 24px 24px 0",
        boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex h-full flex-col px-3 py-5">
        {/* Logo */}
        <div
          className={[
            "flex items-center mb-8 px-2",
            isCollapsed ? "justify-center" : "",
          ].join(" ")}
        >
          {isCollapsed ? (
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
          ) : (
            <span className="text-xl font-semibold text-slate-900 tracking-tight">
              Coeus
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <ItemsNav key={item.to} item={item} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-1">
          {/* User profile */}
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-indigo-600">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="leading-tight overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {isCollapsed && user && (
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-600">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                "hover:bg-slate-50 text-slate-500 hover:text-slate-900",
                isActive ? "bg-slate-50 text-slate-900" : "",
                isCollapsed ? "justify-center" : "",
              ].join(" ")
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              "hover:bg-red-50 text-slate-500 hover:text-red-600 w-full",
              isCollapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
