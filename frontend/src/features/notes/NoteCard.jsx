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

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function NoteCard({ note, projectId }) {
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);
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
      setPinning(true);
      await editNote(note.id, {
        is_pinned: !note.is_pinned,
      });
    } catch (error) {
      toast.error("Failed to pin note");
      console.error("Error pinning note:", error);
    } finally {
      setPinning(false);
    }
  }

  return (
    <div
      className={`group rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        note.is_pinned ? "bg-secondary-tint" : "bg-muted/60 hover:bg-muted"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small text-foreground leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handlePin}
            disabled={pinning}
            className={`p-1.5 rounded-lg transition-opacity ${
              note.is_pinned
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 hover:bg-card"
            }`}
          >
            <Pin
              className={`w-3.5 h-3.5 ${note.is_pinned ? "text-primary fill-primary" : "text-muted-foreground"}`}
            />
          </button>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <NoteModal note={note} projectId={projectId} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={deleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-card"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
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
                  className="bg-destructive text-destructive-foreground hover:opacity-90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {note.created_at && (
        <p className="text-caption text-muted-foreground mt-2.5">
          Added {formatDate(note.created_at)}
        </p>
      )}
    </div>
  );
}

export default NoteCard;
