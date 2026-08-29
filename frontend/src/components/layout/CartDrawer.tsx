import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import QuantitySelector from "../ui/QuantitySelector";
import Button from "../ui/Button";

export default function CartDrawer() {
  const { cartOpen, closeCart, detailedItems, updateQty, removeFromCart, subtotal } = useCart();

  useEffect(() => {
    if (!cartOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const totalQty = detailedItems.reduce((s, it) => s + it.qty, 0);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Panier">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-fade-in" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-drawer animate-slide-left">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
            <ShoppingBag size={20} className="text-secondary" /> Votre panier
            {detailedItems.length > 0 && (
              <span className="text-body-sm font-normal text-on-surface-variant">
                ({totalQty} article{totalQty > 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {detailedItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
              <ShoppingBag size={28} />
            </div>
            <p className="font-display text-headline-sm text-primary">Votre panier est vide</p>
            <p className="text-body-sm text-on-surface-variant">
              Parcourez la boutique et trouvez le meuble qui transformera votre intérieur.
            </p>
            <Button as={Link} to="/boutique" onClick={closeCart} variant="accent">
              Découvrir la boutique
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-surface-container-highest px-5 py-3.5">
              <p className="mb-2 flex items-center gap-2 text-body-sm text-on-surface-variant">
                <Truck size={16} className="shrink-0 text-secondary" />
                {remaining > 0 ? (
                  <span>
                    Plus que <strong className="text-primary">{formatPrice(remaining)}</strong> pour la livraison
                    offerte
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-700">Bravo, la livraison est offerte !</span>
                )}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="thin-scroll flex-1 divide-y divide-surface-container-highest overflow-y-auto px-5">
              {detailedItems.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <Link to={`/boutique/${product.slug}`} onClick={closeCart} className="shrink-0">
                    <img src={product.image} alt={product.name} className="h-24 w-20 rounded-md object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/boutique/${product.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-body-sm font-medium text-primary hover:text-secondary"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`Retirer ${product.name}`}
                        className="shrink-0 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">
                      {formatPrice(product.price)} / unité
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantitySelector
                        value={qty}
                        onChange={(v) => updateQty(product.id, v)}
                        max={product.stock}
                        small
                      />
                      <span className="text-body-sm font-semibold text-primary">
                        {formatPrice(product.price * qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-surface-container-highest px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Sous-total</span>
                <span className="font-display text-xl text-primary">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-label-sm text-on-surface-variant">
                Frais de livraison calculés à l'étape suivante. Taxes incluses.
              </p>
              <div className="flex flex-col gap-2">
                <Button as={Link} to="/commande" onClick={closeCart} variant="accent" size="lg" className="w-full">
                  Passer la commande
                </Button>
                <Button as={Link} to="/panier" onClick={closeCart} variant="outline" className="w-full">
                  Voir mon panier
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
