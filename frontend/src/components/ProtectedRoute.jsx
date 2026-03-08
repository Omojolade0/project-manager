import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = true;
  //   localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
