import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import noteService from "@/services/noteService";
import { Plus } from "lucide-react";

function NoteModal({ projectId, onSuccess }) {
  const [content, setContent] = useState("");

  async function handleCreate() {
    try {
      await noteService.createNote(projectId, { content });
      setContent("");
      onSuccess();
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }

  function handleCancel() {
    setContent("");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Note
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-xl p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <AlertDialogHeader className="mb-5">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              New Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-400">
              Add a note to this project
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Note</Label>
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-slate-50 border-slate-200 rounded-xl text-sm resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            className="flex-1 h-10 rounded-xl border-slate-200 text-sm font-medium"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreate}
            className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium"
          >
            Save Note
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NoteModal;
