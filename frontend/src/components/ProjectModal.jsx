import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const title = "Multiple Inputs Dialog";

function ProjectModal() {
  const [selectedPlan, setSelectedPlan] = useState("incomplete");
  const [deadline, setDeadline] = useState(null);

  const statuses = [
    { id: "incomplete", name: "Incomplete" },
    { id: "complete", name: "Complete" },
    { id: "inprogress", name: "In progress" },
  ];

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Create Project</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New Project</AlertDialogTitle>
          <AlertDialogDescription>
            Provide the details of the project here
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Project Name</Label>
            <Input id="subject" placeholder="Enter Project Name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Description</Label>
            <Textarea
              className="min-h-[100px]"
              id="message"
              placeholder="Enter project description."
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedPlan(s.id)}
                  className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                    selectedPlan === s.id
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline (Option 2: Popover + Calendar) */}
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Pin */}
          <div className="flex items-start space-x-3">
            <Checkbox id="pin-project" />
            <div className="grid gap-1.5">
              <Label className="font-medium" htmlFor="pin-project">
                Pin project to Dashboard
              </Label>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ProjectModal;
