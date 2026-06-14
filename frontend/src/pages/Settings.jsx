import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function Settings() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toDelete, setToDelete] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setUsername(user.username);
  }, [user]);

  async function handleDetailsChange() {
    try {
      setLoadingProfile(true);
      await authService.updateMe({ username, email });

      toast.success("Details updated!");
    } catch (error) {
      console.error("Error updating details:", error);

      toast.error("Failed to update details");
    } finally {
      setLoadingProfile(false);
    }
  }
  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    try {
      setLoadingPassword(true);
      await authService.login({ email: user.email, password: oldPassword });
      await authService.updateMe({ password: newPassword });

      toast.success("Password updated!");
    } catch (error) {
      console.error("Error updating password:", error);

      toast.error("Failed to update password");
    } finally {
      setLoadingPassword(false);
      setOldPassword("");
      setNewPassword("");
    }
  }

  async function handleDeleteAccount() {
    try {
      setLoadingDelete(true);
      await authService.deleteMe(); // ← delete from database
      toast.success("Account deleted successfully.");
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
    } finally {
      setLoadingDelete(false);
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
            disabled={loadingProfile}
            onClick={() => {
              handleDetailsChange();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {loadingProfile ? "Saving..." : "Save Changes"}
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
            disabled={loadingPassword}
            onClick={handleChangePassword}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {loadingPassword ? "Saving..." : "Update Password"}
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
            onClick={() => {
              setToDelete(true);
            }}
            className="rounded-xl"
          >
            Delete Account
          </Button>
          {toDelete && (
            <div className="space-y-4">
              <p className="text-sm text-red-500">
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="rounded-xl"
              >
                Confirm Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setToDelete(false);
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
