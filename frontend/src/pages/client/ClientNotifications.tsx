import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../hooks/useNotifications";
import { formatDateTime } from "../../utils/format";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import NotificationItem from "../../components/notifications/NotificationItem";

export default function ClientNotifications() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading, isError, refetch, isPlaceholderData } = useNotifications({
    page,
    limit: 15,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unread = items.filter((notification) => notification.readAt === null).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-md text-primary">Mes notifications</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Suivi de vos commandes, paiements et activité de votre compte.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck size={16} /> Tout marquer comme lu ({unread})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des notifications…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger vos notifications"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            text="Rien à signaler pour le moment."
          />
        </div>
      ) : (
        <>
          <ul className={`mt-6 space-y-2 ${isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((notification) => (
              <li
                key={notification.id}
                className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest"
              >
                <div className="flex items-start gap-2 p-1">
                  <div className="min-w-0 flex-1">
                    <NotificationItem
                      notification={notification}
                      onRead={(id) => markRead.mutate(id)}
                    />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 p-2">
                    <Badge variant={notification.readAt ? "neutral" : "secondary"}>
                      {notification.readAt ? "Lue" : "Non lue"}
                    </Badge>
                    <span className="text-[11px] text-on-surface-variant">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {data?.meta && (
            <Pagination
              className="mt-6"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
