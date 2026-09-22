import { Link } from "react-router-dom";
import { notificationMeta } from "./NotificationIcon";
import { formatRelative } from "../../utils/format";
import type { Notification } from "../../types/api";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  compact?: boolean;
}

/**
 * Lien vers la ressource concernée, quand elle est déductible (§31).
 *
 * Selon l'événement, le backend fournit soit `orderId` (lien direct vers le
 * suivi), soit uniquement `orderNumber` (on retombe sur la liste).
 */
function targetOf(notification: Notification): string | null {
  const data = notification.data ?? {};

  const orderId = data.orderId;
  if (typeof orderId === "string") return "/espace-client/commandes/" + orderId;

  const orderNumber = data.orderNumber;
  if (typeof orderNumber === "string") return "/espace-client/commandes";

  return null;
}

export default function NotificationItem({
  notification,
  onRead,
  compact = false,
}: NotificationItemProps) {
  const { icon: Icon, color } = notificationMeta(notification.type);
  const unread = notification.readAt === null;
  const to = targetOf(notification);

  const content = (
    <span className="flex gap-3">
      <span className={`mt-0.5 shrink-0 ${color}`}>
        <Icon size={compact ? 16 : 18} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate ${
            unread ? "font-semibold text-primary" : "text-on-surface-variant"
          } ${compact ? "text-body-sm" : "text-body-md"}`}
        >
          {notification.title}
        </span>
        <span
          className={`mt-0.5 block text-on-surface-variant ${
            compact ? "line-clamp-2 text-label-sm" : "text-body-sm"
          }`}
        >
          {notification.body}
        </span>
        <span className="mt-1 block text-[11px] text-on-surface-variant/80">
          {formatRelative(notification.createdAt)}
        </span>
      </span>
      {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" aria-label="Non lue" />}
    </span>
  );

  const className = `block rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-container ${
    unread ? "bg-secondary-container/20" : ""
  }`;

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        onClick={() => {
          if (unread) onRead?.(notification.id);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${className} w-full`}
      onClick={() => {
        if (unread) onRead?.(notification.id);
      }}
    >
      {content}
    </button>
  );
}
