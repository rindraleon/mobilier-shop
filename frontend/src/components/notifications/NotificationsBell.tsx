import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../hooks/useNotifications";
import { useAuth } from "../../lib/auth/AuthProvider";
import NotificationItem from "./NotificationItem";
import PageLoader from "../ui/PageLoader";
import EmptyState from "../ui/EmptyState";

/**
 * Cloche de notifications (§31).
 *
 * Le compteur de non-lus est une requête dédiée et légère, rafraîchie toutes
 * les 60 s : elle ne dépend pas du chargement de la liste complète.
 */
export default function NotificationsBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadNotificationsCount();
  const { data, isLoading } = useNotifications({ limit: 6 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isAuthenticated) return null;

  const items = data?.items ?? [];
  const count = unread?.count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${count > 0 ? ` (${count} non lues)` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-container hover:text-secondary"
      >
        <Bell size={21} />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-lg border border-outline-variant/50 bg-white shadow-card-hover animate-scale-in">
          <div className="flex items-center justify-between gap-2 border-b border-surface-container-highest px-4 py-3">
            <p className="font-display text-headline-sm text-primary">Notifications</p>
            {count > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-secondary transition-colors hover:text-primary"
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto thin-scroll p-2">
            {isLoading ? (
              <div className="py-8">
                <PageLoader label="Chargement…" />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Aucune notification"
                text="Vous serez prévenu à chaque étape de vos commandes."
              />
            ) : (
              <ul>
                {items.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      compact
                      onRead={(id) => markRead.mutate(id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-surface-container-highest p-2">
            <Link
              to="/espace-client/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-center text-body-sm font-semibold text-secondary transition-colors hover:bg-surface-container"
            >
              Voir toutes mes notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
