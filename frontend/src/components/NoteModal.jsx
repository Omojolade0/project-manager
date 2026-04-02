import { useState } from "react";
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
import noteService from "@/services/noteService";
import { Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";

function NoteModal({ projectId, onSuccess, note }) {
  const [content, setContent] = useState(note ? note.content : "");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleCreate() {
    if (!content.trim()) {
      toast.error("Note content is required");
      return;
    }
    try {
      setLoading(true);
      await noteService.createNote(projectId, { content });
      setContent("");
      onSuccess();
      setOpen(false);
      toast.success("Note created");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setContent("");
    setOpen(false);
  }

  async function handleEdit(noteId) {
    try {
      setLoading(true);
      await noteService.updateNote(projectId, noteId, { content });
      setContent("");
      setOpen(false);
      toast.success("Note updated");
      onSuccess();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {note ? (
        <DialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Note
          </Button>
        </DialogTrigger>
      )}

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
                Add a note to this project
              </DialogDescription>
            </DialogHeader>
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
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              {loading ? "Creating..." : "Create Note"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NoteModal;
