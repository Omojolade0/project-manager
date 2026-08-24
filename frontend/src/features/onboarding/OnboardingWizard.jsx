import { useState } from "react";
import toast from "react-hot-toast";
import authService from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingMascot } from "@/components/common/OnboardingMascot";
import { ThemePreview } from "@/components/common/ThemePreview";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import useTheme from "@/hooks/useTheme";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 4;

const THEME_CHOICES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <span className="text-caption text-muted-foreground shrink-0">
        Step {step} of {TOTAL_STEPS}
      </span>
    </div>
  );
}

function OnboardingWizard({ onComplete }) {
  const { updateUser } = useAuth();
  const { createProject, editProject } = useProjects();
  const [step, setStep] = useState(1);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [createdProject, setCreatedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const [taskName, setTaskName] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [createdTask, setCreatedTask] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const { createTask, editTask } = useTasks(createdProject?.id);
  const { resolvedTheme, setTheme } = useTheme();

  async function finishOnboarding() {
    try {
      const updated = await authService.updateMe({ has_completed_onboarding: true });
      updateUser(updated);
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
    }
    onComplete?.();
  }

  async function handleThemeSelect(value) {
    setTheme(value);
    try {
      const updated = await authService.updateMe({ theme_preference: value });
      updateUser(updated);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  }

  async function handleCreateOrUpdateProject() {
    const name = projectName.trim();
    if (!name) return;
    try {
      setCreatingProject(true);
      if (createdProject) {
        const updated = await editProject(createdProject.id, {
          name,
          description: projectDescription,
          status: "Active",
        });
        setCreatedProject(updated);
      } else {
        const created = await createProject({
          name,
          description: projectDescription,
          status: "Active",
        });
        setCreatedProject(created);
      }
      setStep(3);
    } catch (error) {
      console.error("Error creating project during onboarding:", error);
      toast.error("Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleCreateOrUpdateTask() {
    const title = taskName.trim();
    if (!title) return;
    try {
      setCreatingTask(true);
      const payload = {
        title,
        description: "",
        status: "Todo",
        priority: taskPriority,
        due_date: taskDeadline || null,
        is_pinned: false,
      };
      if (createdTask) {
        await editTask(createdTask.id, payload);
      } else {
        const created = await createTask(payload);
        setCreatedTask(created);
      }
      setStep(4);
    } catch (error) {
      console.error("Error creating task during onboarding:", error);
      toast.error("Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <img src="/coeus-favicon.svg" alt="" className="w-6 h-6" />
        <span className="text-section font-semibold text-foreground">Coeus</span>
      </div>

      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl p-8">
        <ProgressBar step={step} />

        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            <OnboardingMascot className="w-28 h-28 mb-6" />
            <h1 className="text-page-title text-foreground mb-2">
              Welcome to Coeus
            </h1>
            <p className="text-body text-muted-foreground mb-8 max-w-xs">
              A calmer home for your projects and tasks. Let's set yours up —
              it only takes a minute.
            </p>
            <Button
              type="button"
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-full"
            >
              Get started
            </Button>
            <button
              type="button"
              onClick={finishOnboarding}
              className="text-small text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-page-title text-foreground mb-2">
              Let's build something
            </h1>
            <p className="text-body text-muted-foreground mb-6">
              Every project starts with a name. You can change it later.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground">Project name</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Website redesign"
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground">
                  Description{" "}
                  <span className="font-normal text-muted-foreground">
                    optional
                  </span>
                </Label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What's this project about?"
                  maxLength={2000}
                  className="min-h-[90px] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCreateOrUpdateProject}
                disabled={!projectName.trim() || creatingProject}
                className="flex-1 rounded-full"
              >
                {creatingProject ? (
                  <LoadingSpinner size="sm" className="border-primary-foreground" />
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-page-title text-foreground mb-2">
              First task for {createdProject?.name}
            </h1>
            <p className="text-body text-muted-foreground mb-6">
              Something small is fine. Momentum matters more than the plan.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground">Task name</Label>
                <Input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Sketch the homepage"
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground">Deadline</Label>
                  <Input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground">Priority</Label>
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCreateOrUpdateTask}
                disabled={!taskName.trim() || creatingTask}
                className="flex-1 rounded-full"
              >
                {creatingTask ? (
                  <LoadingSpinner size="sm" className="border-primary-foreground" />
                ) : (
                  "Next"
                )}
              </Button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-small text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-page-title text-foreground mb-2">
              How should Coeus look?
            </h1>
            <p className="text-body text-muted-foreground mb-6">
              Pick a mood. Switch any time from settings.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {THEME_CHOICES.map((opt) => {
                const selected = resolvedTheme === opt.value;
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
                      name="onboarding-theme"
                      value={opt.value}
                      checked={selected}
                      onChange={() => handleThemeSelect(opt.value)}
                      className="sr-only"
                    />
                    <ThemePreview variant={opt.value} />
                    <span className="flex items-center justify-between text-small font-medium text-foreground">
                      {opt.label}
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          selected ? "border-primary" : "border-input",
                        )}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                className="rounded-full"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={finishOnboarding}
                className="flex-1 rounded-full"
              >
                Finish
              </Button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={finishOnboarding}
                className="text-small text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingWizard;
