import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, Check, MapPin, Truck, XCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { ORDER_STEPS, ORDER_STATUS, paymentLabel, shippingLabel } from "../../utils/constants";
import { formatDate, formatDateTime, formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";

export default function ClientOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, orders } = useStore();
  const order = orders.find((o) => o.id === id && o.userId === user?.id);

  if (!user || !order) return <Navigate to="/espace-client/commandes" replace />;

  const meta = ORDER_STATUS[order.status];
  const currentStep = meta.step;
  const cancelled = order.status === "annulee";

  return (
    <div>
      <Button as={Link} to="/espace-client/commandes" variant="ghost" size="sm" className="-ml-2 mb-4">
        <ArrowLeft size={16} /> Toutes mes commandes
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-lg text-primary">Commande {order.id}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Passée le {formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-body-sm font-semibold ${meta.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
      </div>

      {/* Suivi */}
      {cancelled ? (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-body-md text-red-700">
          <XCircle size={22} className="shrink-0" />
          Cette commande a été annulée. Si vous avez payé, le remboursement intervient sous 5 jours ouvrés.
        </div>
      ) : (
        <div className="card mt-6 p-6">
          <h2 className="font-display text-headline-sm text-primary">Suivi de livraison</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-4">
            {ORDER_STEPS.map((label, i) => {
              const done = currentStep >= i + 1;
              return (
                <li key={label} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {done ? <Check size={17} /> : i + 1}
                  </span>
                  <div>
                    <p className={`text-body-sm font-semibold ${done ? "text-primary" : "text-on-surface-variant"}`}>
                      {label}
                    </p>
                    {i === 0 && (
                      <p className="text-label-sm text-on-surface-variant/70">{formatDate(order.createdAt)}</p>
                    )}
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <span
                      className={`absolute left-[18px] top-9 h-6 w-px sm:hidden ${
                        done && currentStep > i + 1 ? "bg-secondary" : "bg-surface-container-highest"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Articles */}
        <div className="card overflow-hidden lg:col-span-2">
          <h2 className="border-b border-surface-container-highest px-6 py-4 font-display text-headline-sm text-primary">
            Articles ({order.items.reduce((s, it) => s + it.qty, 0)})
          </h2>
          <ul className="divide-y divide-surface-container-highest">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 px-6 py-4">
                <img src={item.image} alt={item.name} className="h-16 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-primary">{item.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.qty} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-semibold text-primary">{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-surface-container-highest px-6 py-4 text-body-md">
            <div className="flex justify-between text-on-surface-variant">
              <span>Sous-total</span> <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise {order.promoCode}</span> <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-on-surface-variant">
              <span>Livraison</span>
              <span>{order.shippingCost === 0 ? "Offerte" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-surface-container-highest pt-2 font-semibold text-primary">
              <span>Total</span> <span className="font-display text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <MapPin size={18} className="text-secondary" /> Livraison
            </h3>
            <div className="mt-3 text-body-sm text-on-surface-variant">
              <p className="font-semibold text-primary">{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.address}
                {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ""}
              </p>
              <p>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
            <p className="mt-4 flex items-center gap-2 border-t border-surface-container-highest pt-4 text-body-sm text-on-surface-variant">
              <Truck size={15} className="text-secondary" /> {shippingLabel(order.shippingMethod)}
            </p>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <Banknote size={18} className="text-secondary" /> Paiement
            </h3>
            <p className="mt-3 text-body-md text-on-surface-variant">{paymentLabel(order.paymentMethod)}</p>
            <p className="mt-1 font-display text-xl text-primary">{formatPrice(order.total)}</p>
          </div>

          <div className="rounded-lg bg-secondary-container/40 p-5 text-center">
            <p className="text-body-sm text-on-secondary-container">Une question sur cette commande ?</p>
            <Button as={Link} to="/contact" variant="outline" size="sm" className="mt-3">
              Contacter le service client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
