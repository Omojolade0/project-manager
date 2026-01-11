import { NavLink } from "react-router-dom";
import ItemsNav from "./ItemsNav";
import icon from "@/assets/icon-person.jpg";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const navItems = [
    { label: "Dashboard", to: "/", Icon: LayoutDashboard },
    { label: "Projects", to: "/projects", Icon: FolderKanban },
    { label: "Tasks", to: "/tasks", Icon: CheckSquare },
    { label: "Messages", to: "/messages", Icon: MessageSquare },
  ];

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={[
        "fixed left-0 top-0 z-50 h-screen bg-slate-200 border-r border-slate-300",
        "transition-all duration-200",
        isCollapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      <div className="flex h-full flex-col p-3">
        {/* Profile */}
        <div className={["mt-2 flex items-center gap-2", isCollapsed ? "justify-center" : ""].join(" ")}>
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
            <img src={icon} alt="User avatar" className="h-full w-full object-cover" />
          </div>

          {!isCollapsed && (
            <div className="leading-tight">
              <h2 className="text-sm font-medium text-slate-900">Username</h2>
              <p className="text-xs text-slate-600">username@gmail.com</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <ItemsNav key={item.to} item={item} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-1 pb-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "hover:bg-slate-300/60",
                isActive ? "bg-white shadow-sm" : "",
                isCollapsed ? "justify-center px-2" : "",
              ].join(" ")
            }
          >
            <Settings className="h-5 w-5 text-slate-700" />
            {!isCollapsed && <span className="text-slate-800">Settings</span>}
          </NavLink>

          <button
            type="button"
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-slate-300/60",
              isCollapsed ? "justify-center px-2" : "",
            ].join(" ")}
            onClick={() => console.log("logout")}
          >
            <LogOut className="h-5 w-5 text-slate-700" />
            {!isCollapsed && <span className="text-slate-800">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
