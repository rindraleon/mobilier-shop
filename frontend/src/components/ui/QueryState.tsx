import type { ReactNode } from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";
import { ApiError, NetworkError } from "../../lib/api/client";
import { errorMessage, isRetryable } from "../../utils/errors";

/**
 * Enveloppe générique d'état de requête : chargement / erreur / vide / succès
 * (§84). Évite de dupliquer ces quatre branches dans chaque page.
 */
interface QueryStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: T | undefined;
  /** Condition de vacuité : si `true`, l'état vide est affiché. */
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyText?: string;
  emptyActionLabel?: string;
  emptyActionTo?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: ReactNode | ((data: T) => ReactNode);
}

export default function QueryState<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  loadingLabel = "Chargement…",
  emptyIcon,
  emptyTitle = "Aucun résultat",
  emptyText,
  emptyActionLabel,
  emptyActionTo,
  onEmptyAction,
  onRetry,
  children,
}: QueryStateProps<T>) {
  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label={loadingLabel} />
      </div>
    );
  }

  if (isError) {
    const offline = error instanceof NetworkError;
    const Icon = offline ? WifiOff : AlertTriangle;
    return (
      <EmptyState
        icon={Icon}
        title={offline ? "Serveur injoignable" : "Une erreur est survenue"}
        text={errorMessage(error)}
        actionLabel={isRetryable(error) ? "Réessayer" : undefined}
        onAction={isRetryable(error) ? onRetry : undefined}
      />
    );
  }

  if (data === undefined) return null;

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        text={emptyText}
        actionLabel={emptyActionLabel}
        actionTo={emptyActionTo}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{typeof children === "function" ? children(data) : children}</>;
}

export { ApiError };
