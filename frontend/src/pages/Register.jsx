import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import loging from "@/assets/login-img.png";
import authService from "@/services/authService";
import { useNavigate } from "react-router-dom";
function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    const data = { email, password, username };

    try {
      await authService.register(data);
      const result = await authService.login({ email, password });
      localStorage.setItem("token", result.access_token);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="hidden lg:flex items-center justify-center bg-slate-50">
          <img src={loging} alt="" />
        </div>
        <div className="p-10 flex flex-col justify-center relative">
          <p className="text-sm mb-10 absolute top-5 left-10 ">● Logo</p>
          <div className="space-y-2 mb-8 justify-center items-center flex flex-col">
            <h2 className="text-3xl font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground">It's free and easy</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="Type your name"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="Enter your email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Sign Up
            </Button>
          </form>

          <p className="text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-purple-600">Log In</span>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
