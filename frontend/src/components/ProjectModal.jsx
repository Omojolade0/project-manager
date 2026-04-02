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
import projectService from "@/services/projectService";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

function ProjectModal({ project, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Active");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setDescription(project.description);
      setSelectedPlan(project.status);
    }
  }, [project]);

  const statuses = [
    {
      id: "Active",
      label: "Active",
      color: "text-green-700 border-green-200 bg-green-50",
      active: "border-green-500 bg-green-50",
    },
    {
      id: "Inactive",
      label: "Inactive",
      color: "text-slate-500 border-slate-200 bg-slate-50",
      active: "border-slate-400 bg-slate-50",
    },
    {
      id: "Completed",
      label: "Completed",
      color: "text-blue-700 border-blue-200 bg-blue-50",
      active: "border-blue-500 bg-blue-50",
    },
  ];

  async function handleCreate() {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      setLoading(true);
      await projectService.createProject({
        name: projectName,
        description,
        status: selectedPlan,
      });
      setProjectName("");
      setDescription("");
      setSelectedPlan("Active");
      setOpen(false);
      onSuccess();
      toast.success("Project created!");
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
      await projectService.updateProject(projectId, {
        name: projectName,
        description,
        status: selectedPlan,
      });
      setProjectName("");
      setDescription("");
      setSelectedPlan("Active");
      setOpen(false);
      onSuccess();
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
      <DialogTrigger asChild>
        {project ? (
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {project ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {project
                ? "Update this project"
                : "Fill in the details to create your project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Project Name
              </Label>
              <Input
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] bg-slate-50 border-slate-200 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Status
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedPlan(s.id)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-medium transition-all",
                      selectedPlan === s.id
                        ? `${s.active} border-2`
                        : `${s.color} border hover:opacity-80`,
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </Button>
          {project ? (
            <Button
              onClick={() => handleEdit(project.id)}
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectModal;
