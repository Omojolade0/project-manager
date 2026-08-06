import { Button } from "@/components/ui/button";

function EmptyState({ icon: Icon, title, subtext, action, compact = false }) {
  if (compact) {
    return (
      <div className="text-center py-6">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground mx-auto mb-2" />}
        <p className="text-small text-muted-foreground">{title}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      {Icon && (
        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <p className="text-body font-medium text-foreground mb-1">{title}</p>
      {subtext && <p className="text-small text-muted-foreground">{subtext}</p>}
      {action && (
        <div className="mt-4">
          {action.label ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;