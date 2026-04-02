import { Trash2 } from "lucide-react";
import noteService from "@/services/noteService";
import NoteModal from "@/components/NoteModal";
import toast from "react-hot-toast";
import { useState } from "react";

function NoteCard({ note, projectId, onRefresh }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    try {
      setDeleting(true);
      await noteService.deleteNote(projectId, note.id);
      toast.success("Note deleted");
      onRefresh();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
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
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 transition-colors" />
        </button>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <NoteModal note={note} projectId={projectId} onSuccess={onRefresh} />
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
