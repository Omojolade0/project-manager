import { cn } from "@/lib/utils";

const VARIANTS = {
  "text-line": "h-4 w-full rounded-md",
  "list-row": "h-16 w-full rounded-xl",
  card: "h-36 w-full rounded-xl",
  "stat-card": "h-[76px] w-full rounded-2xl",
};

function Skeleton({ variant = "text-line", className = "" }) {
  const shape = VARIANTS[variant] ?? VARIANTS["text-line"];
  return <div className={cn("bg-muted animate-pulse", shape, className)} />;
}

export default Skeleton;