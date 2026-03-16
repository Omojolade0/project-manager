import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register({ email, password, username });
      const result = await authService.login({ email, password });
      localStorage.setItem("token", result.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT — DESIGN PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12">
          <div>
            <div className="inline-block bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-8">
              Free to get started
            </div>
            <h3 className="text-3xl font-semibold text-white leading-tight tracking-tight mb-4">
              Your projects, tasks and notes in one place
            </h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              Join Coeus and take control of how you manage your work from day
              one.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              "Create and track unlimited projects",
              "Break work into tasks with status tracking",
              "Attach notes directly to projects",
              "Secure JWT authentication",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="p-12 flex flex-col justify-center">
          <Link
            to="/"
            className="text-xl font-semibold text-slate-900 mb-12 block"
          >
            Coeus
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-sm text-slate-400 font-light">
              It's free and takes less than a minute
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

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
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-slate-400 mt-8 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
