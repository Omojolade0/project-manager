import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import ErrorState from "@/components/common/ErrorState";

function ProtectedRoute() {
  // `loading` is already gated at the app root (see App.jsx) — by the time
  // this route can render, the bootstrap auth check has resolved.
  const { user, connectionError } = useAuth();

  if (connectionError) {
    return (
      <ErrorState
        variant="page"
        title="Couldn't connect to the server"
        message="Please check your connection and try again."
        actionLabel="Refresh"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
