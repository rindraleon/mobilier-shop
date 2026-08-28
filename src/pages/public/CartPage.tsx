import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import QuantitySelector from "../../components/ui/QuantitySelector";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

export default function CartPage() {
  const { detailedItems, updateQty, removeFromCart, clearCart, subtotal } = useCart();

  if (detailedItems.length === 0) {
    return (
      <div className="container-app py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            text="Parcourez la boutique et trouvez le meuble qui transformera votre intérieur."
            actionLabel="Découvrir la boutique"
            actionTo="/boutique"
          />
        </div>
      </div>
    );
  }

  const shippingEstimate = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
      <h1 className="mt-4 font-display text-display-md text-primary">Mon panier</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Articles */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-surface-container-highest rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
            {detailedItems.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:gap-6 sm:p-6">
                <Link to={`/boutique/${product.slug}`} className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-20 rounded-md object-cover sm:h-32 sm:w-28"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/boutique/${product.slug}`}
                        className="font-display text-headline-sm text-primary hover:text-secondary"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">
                        {formatPrice(product.price)} / unité
                      </p>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="mt-1 text-label-sm font-medium text-amber-600">
                          Plus que {product.stock} en stock
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      aria-label={`Retirer ${product.name} du panier`}
                      className="shrink-0 rounded-md p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantitySelector
                      value={qty}
                      onChange={(v) => updateQty(product.id, v)}
                      max={product.stock}
                      small
                    />
                    <span className="text-body-md font-semibold text-primary">
                      {formatPrice(product.price * qty)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button as={Link} to="/boutique" variant="ghost">
              ← Continuer mes achats
            </Button>
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-body-sm text-on-surface-variant transition-colors hover:text-red-600"
            >
              <X size={15} /> Vider le panier
            </button>
          </div>
        </div>

        {/* Récapitulatif */}
        <aside className="h-fit rounded-lg border border-outline-variant/40 bg-surface-container-low p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-headline-sm text-primary">Récapitulatif</h2>

          <div className="mt-5 space-y-3 text-body-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Sous-total</span>
              <span className="font-medium text-primary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Livraison (estimée)</span>
              <span className={`font-medium ${shippingEstimate === 0 ? "text-emerald-600" : "text-primary"}`}>
                {shippingEstimate === 0 ? "Offerte" : formatPrice(shippingEstimate)}
              </span>
            </div>
            <div className="border-t border-outline-variant/50 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-primary">Total estimé</span>
                <span className="font-display text-xl text-primary">
                  {formatPrice(subtotal + shippingEstimate)}
                </span>
              </div>
              <p className="mt-1 text-right text-label-sm text-on-surface-variant">TVA incluse</p>
            </div>
          </div>

          {remaining > 0 && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-secondary-container/40 p-3 text-body-sm text-on-secondary-container">
              <Truck size={16} className="mt-0.5 shrink-0" />
              Ajoutez {formatPrice(remaining)} pour bénéficier de la livraison offerte.
            </p>
          )}

          <Button as={Link} to="/commande" variant="accent" size="lg" className="mt-6 w-full">
            Passer la commande <ArrowRight size={17} />
          </Button>
          <p className="mt-3 text-center text-label-sm text-on-surface-variant">
            Paiement sécurisé · CB, PayPal ou à la livraison
          </p>
        </aside>
      </div>
    </div>
  );
}
