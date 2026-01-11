
import { useLocation } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react";
import { Bell, Search, User } from "lucide-react"
import icon from "@/assets/icon-person.jpg"

const titles = {
  "/": "Dashboard ",
  "/login": "Login",
  "/register": "Register",
};
const getTitle = (pathname) => {
  const match = Object.keys(titles)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(path + "/"));

  return titles[match] ?? "Page";
};

function Topbar() {

  const { pathname } = useLocation();
  const [search, setSearch] = useState("")
  const title = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="flex items-center justify-between px-6 py-4 shadow-sm">
        {/* LEFT — PAGE TITLE */}
        <h2 className="text-2xl font-semibold text-gray-900">
          {title}
        </h2>

        {/* RIGHT — SEARCH + ICONS */}
        <div className="flex items-center gap-4">
          {/* Search pill */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="w-56 rounded-full pl-9 bg-gray-50"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 bg-transparent">
            <Bell className="h-5 w-5 text-black" />
          </button>

          {/* Avatar */}
          {/* <button
            type="button"
            aria-label="Account"
            className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-300 overflow-hidden">
            <img
              src={icon}
              alt=""
              className="h-full w-full object-cover"
            />
          </button> */}
        </div>
      </div>
    </header>
  );
}

export default Topbar