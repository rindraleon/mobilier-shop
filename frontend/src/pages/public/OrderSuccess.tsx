import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, Package, Truck } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { paymentLabel, shippingLabel } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const { orders, user } = useStore();
  const order = orders.find((o) => o.id === id);

  if (!order) return <Navigate to="/boutique" replace />;

  return (
    <div className="container-app py-12 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={44} />
        </span>
        <h1 className="mt-6 font-display text-display-md text-primary">
          Merci {order.customerName.split(" ")[0]} !
        </h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Votre commande <strong className="text-primary">{order.id}</strong> a bien été enregistrée. Un email de
          confirmation vient de vous être envoyé à <strong className="text-primary">{order.customerEmail}</strong>.
        </p>
      </div>

      <div className="card mx-auto mt-10 max-w-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-highest bg-surface-container-low px-6 py-4">
          <div>
            <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Commande</p>
            <p className="font-display text-lg text-primary">{order.id}</p>
          </div>
          <div>
            <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">Date</p>
            <p className="text-body-md font-medium text-primary">{formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <ul className="divide-y divide-surface-container-highest px-6">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-4">
              <img src={item.image} alt={item.name} className="h-16 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-primary">{item.name}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {item.qty} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-body-md font-semibold text-primary">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-1.5 border-t border-surface-container-highest px-6 py-4 text-body-md">
          <div className="flex justify-between text-on-surface-variant">
            <span>Sous-total</span> <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Remise {order.promoCode}</span> <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-on-surface-variant">
            <span>Livraison ({shippingLabel(order.shippingMethod)})</span>
            <span>{order.shippingCost === 0 ? "Offerte" : formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-surface-container-highest pt-2 font-semibold text-primary">
            <span>Total payé ({paymentLabel(order.paymentMethod)})</span>
            <span className="font-display text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="grid gap-3 border-t border-surface-container-highest bg-surface-container-low px-6 py-4 sm:grid-cols-3">
          {[
            { icon: Mail, text: "Email de confirmation envoyé" },
            { icon: Package, text: "Préparation sous 24 h" },
            { icon: Truck, text: "Suivi disponible dans votre espace" },
          ].map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Icon size={16} className="shrink-0 text-secondary" /> {text}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {user && (
          <Button as={Link} to={`/espace-client/commandes/${order.id}`} variant="accent" size="lg">
            Suivre ma commande
          </Button>
        )}
        <Button as={Link} to="/boutique" variant="outline" size="lg">
          Continuer mes achats <ArrowRight size={17} />
        </Button>
      </div>
    </div>
  );
}
