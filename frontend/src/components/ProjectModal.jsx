import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import projectService from "@/services/projectService";
import { Plus } from "lucide-react";

function ProjectModal({ project, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState("Active");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

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
    try {
      await projectService.createProject({
        name: projectName,
        description,
        status: selectedPlan,
      });
      setProjectName("");
      setDescription("");
      setSelectedPlan("Active");
      onSuccess();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }

  function handleCancel() {
    setProjectName("");
    setDescription("");
    setSelectedPlan("Active");
  }

  async function handleEdit(projectId) {
    try {
      await projectService.updateProject(projectId, {
        name: projectName,
        description,
        status: selectedPlan,
      });
      setProjectName("");
      setDescription("");
      setSelectedPlan("Active");
      onSuccess();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {project ? (
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <AlertDialogHeader className="mb-5">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              {project ? "Edit Project" : "New Project"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-400">
              {project
                ? "Update this project"
                : "Fill in the details to create your project"}
            </AlertDialogDescription>
          </AlertDialogHeader>

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

        <AlertDialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </AlertDialogCancel>

          {project ? (
            <AlertDialogAction
              onClick={() => handleEdit(project.id)}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              Save Changes
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={handleCreate}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              Create Project
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ProjectModal;
