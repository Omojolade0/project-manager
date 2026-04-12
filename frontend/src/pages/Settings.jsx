import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const result = await authService.getMe();
        setUser(result);
        setEmail(result.email);
        setUsername(result.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  async function handleUsernameChange() {
    try {
      setLoading(true);
      await authService.updateMe({ username });

      toast.success("Username updated!");
    } catch (error) {
      console.error("Error updating username:", error);

      toast.error("Failed to update username");
    } finally {
      setLoading(false);
    }
  }
  async function handleEmailChange() {
    try {
      setLoading(true);
      await authService.updateMe({ email });

      toast.success("Email updated!");
    } catch (error) {
      console.error("Error updating email:", error);

      toast.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  }
  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await authService.login({ email: user.email, password: oldPassword });
      await authService.updateMe({ password: newPassword });

      toast.success("Password updated!");
    } catch (error) {
      console.error("Error updating password:", error);

      toast.error("Failed to update password");
    } finally {
      setLoading(false);
      setOldPassword("");
      setNewPassword("");
    }
  }

  async function handleDeleteAccount() {
    try {
      setLoading(true);
      await authService.deleteMe();
      toast.success("Account deleted successfully.");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Username
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <Button
            disabled={loading}
            onClick={() => {
              handleUsernameChange();
              handleEmailChange();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Change Password
          </h2>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Current Password
            </Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              New Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <Button
            disabled={loading}
            onClick={handleChangePassword}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {loading ? "Saving..." : "Update Password"}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-slate-400">
            Permanently delete your account and all your data. This cannot be
            undone.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="rounded-xl"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </Layout>
  );
}
