import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

function ProtectedRoute() {
  const { user, loading, connectionError } = useAuth();

  if (loading) return null; // replace with spinner if needed

  if (connectionError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p>Couldn't connect to the server. Please refresh to try again.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
