// routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProjectList from "@/pages/ProjectList";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import ProjectDetail from "@/pages/ProjectDetail";
import LandingPage from "@/pages/LandingPage";
import Settings from "@/pages/Settings";
import SearchResults from "@/pages/SearchResults";
import UpcomingTasks from "@/pages/UpcomingTasks";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<UpcomingTasks />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
