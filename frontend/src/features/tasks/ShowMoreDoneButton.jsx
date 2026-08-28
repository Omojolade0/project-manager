export function ShowMoreDoneButton({ hiddenCount, onClick }) {
  if (hiddenCount <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-center text-caption font-medium text-muted-foreground hover:text-foreground py-2 mt-1 transition-colors"
    >
      Show {hiddenCount} more done task{hiddenCount === 1 ? "" : "s"}
    </button>
  );
}

export default ShowMoreDoneButton;
