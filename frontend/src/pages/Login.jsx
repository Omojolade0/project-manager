import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setError("");
    try {
      setLoadingLogin(true);
      await login({ email, password });
      navigate("/dashboard");
      toast.success("Welcome back!");
    } catch (error) {
      setError("Invalid email or password");
      console.error("Login error:", error);
    } finally {
      setLoadingLogin(false);
    }
  }

  return (
    <div className="theme-light-pinned min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl min-h-[620px] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 grid grid-cols-1 lg:grid-cols-2 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {/* LEFT — FORM */}
        <div className="p-12 flex flex-col justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 mb-12"
          >
            <img src="/coeus-favicon.svg" alt="" className="w-6 h-6" />
            <span className="text-section font-semibold text-foreground">
              Coeus
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-section font-semibold text-foreground tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-small text-muted-foreground font-light">
              Enter your details to sign in to your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-small font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                required={true}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-small font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                required={true}
              />
            </div>

            {error && (
              <p className="text-small text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loadingLogin}
              className="w-full h-11 bg-primary hover:opacity-90 text-primary-foreground font-medium mt-2"
            >
              {loadingLogin ? (
                <LoadingSpinner
                  size="sm"
                  className="border-primary-foreground"
                />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-small text-muted-foreground mt-8 text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* RIGHT — DESIGN PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12">
          <div>
            <div className="inline-block bg-white/10 text-white text-caption font-medium px-3 py-1.5 rounded-full mb-8">
              Project management, simplified
            </div>
            <h3 className="text-section font-semibold text-white leading-tight tracking-tight mb-4">
              Everything you need to ship projects faster
            </h3>
            <p className="text-slate-400 text-small font-light leading-relaxed">
              Track projects, manage tasks, and keep notes — all in one clean
              workspace.
            </p>
          </div>

          {/* Fake project cards */}
          <div className="space-y-3">
            {[
              {
                name: "Website Redesign",
                status: "Active",
                tasks: 8,
                color: "bg-green-400",
              },
              {
                name: "Mobile App",
                status: "In Progress",
                tasks: 12,
                color: "bg-amber-400",
              },
              {
                name: "API Integration",
                status: "Completed",
                tasks: 5,
                color: "bg-blue-400",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span className="text-card-title text-white">
                    {p.name}
                  </span>
                </div>
                <span className="text-caption font-normal text-slate-400">{p.tasks} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
