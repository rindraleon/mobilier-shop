import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Phone } from "lucide-react";
import { useSellerOrder } from "../../hooks/useSeller";
import { useUpdateOrderStatus } from "../../hooks/useOrders";
import { ORDER_STATUS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import StatusBadge from "../../components/ui/StatusBadge";
import { Field, Select } from "../../components/ui/Form";
import type { OrderStatus } from "../../types/api";

/** Transitions autorisées pour un vendeur (§66). */
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
};

export default function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: order, isLoading, isError, refetch } = useSellerOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement de la commande…" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Commande introuvable"
        text="Cette commande n'existe pas ou ne concerne pas votre boutique."
        actionLabel="Mes commandes"
        actionTo="/vendeur/commandes"
      />
    );
  }

  const allowed = NEXT_STATUSES[order.status] ?? [];

  return (
    <div>
      <Link
        to="/vendeur/commandes"
        className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant underline-offset-2 hover:text-secondary hover:underline"
      >
        <ArrowLeft size={15} /> Mes commandes
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
              <Package size={18} className="text-secondary" /> Articles de votre boutique
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
                      {item.sku ?? "—"} · {formatPrice(item.unitPrice)} l'unité
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
              {order.shippingAddress.addressLine2 ? (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </address>
            <p className="mt-3 flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Phone size={14} className="text-secondary" /> {order.shippingAddress.phone}
            </p>
          </section>

          {order.payment && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Paiement</h2>
              <div className="mt-3">
                <StatusBadge kind="payment" status={order.payment.status} />
              </div>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Réf. {order.payment.transactionReference} · {formatPrice(order.payment.amount)}
              </p>
            </section>
          )}

          {allowed.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Faire avancer</h2>
              <div className="mt-3 space-y-3">
                <Field label="Nouveau statut">
                  <Select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  >
                    <option value="">Choisir…</option>
                    {allowed.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS[status]?.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button
                  className="w-full"
                  disabled={!nextStatus || updateStatus.isPending}
                  onClick={() => {
                    if (!nextStatus) return;
                    updateStatus.mutate(
                      { id: order.id, status: nextStatus },
                      {
                        onError: (error: unknown) => toast(errorMessage(error), "error"),
                        onSuccess: () => {
                          setNextStatus("");
                          void refetch();
                        },
                      },
                    );
                  }}
                >
                  {updateStatus.isPending ? "Mise à jour…" : "Mettre à jour"}
                </Button>
              </div>
              <p className="mt-3 text-label-sm text-on-surface-variant">
                Chaque transition est contrôlée et historisée par le serveur (§66).
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
