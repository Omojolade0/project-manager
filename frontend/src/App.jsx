import { Toaster } from "react-hot-toast";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <main>
      <Toaster position="bottom-right" />
      <AppRoutes />
    </main>
  );
}

export default App;
