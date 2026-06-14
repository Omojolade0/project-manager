import { Trash2, Pin } from "lucide-react";
import NoteModal from "@/features/notes/NoteModal";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
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

function NoteCard({ note, projectId }) {
  const [deleting, setDeleting] = useState(false);
  const { removeNote, editNote } = useNotes(projectId);
  async function handleDelete() {
    try {
      setDeleting(true);
      await removeNote(note.id);
      toast.success("Note deleted");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  }
  async function handlePin() {
    try {
      await editNote(note.id, {
        is_pinned: !note.is_pinned,
      });
    } catch (error) {
      toast.error("Failed to pin note");
      console.error("Error pinning note:", error);
    }
  }

  return (
    <div className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
      {deleting && (
        <div className="mb-3">
          <span className="text-sm text-slate-500">Deleting...</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
        <button
          onClick={handlePin}
          className={`p-1 rounded-lg ${note.is_pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <Pin
            className={`w-3.5 h-3.5 ${note.is_pinned ? "text-indigo-500" : "text-slate-300"}`}
          />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <NoteModal note={note} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
