import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      localStorage.setItem("token", result.access_token);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT — FORM */}
        <div className="p-12 flex flex-col justify-center">
          <Link
            to="/"
            className="text-xl font-semibold text-slate-900 mb-12 block"
          >
            Coeus
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 font-light">
              Enter your details to sign in to your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-slate-400 mt-8 text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* RIGHT — DESIGN PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12">
          <div>
            <div className="inline-block bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-8">
              Project management, simplified
            </div>
            <h3 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-4">
              Everything you need to ship projects faster
            </h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
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
                  <span className="text-sm text-white font-medium">
                    {p.name}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{p.tasks} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
