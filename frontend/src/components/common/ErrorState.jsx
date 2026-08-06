import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ErrorState({
  variant = "inline",
  title = "Something went wrong",
  message,
  actionLabel = "Retry",
  onAction,
}) {
  if (variant === "page") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3 px-4">
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-section text-foreground">{title}</h1>
        {message && (
          <p className="text-body text-muted-foreground max-w-sm">{message}</p>
        )}
        {onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-body text-foreground mb-1">{title}</p>
      {message && <p className="text-small text-muted-foreground mb-3">{message}</p>}
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;