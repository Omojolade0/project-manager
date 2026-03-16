import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={[
          "min-h-screen transition-all duration-300",
          isCollapsed ? "pl-20" : "pl-64",
        ].join(" ")}
      >
        <Topbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
