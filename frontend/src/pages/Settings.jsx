import { useState } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import authService from "@/services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ThemePreview } from "@/components/common/ThemePreview";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "appearance", label: "Appearance" },
  { id: "account", label: "Account" },
];

const cardClass =
  "bg-card rounded-2xl border border-border shadow-card p-6 hover:shadow-lg transition-shadow duration-200";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("basics");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-page-title text-foreground">Settings</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage your profile, appearance and account.
          </p>
        </div>

        <div className="flex gap-6 border-b border-border overflow-x-auto overflow-y-hidden mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 -mb-px shrink-0 text-small font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "basics" && <BasicsTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "account" && <AccountTab />}
      </div>
    </Layout>
  );
}

function BasicsTab() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isDirty =
    username !== (user?.username ?? "") || email !== (user?.email ?? "");

  function handleCancel() {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
  }

  function handleUploadPhoto() {
    // Photo upload isn't wired to a backend yet — safe no-op.
    toast("Photo upload isn't available yet.");
  }

  async function handleDetailsChange() {
    try {
      setLoadingProfile(true);
      const updated = await authService.updateMe({ username, email });
      updateUser(updated);
      toast.success("Details updated!");
    } catch (error) {
      console.error("Error updating details:", error);
      toast.error("Failed to update details");
    } finally {
      setLoadingProfile(false);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="text-card-title text-foreground">Profile</h2>
      <p className="text-small text-muted-foreground mt-1">
        How you appear across the app.
      </p>

      <div className="flex items-center gap-4 mt-6">
        <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-section font-semibold shrink-0">
          {username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadPhoto}
            className="rounded-full"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload photo
          </Button>
          <button
            type="button"
            disabled
            className="text-small text-muted-foreground/50 cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="text-caption text-muted-foreground mt-2">
        JPG or PNG, up to 2 MB.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="space-y-1.5">
          <Label className="text-foreground">Name</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          disabled={loadingProfile || !isDirty}
          onClick={handleDetailsChange}
        >
          {loadingProfile ? (
            <LoadingSpinner size="sm" className="border-primary-foreground" />
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cardClass}>
      <h2 className="text-card-title text-foreground">Theme</h2>
      <p className="text-small text-muted-foreground mt-1">
        Applies to this browser only.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {THEME_OPTIONS.map((opt) => {
          const selected = theme === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-3 cursor-pointer transition-all",
                selected
                  ? "border-primary ring-1 ring-primary bg-secondary-tint/50"
                  : "border-border hover:border-foreground/20",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={opt.value}
                checked={selected}
                onChange={() => setTheme(opt.value)}
                className="sr-only"
              />
              <ThemePreview variant={opt.value} />
              <span className="flex items-center gap-2 text-small font-medium text-foreground">
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    selected ? "border-primary" : "border-input",
                  )}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "Not set" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const clamped = Math.min(score, 4);
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return { score: clamped, label: labels[clamped] };
}

const STRENGTH_COLORS = [
  "bg-status-overdue",
  "bg-status-overdue",
  "bg-status-due",
  "bg-status-progress",
  "bg-status-done",
];

function PasswordStrengthMeter({ value }) {
  const { score, label } = getPasswordStrength(value);
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < score ? STRENGTH_COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-caption text-muted-foreground w-12 text-right shrink-0">
        {label}
      </span>
    </div>
  );
}

function AccountTab() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
      // No dedicated "verify current password" endpoint — confirm it the
      // same way the previous implementation did, via a login attempt.
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
      await authService.deleteMe();
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
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-card-title text-foreground">Password</h2>
        <p className="text-small text-muted-foreground mt-1">
          Use at least 8 characters.
        </p>

        <div className="space-y-4 mt-6 max-w-sm">
          <div className="space-y-1.5">
            <Label className="text-foreground">Current password</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">New password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthMeter value={newPassword} />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="button" disabled={loadingPassword} onClick={handleChangePassword}>
            {loadingPassword ? (
              <LoadingSpinner size="sm" className="border-primary-foreground" />
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          cardClass,
          "border-destructive/30 flex items-start justify-between gap-4 flex-wrap",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-card-title text-foreground">Delete account</h2>
            <p className="text-small text-muted-foreground mt-1 max-w-md">
              Permanently delete your account and all your data. This cannot be
              undone.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your account and cascades to all of
                your projects, tasks, and notes. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loadingDelete ? (
                  <LoadingSpinner size="sm" className="border-destructive-foreground" />
                ) : (
                  "Delete account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
