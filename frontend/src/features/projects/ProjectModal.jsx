import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useProjects } from "@/hooks/useProjects";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const STATUSES = [
  { id: "Active", label: "Active", blurb: "In flight now" },
  { id: "Inactive", label: "Inactive", blurb: "Parked for later" },
  { id: "Completed", label: "Completed", blurb: "Already wrapped" },
];

const STATUS_RING = {
  Active: "border-status-done",
  Inactive: "border-muted-foreground",
  Completed: "border-primary",
};

const STATUS_DOT = {
  Active: "bg-status-done",
  Inactive: "bg-muted-foreground",
  Completed: "bg-primary",
};

function ProjectModal({
  project,
  onSuccess,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;
  const [selectedPlan, setSelectedPlan] = useState("Active");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { createProject, editProject } = useProjects();

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setDescription(project.description);
      setSelectedPlan(project.status);
    }
  }, [project]);

  async function handleCreate() {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      setLoading(true);
      await createProject({
        name: projectName,
        description,
        status: selectedPlan,
      });
      setProjectName("");
      setDescription("");
      setSelectedPlan("Active");
      setOpen(false);
      toast.success("Project created!");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setProjectName("");
    setDescription("");
    setSelectedPlan("Active");
    setOpen(false);
  }

  async function handleEdit(projectId) {
    try {
      setLoading(true);
      await editProject(projectId, {
        name: projectName,
        description,
        status: selectedPlan,
      });
      setOpen(false);
      onSuccess?.();
      toast.success("Project updated!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {project ? (
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-body h-9 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-body h-9 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-section font-semibold text-foreground">
            {project ? "Edit project" : "New project"}
          </DialogTitle>
          <DialogDescription className="text-small text-muted-foreground">
            {project
              ? "Update this project's details."
              : "Give it a name now, add tasks later."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-small font-medium text-foreground">
              Project name
            </Label>
            <Input
              placeholder="e.g. Q3 onboarding revamp"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={200}
              className="h-10 bg-muted border-transparent rounded-xl text-small focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-small font-medium text-foreground">
              Description{" "}
              <span className="font-normal text-muted-foreground">optional</span>
            </Label>
            <Textarea
              placeholder="What is this project for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              className="min-h-[84px] bg-muted border-transparent rounded-xl text-small resize-none focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-small font-medium text-foreground">Status</Label>
            <div className="space-y-1">
              {STATUSES.map((s) => {
                const selected = selectedPlan === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedPlan(s.id)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      selected ? "bg-secondary" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0",
                          selected ? STATUS_RING[s.id] : "border-border",
                        )}
                      >
                        {selected && (
                          <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[s.id])} />
                        )}
                      </span>
                      <span className="text-small font-medium text-foreground">
                        {s.label}
                      </span>
                    </span>
                    <span className="text-caption text-muted-foreground shrink-0">
                      {s.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-end gap-4 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="text-small font-medium text-muted-foreground hover:text-foreground transition-all duration-150 hover:-translate-y-0.5"
          >
            Cancel
          </button>
          {project ? (
            <Button
              onClick={() => handleEdit(project.id)}
              disabled={loading}
              className="h-10 px-6 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-small font-medium transition-all duration-150 hover:-translate-y-0.5"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="border-primary-foreground" />
              ) : (
                "Save changes"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="h-10 px-6 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-small font-medium transition-all duration-150 hover:-translate-y-0.5"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="border-primary-foreground" />
              ) : (
                "Create project"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectModal;
