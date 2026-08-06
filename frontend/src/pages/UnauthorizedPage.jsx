import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import ErrorState from "@/components/common/ErrorState";

function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ErrorState
      variant="page"
      title="Session expired"
      message="Please log in again to continue."
      actionLabel={user ? "Go to Dashboard" : "Go to Login"}
      onAction={() => navigate(user ? "/dashboard" : "/login")}
    />
  );
}

export default UnauthorizedPage;