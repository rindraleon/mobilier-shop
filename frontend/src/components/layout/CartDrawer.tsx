import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useRemoveCartItem, useUpdateCartItem } from "../../hooks/useCart";
import { useCartDrawer } from "../../context/CartDrawerContext";
import { useAuth } from "../../lib/auth/AuthProvider";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import { productImageUrl } from "../../utils/product";
import QuantitySelector from "../ui/QuantitySelector";
import Button from "../ui/Button";
import PageLoader from "../ui/PageLoader";
import EmptyState from "../ui/EmptyState";

export default function CartDrawer() {
  const { isOpen, closeCart } = useCartDrawer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart(isOpen && isAuthenticated);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const totalQty = cart?.quantity ?? 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Panier">
      <div
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface-container-lowest shadow-drawer animate-slide-left">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
            <ShoppingBag size={20} className="text-secondary" /> Votre panier
            {totalQty > 0 && (
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

        {!isAuthenticated ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Connectez-vous pour commander"
              text="Votre panier est conservé sur votre compte. Connectez-vous ou créez un compte pour finaliser votre commande."
              actionLabel="Se connecter"
              actionTo="/connexion"
            />
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <PageLoader label="Chargement du panier…" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Votre panier est vide"
              text="Explorez la boutique et ajoutez vos meubles préférés."
              actionLabel="Découvrir la boutique"
              actionTo="/boutique"
            />
          </div>
        ) : (
          <>
            {cart && cart.warnings.length > 0 && (
              <ul className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-label-sm text-amber-800">
                {cart.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            )}

            <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => {
                  const image = productImageUrl(item.product);
                  return (
                    <li key={item.id} className="flex gap-3">
                      <Link
                        to={"/boutique/" + item.product.slug}
                        onClick={closeCart}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={item.product.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={"/boutique/" + item.product.slug}
                            onClick={closeCart}
                            className="truncate text-body-sm font-semibold text-primary hover:text-secondary"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem.mutate(item.id)}
                            aria-label={"Retirer " + item.product.name}
                            className="shrink-0 rounded-md p-1 text-on-surface-variant transition-colors hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <p className="text-label-sm text-on-surface-variant">
                          {item.product.sellerName ?? "Vendeur"}
                        </p>

                        {!item.available && item.issue && (
                          <p className="mt-1 text-label-sm text-red-600">{item.issue}</p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QuantitySelector
                            value={item.quantity}
                            min={1}
                            max={Math.max(1, item.product.stock)}
                            small
                            onChange={(qty) => updateItem.mutate({ itemId: item.id, quantity: qty })}
                          />
                          <span className="text-body-sm font-semibold text-primary">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-surface-container-highest px-5 py-4">
              {remaining > 0 ? (
                <div className="mb-3">
                  <p className="text-label-sm text-on-surface-variant">
                    Plus que <strong className="text-primary">{formatPrice(remaining)}</strong> pour
                    la livraison offerte
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{ width: progress + "%" }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mb-3 flex items-center gap-1.5 text-label-sm text-emerald-700">
                  <Truck size={14} /> Livraison offerte
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Sous-total</span>
                {/* Montant **indicatif** : le serveur recalcule le total final (§87). */}
                <span className="font-display text-xl text-primary">{formatPrice(subtotal)}</span>
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={() => {
                  closeCart();
                  navigate("/commande");
                }}
              >
                Passer commande
              </Button>
              <button
                onClick={closeCart}
                className="mt-2 w-full text-center text-body-sm text-on-surface-variant underline-offset-2 hover:underline"
              >
                Continuer mes achats
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
