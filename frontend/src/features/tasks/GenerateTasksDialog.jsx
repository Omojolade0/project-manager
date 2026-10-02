import { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import intelligenceService from "@/services/intelligenceService";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

const GENERIC_ERROR = "Something went wrong generating tasks. Please try again.";
const EMPTY_ERROR =
  "The AI couldn't come up with any suggestions for this project. Please try again.";

function GenerateTasksDialog({
  projectId,
  projectName,
  projectDescription,
  onSuccess,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;
  const [state, setState] = useState("loading"); // loading | review | adding | error
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const { createTask } = useTasks(projectId);

  async function generate() {
    setState("loading");
    setErrorMessage(null);
    try {
      const response = await intelligenceService.generateTasks(projectId, {
        project_name: projectName,
        project_description: projectDescription || "",
      });
      if (!response.tasks || response.tasks.length === 0) {
        setErrorMessage(EMPTY_ERROR);
        setState("error");
        return;
      }
      setSuggestions(response.tasks.map((t) => ({ ...t, selected: true })));
      setState("review");
    } catch (error) {
      console.error("Error generating tasks:", error);
      if (error.response?.status === 429) {
        setErrorMessage(
          error.response?.data?.detail ||
            "You've reached the hourly limit for AI task generation. Please try again later.",
        );
      } else {
        setErrorMessage(GENERIC_ERROR);
      }
      setState("error");
    }
  }

  // Fires on every open — whether the dialog was opened via its own
  // trigger or opened programmatically by a parent (e.g. right after
  // project creation), since a controlled `open` prop flipping true
  // doesn't route through Radix's onOpenChange. Guarded by a ref because
  // this call is a paid, rate-limited POST — StrictMode's dev-only
  // double-invoke of mount effects would otherwise burn it twice per open.
  const generatedForOpenRef = useRef(false);
  useEffect(() => {
    if (!open) {
      generatedForOpenRef.current = false;
      return;
    }
    if (generatedForOpenRef.current) return;
    generatedForOpenRef.current = true;
    setSuggestions([]);
    setErrorMessage(null);
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleSuggestion(index) {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s)),
    );
  }

  const selectedCount = suggestions.filter((s) => s.selected).length;

  async function handleAddSelected() {
    const chosen = suggestions.filter((s) => s.selected);
    if (chosen.length === 0) return;
    setState("adding");
    try {
      for (const s of chosen) {
        await createTask({
          title: s.title,
          description: s.description,
          status: "Todo",
          priority: "Low",
          due_date: null,
          is_pinned: false,
        });
      }
      toast.success(`Added ${chosen.length} task${chosen.length === 1 ? "" : "s"}`);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding generated tasks:", error);
      toast.error("Failed to add some tasks");
      setState("review");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-9 px-4 rounded-xl text-body flex items-center gap-2 border-border text-foreground hover:bg-muted"
          >
            <Sparkles className="w-4 h-4" /> Generate with AI
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl p-6">
        <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shrink-0">
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-section font-semibold text-foreground">
              Generate tasks with AI
            </DialogTitle>
            <DialogDescription className="text-small text-muted-foreground">
              {state === "review" || state === "adding"
                ? "Review the suggestions below, then add the ones you want."
                : "Based on this project's name and description"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {state === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <LoadingSpinner size="default" />
            <p className="text-small text-muted-foreground">
              Generating task suggestions… this can take a few seconds.
            </p>
          </div>
        )}

        {state === "error" && (
          <ErrorState title="Couldn't generate tasks" message={errorMessage} />
        )}

        {(state === "review" || state === "adding") && (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto">
            {suggestions.map((s, i) => (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-colors",
                  s.selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <Checkbox
                  checked={s.selected}
                  onCheckedChange={() => toggleSuggestion(i)}
                  disabled={state === "adding"}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-small font-medium text-foreground">{s.title}</span>
                  {s.description && (
                    <span className="block text-caption text-muted-foreground mt-0.5">
                      {s.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter className="flex-row items-center justify-between gap-4 pt-4 mt-1 border-t border-border sm:justify-between">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-small font-medium text-muted-foreground hover:text-foreground transition-all duration-150 hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <div className="flex items-center gap-4 ml-auto">
            {state === "error" && (
              <Button
                onClick={generate}
                className="h-10 px-6 rounded-full text-small font-medium bg-primary hover:opacity-90 text-primary-foreground transition-all duration-150 hover:-translate-y-0.5"
              >
                Try again
              </Button>
            )}
            {(state === "review" || state === "adding") && (
              <Button
                onClick={handleAddSelected}
                disabled={selectedCount === 0 || state === "adding"}
                className={cn(
                  "h-10 px-6 rounded-full text-small font-medium flex items-center gap-2 transition-all duration-150 hover:-translate-y-0.5",
                  selectedCount === 0 || state === "adding"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary hover:opacity-90 text-primary-foreground",
                )}
              >
                {state === "adding" ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  `Add selected tasks${selectedCount ? ` (${selectedCount})` : ""}`
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateTasksDialog;
