import { Trash2 } from "lucide-react";
import noteService from "@/services/noteService";
import NoteModal from "@/components/NoteModal";

function NoteCard({ note, projectId, onRefresh }) {
  async function handleDelete() {
    try {
      await noteService.deleteNote(projectId, note.id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  return (
    <div className="group bg-[#FAFAF8] border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
        <button
          onClick={handleDelete}
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
