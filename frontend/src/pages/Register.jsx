import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authService.register({ email, password, username });
      await login({ email, password });
      navigate("/dashboard");
      toast.success("Account created!");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-light-pinned min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl min-h-[620px] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 grid grid-cols-1 lg:grid-cols-2 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {/* LEFT — DESIGN PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12">
          <div>
            <div className="inline-block bg-white/10 text-white text-caption font-medium px-3 py-1.5 rounded-full mb-8">
              Free to get started
            </div>
            <h3 className="text-section font-semibold text-white leading-tight tracking-tight mb-4">
              Your projects, tasks and notes in one place
            </h3>
            <p className="text-slate-400 text-small font-light leading-relaxed">
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
                <span className="text-small text-slate-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — FORM */}
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
              Create your account
            </h2>
            <p className="text-small text-muted-foreground font-light">
              It's free and takes less than a minute
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label
                htmlFor="register-username"
                className="text-small font-medium text-foreground"
              >
                Username
              </Label>
              <Input
                id="register-username"
                type="text"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                required={true}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-email"
                className="text-small font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="register-email"
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
                htmlFor="register-password"
                className="text-small font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="register-password"
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
              disabled={loading}
              className="w-full h-11 bg-primary hover:opacity-90 text-primary-foreground font-medium mt-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="border-primary-foreground" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-small text-muted-foreground mt-8 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:text-primary/80"
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
