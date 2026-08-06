import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div
        className={[
          "min-h-screen transition-all duration-300",
          isCollapsed ? "pl-0 md:pl-20" : "pl-0 md:pl-64",
        ].join(" ")}
      >
        <Topbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
