import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

// Keeps logged-in users off the marketing/auth pages — visiting "/",
// "/login", or "/register" while authenticated sends them to the dashboard
// instead of showing a stale signed-out view.
function PublicRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
