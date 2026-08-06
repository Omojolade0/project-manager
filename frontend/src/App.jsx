import { Toaster } from "react-hot-toast";
import AppRoutes from "@/routes/AppRoutes";
import AppLoader from "@/components/common/AppLoader";
import useAuth from "@/hooks/useAuth";

function App() {
  const { loading } = useAuth();

  if (loading) return <AppLoader />;

  return (
    <main>
      <Toaster position="bottom-right" />
      <AppRoutes />
    </main>
  );
}

export default App;
