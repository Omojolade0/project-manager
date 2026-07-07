import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TaskCard from "@/features/tasks/TaskCard";
import { useTasks } from "@/hooks/useTasks";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS = [
  { status: "Todo", label: "Todo" },
  { status: "Inprogress", label: "In Progress" },
  { status: "Done", label: "Done" },
];

function groupTasksByStatus(tasks) {
  return COLUMNS.reduce((acc, column) => {
    acc[column.status] = tasks
      .filter((task) => task.status === column.status)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {});
}

function findColumnByTaskId(board, taskId) {
  return COLUMNS.find((c) => board[c.status].some((t) => t.id === taskId))?.status;
}

function findTaskById(board, taskId) {
  for (const column of COLUMNS) {
    const task = board[column.status].find((t) => t.id === taskId);
    if (task) return task;
  }
  return null;
}

function SortableTaskCard({ task, projectId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} projectId={projectId} />
    </div>
  );
}

function Column({ column, tasks, projectId }) {
  const { setNodeRef } = useDroppable({ id: column.status });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div ref={setNodeRef} className="bg-slate-50/60 rounded-xl p-3 min-h-[120px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-semibold text-slate-900">{column.label}</h4>
        <span className="text-xs text-slate-400 bg-white rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[60px]">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-6">No tasks</p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} projectId={projectId} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function TaskBoard({ tasks, projectId }) {
  const [board, setBoard] = useState(() => groupTasksByStatus(tasks));
  const [activeTask, setActiveTask] = useState(null);
  const { reorderTasks } = useTasks(projectId);

  useEffect(() => {
    setBoard(groupTasksByStatus(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event) {
    const task = findTaskById(board, event.active.id);
    setActiveTask(task);
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  function handleDragEnd(event) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const previousBoard = board;

    const sourceStatus = findColumnByTaskId(previousBoard, activeId);
    if (!sourceStatus) return;

    const overIsColumn = COLUMNS.some((c) => c.status === overId);
    const destStatus = overIsColumn ? overId : findColumnByTaskId(previousBoard, overId);
    if (!destStatus) return;

    const sourceItems = previousBoard[sourceStatus];
    const activeIndex = sourceItems.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;

    let newBoard;
    let affectedStatuses;

    // Reorder within the same column
    if (sourceStatus === destStatus) {
      const overIndex = overIsColumn
        ? sourceItems.length - 1
        : sourceItems.findIndex((t) => t.id === overId);
      if (overIndex === -1 || activeIndex === overIndex) return;
      newBoard = {
        ...previousBoard,
        [sourceStatus]: arrayMove(sourceItems, activeIndex, overIndex),
      };
      affectedStatuses = [sourceStatus];
    } else {
      // Move to a different column
      const destItems = previousBoard[destStatus];
      const overIndex = overIsColumn
        ? destItems.length
        : destItems.findIndex((t) => t.id === overId);

      const movedTask = { ...sourceItems[activeIndex], status: destStatus };
      const newSourceItems = sourceItems.filter((t) => t.id !== activeId);
      const newDestItems = [...destItems];
      newDestItems.splice(overIndex === -1 ? newDestItems.length : overIndex, 0, movedTask);

      newBoard = {
        ...previousBoard,
        [sourceStatus]: newSourceItems,
        [destStatus]: newDestItems,
      };
      affectedStatuses = [sourceStatus, destStatus];
    }

    for (const status of affectedStatuses) {
      newBoard[status] = newBoard[status].map((task, index) => ({
        ...task,
        position: index,
      }));
    }

    setBoard(newBoard);

    const columns = affectedStatuses.map((status) => ({
      status,
      task_ids: newBoard[status].map((t) => t.id),
    }));

    reorderTasks(columns).catch((err) => {
      console.error("Failed to save task order:", err);
      setBoard(previousBoard);
      toast.error("Failed to save order");
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            column={column}
            tasks={board[column.status]}
            projectId={projectId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 shadow-lg cursor-grabbing">
            <TaskCard task={activeTask} projectId={projectId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TaskBoard;