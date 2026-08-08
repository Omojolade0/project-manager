import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command as CommandIcon,
  FolderKanban,
  CheckSquare,
  FileText,
  LayoutDashboard,
  ListTodo,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import ProjectModal from "@/features/projects/ProjectModal";
import TaskModal from "@/features/tasks/TaskModal";
import NoteModal from "@/features/notes/NoteModal";
import useAuth from "@/hooks/useAuth";

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((isOpen) => !isOpen);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(action) {
    setOpen(false);
    action();
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open command palette"
        onClick={() => setOpen(true)}
        className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted border border-transparent hover:border-border transition-all bg-transparent"
      >
        <CommandIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Create">
            <CommandItem onSelect={() => runCommand(() => setShowProjectModal(true))}>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Create Project
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShowTaskModal(true))}>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              Create Task
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setShowNoteModal(true))}>
              <FileText className="h-4 w-4 text-muted-foreground" />
              Create Note
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/projects"))}>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Project List
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/tasks"))}>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              Upcoming Tasks
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => runCommand(handleLogout)}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Logout
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Controlled, hidden-trigger instances of the existing modals — reused as-is. */}
      <ProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        hideTrigger
      />
      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        hideTrigger
      />
      <NoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        hideTrigger
      />
    </>
  );
}

export default CommandPalette;