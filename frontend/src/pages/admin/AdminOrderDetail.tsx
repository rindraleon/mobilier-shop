import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import { useAdminOrders, useAdminUpdateOrderStatus } from "../../hooks/useAdmin";
import { ADMIN_ORDER_TRANSITIONS, ORDER_STATUS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import StatusBadge from "../../components/ui/StatusBadge";
import { Field, Select, Textarea } from "../../components/ui/Form";
import type { OrderStatus } from "../../types/api";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: list, isLoading } = useAdminOrders({ limit: 100 });
  const updateStatus = useAdminUpdateOrderStatus();
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [comment, setComment] = useState<string>("");

  const order = id ? list?.items.find((o) => o.id === id) : undefined;
  const nextStatusOptions: OrderStatus[] = order
    ? (ADMIN_ORDER_TRANSITIONS[order.status] ?? [])
    : [];

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement de la commande…" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Commande introuvable"
        actionLabel="Toutes les commandes"
        actionTo="/admin/commandes"
      />
    );
  }

  return (
    <div>
      <Link
        to="/admin/commandes"
        className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant underline-offset-2 hover:text-secondary hover:underline"
      >
        <ArrowLeft size={15} /> Commandes
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-md text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <Package size={18} className="text-secondary" /> Articles
            </h2>
            <ul className="mt-4 divide-y divide-surface-container-high">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-primary">
                      {item.name}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant">
                      {item.sellerName ?? "Vendeur"} · {formatPrice(item.unitPrice)} l'unité
                    </span>
                  </span>
                  <span className="text-body-sm text-on-surface-variant">× {item.quantity}</span>
                  <span className="w-24 text-right text-body-sm font-semibold text-primary">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-surface-container-highest pt-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Livraison</dt>
                <dd>{formatPrice(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between border-t border-surface-container-highest pt-2 text-body-lg">
                <dt className="font-semibold text-primary">Total</dt>
                <dd className="font-display text-xl text-primary">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.statusHistory.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Historique</h2>
              <ol className="mt-3 space-y-3">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                    <div>
                      <OrderStatusBadge status={entry.newStatus} />
                      {entry.comment && (
                        <p className="mt-1 text-label-sm text-on-surface-variant">{entry.comment}</p>
                      )}
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <MapPin size={18} className="text-secondary" /> Livraison
            </h2>
            <address className="mt-3 not-italic text-body-sm text-on-surface-variant">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.addressLine1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
          </section>

          {order.payment && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Paiement</h2>
              <div className="mt-3 space-y-2">
                <StatusBadge kind="payment" status={order.payment.status} />
                <p className="text-body-sm text-on-surface-variant">
                  Réf. {order.payment.transactionReference} · {formatPrice(order.payment.amount)}
                </p>
              </div>
            </section>
          )}

          <section className="card p-5">
            <h2 className="font-display text-headline-sm text-primary">Changer le statut</h2>
            <div className="mt-3 space-y-3">
              {(order.status === "pending_payment" || order.status === "payment_submitted") && (
                <p className="rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
                  La validation du paiement se fait depuis{" "}
                  <Link
                    to="/admin/paiements"
                    className="font-semibold text-secondary underline-offset-2 hover:underline"
                  >
                    l'écran Paiements
                  </Link>{" "}
                  (vérification manuelle de la référence).
                </p>
              )}
              {nextStatusOptions.length === 0 && (
                <p className="text-label-sm text-on-surface-variant">
                  Aucun changement de statut autorisé dans cet état.
                </p>
              )}
              {nextStatusOptions.length > 0 && (
                <Field label="Nouveau statut">
                  <Select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  >
                    <option value="">Choisir…</option>
                    {nextStatusOptions.map((value) => (
                      <option key={value} value={value}>
                        {ORDER_STATUS[value]?.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Commentaire">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Motif (optionnel, journalisé)"
                />
              </Field>
              <Button
                className="w-full"
                disabled={!nextStatus || updateStatus.isPending}
                onClick={() => {
                  if (!nextStatus) return;
                  updateStatus.mutate(
                    { id: order.id, status: nextStatus, comment: comment || undefined },
                    {
                      onError: (error: unknown) => toast(errorMessage(error), "error"),
                      onSuccess: () => {
                        setNextStatus("");
                        setComment("");
                      },
                    },
                  );
                }}
              >
                {updateStatus.isPending ? "Mise à jour…" : "Mettre à jour"}
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
