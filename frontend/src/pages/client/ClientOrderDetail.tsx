import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Package, XCircle } from "lucide-react";
import { useOrder, useCancelOrder } from "../../hooks/useOrders";
import { formatDate, formatPrice } from "../../utils/format";
import { ORDER_STATUS, ORDER_STEPS } from "../../utils/constants";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../utils/errors";

/** Statuts qui autorisent encore une annulation client (§66). */
const CANCELLABLE = ["pending_payment", "payment_submitted", "paid"] as const;

export default function ClientOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

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
        text="Cette commande n'existe pas ou ne vous appartient pas."
        actionLabel="Mes commandes"
        actionTo="/espace-client/commandes"
      />
    );
  }

  const canCancel = (CANCELLABLE as readonly string[]).includes(order.status);
  const currentStep = ORDER_STATUS[order.status]?.step ?? 0;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Mes commandes", to: "/espace-client/commandes" },
          { label: order.orderNumber },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-md text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Fil d'étapes */}
      {order.status !== "cancelled" && order.status !== "rejected" && (
        <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ORDER_STEPS.map((label, index) => {
            const step = index + 1;
            const done = currentStep >= step;
            return (
              <li key={label} className="flex flex-col gap-1.5">
                <span
                  className={`h-1.5 rounded-full ${done ? "bg-secondary" : "bg-surface-container-high"}`}
                />
                <span className={`text-label-sm ${done ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
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
                    {item.slug ? (
                      <Link
                        to={"/boutique/" + item.slug}
                        className="block truncate text-body-sm font-semibold text-primary hover:text-secondary"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-body-sm font-semibold text-primary">
                        {item.name}
                      </span>
                    )}
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
              {order.shippingAddress.addressLine2 ? (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
          </section>

          {order.payment && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
                <CreditCard size={18} className="text-secondary" /> Paiement
              </h2>
              <div className="mt-3 space-y-2 text-body-sm">
                <StatusBadge kind="payment" status={order.payment.status} />
                <p className="text-on-surface-variant">
                  Réf. <span className="text-primary">{order.payment.transactionReference}</span>
                </p>
                <p className="text-on-surface-variant">{formatPrice(order.payment.amount)}</p>
              </div>
              {order.status === "pending_payment" && (
                <Button
                  as={Link}
                  to={"/commande/succes/" + order.id}
                  className="mt-4 w-full"
                  size="sm"
                >
                  Envoyer ma référence
                </Button>
              )}
            </section>
          )}

          {canCancel && (
            <Button
              variant="outline"
              className="w-full text-red-600"
              onClick={() => setConfirmOpen(true)}
            >
              <XCircle size={16} /> Annuler ma commande
            </Button>
          )}

          <Button as={Link} to="/espace-client/commandes" variant="ghost" className="w-full">
            <ArrowLeft size={16} /> Retour aux commandes
          </Button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          cancelOrder.mutate(
            { id: order.id },
            {
              onError: (error: unknown) => toast(errorMessage(error), "error"),
              onSuccess: () => void refetch(),
            },
          );
        }}
        title="Annuler la commande"
        message="Les articles seront remis en stock. Cette action est définitive."
        confirmLabel="Annuler la commande"
      />
    </div>
  );
}
