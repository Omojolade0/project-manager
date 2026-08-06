import { useState } from "react";
import toast from "react-hot-toast";
import { MoreHorizontal, Pencil, Pin, PinOff, Copy, Trash2 } from "lucide-react";
import TaskModal from "@/features/tasks/TaskModal";
import { useTasks } from "@/hooks/useTasks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function TaskMenu({ task, projectId, onChange, onDuplicate }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const { removeTask, editTask } = useTasks(projectId);

  async function handlePin() {
    try {
      setPinning(true);
      await editTask(task.id, { is_pinned: !task.is_pinned });
      onChange?.();
    } catch (error) {
      console.error("Error pinning task:", error);
      toast.error("Failed to pin task");
    } finally {
      setPinning(false);
    }
  }

  async function handleDuplicate() {
    try {
      setDuplicating(true);
      await onDuplicate?.(task);
    } finally {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    try {
      await removeTask(task.id);
      toast.success("Task deleted");
      onChange?.();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5" /> Edit task
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handlePin} disabled={pinning}>
            {task.is_pinned ? (
              <>
                <PinOff className="w-3.5 h-3.5" /> Unpin
              </>
            ) : (
              <>
                <Pin className="w-3.5 h-3.5" /> Pin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDuplicate} disabled={duplicating}>
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskModal
        task={task}
        projectId={projectId}
        hideTrigger
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onChange}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
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
  );
}

export default TaskMenu;
