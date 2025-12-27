import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
}: EmptyStateProps) {
  const ActionButton = () => (
    <button
      onClick={onAction}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold pulse-button glow-primary"
    >
      {actionLabel}
      <ChevronRight className="w-4 h-4" />
    </button>
  );

  const ActionLink = () => (
    <Link
      to={actionLink || "/"}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold pulse-button glow-primary"
    >
      {actionLabel}
      <ChevronRight className="w-4 h-4" />
    </Link>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="float-gentle mb-6 p-6 rounded-full bg-secondary/50">
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
      
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        {description}
      </p>
      
      {actionLabel && (
        actionLink ? <ActionLink /> : onAction ? <ActionButton /> : null
      )}
    </div>
  );
}
