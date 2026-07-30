import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-3.5 w-3.5 border-2",
  default: "h-5 w-5 border-2",
};

function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClass = SIZES[size] ?? SIZES.default;
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-primary border-t-transparent animate-spin",
        sizeClass,
        className,
      )}
    />
  );
}

export default LoadingSpinner;