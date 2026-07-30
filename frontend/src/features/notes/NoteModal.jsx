import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useNotes } from "@/hooks/useNotes";
import projectService from "@/services/projectService";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function NoteModal({
  projectId,
  note,
  onSuccess,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}) {
  const [content, setContent] = useState(note ? note.content : "");
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;
  const [isPinned, setIsPinned] = useState(
    note ? note.is_pinned || false : false,
  );

  // No projectId was supplied (e.g. "New Note" from a cross-project page) —
  // the user must pick which project this note belongs to.
  const needsProjectPicker = !projectId;
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    if (!needsProjectPicker || !open) return;
    let ignore = false;
    (async () => {
      try {
        setProjectsLoading(true);
        const response = await projectService.getProjects(1, 100);
        if (!ignore) setAvailableProjects(response.items);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        if (!ignore) setProjectsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [needsProjectPicker, open]);

  const effectiveProjectId = projectId || selectedProjectId || note?.project_id;
  const { createNote, editNote } = useNotes(effectiveProjectId);

  async function handleCreate() {
    if (!content.trim()) {
      toast.error("Note content is required");
      return;
    }
    if (needsProjectPicker && !selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    try {
      setLoading(true);
      await createNote({ content, is_pinned: isPinned });
      setContent("");
      setIsPinned(false);
      setSelectedProjectId("");
      setOpen(false);
      toast.success("Note created");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (!note) {
      setContent("");
      setIsPinned(false);
      setSelectedProjectId("");
    }
    setOpen(false);
  }

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setIsPinned(note.is_pinned || false);
    }
  }, [note]);

  async function handleEdit(noteId) {
    try {
      setLoading(true);
      await editNote(noteId, { content, is_pinned: isPinned });
      setOpen(false); // ← just close, don't reset content
      toast.success("Note updated");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update note");
      console.error("Error updating note:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger &&
        (note ? (
          <DialogTrigger asChild>
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-sm h-9 px-4 rounded-xl flex items-center gap-2">
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button className="bg-primary hover:opacity-90 text-primary-foreground text-sm h-9 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Note
            </Button>
          </DialogTrigger>
        ))}

      <DialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          {note ? (
            <DialogHeader className="mb-5">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Edit Note
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                Update this note
              </DialogDescription>
            </DialogHeader>
          ) : (
            <DialogHeader className="mb-5">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                New Note
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                {needsProjectPicker
                  ? "Add a note and choose which project it belongs to"
                  : "Add a note to this project"}
              </DialogDescription>
            </DialogHeader>
          )}

          <div className="space-y-4">
            {needsProjectPicker && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Project
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm">
                    <SelectValue
                      placeholder={
                        projectsLoading ? "Loading projects..." : "Select a project"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Note</Label>
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] bg-slate-50 border-slate-200 rounded-xl text-sm resize-none"
                required={true}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Label className="text-sm font-medium text-slate-700">
            Pin to the top
          </Label>
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500"
          />
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <DialogClose
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </DialogClose>

          {note ? (
            <Button
              onClick={() => handleEdit(note.id)}
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-medium"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="border-primary-foreground" />
              ) : (
                "Save Changes"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-sm font-medium"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="border-primary-foreground" />
              ) : (
                "Create Note"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NoteModal;
