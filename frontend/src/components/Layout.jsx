import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar sits outside the normal flow */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Content area is padded to make room for sidebar */}
      <div
        className={[
          "min-h-screen transition-all duration-200",
          isCollapsed ? "pl-20" : "pl-64",
        ].join(" ")}
      >
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
