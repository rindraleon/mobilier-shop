import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import Button from "./Button";
import type { ButtonVariant } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  text?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;
}

export default function EmptyState({
  icon: Icon,
  title,
  text,
  actionLabel,
  actionTo,
  onAction,
  actionVariant = "primary",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
        {Icon && <Icon size={28} />}
      </div>
      <h3 className="mb-2 font-display text-headline-sm text-primary">{title}</h3>
      {text && <p className="mb-6 max-w-sm text-body-sm text-on-surface-variant">{text}</p>}
      {actionLabel &&
        (actionTo ? (
          <Button as={Link} to={actionTo} variant={actionVariant}>
            {actionLabel}
          </Button>
        ) : (
          <Button onClick={onAction} variant={actionVariant}>
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
