import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, Truck } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "../../hooks/useCart";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import { productImageUrl } from "../../utils/product";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import QuantitySelector from "../../components/ui/QuantitySelector";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";

export default function CartPage() {
  const { isAuthenticated, isBooting } = useAuth();
  const { data: cart, isLoading } = useCart(isAuthenticated);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (isBooting || (isAuthenticated && isLoading)) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement du panier…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-app py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Connectez-vous pour commander"
            text="Votre panier est lié à votre compte. Connectez-vous ou créez un compte pour finaliser votre commande."
            actionLabel="Se connecter"
            actionTo="/connexion"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
      <h1 className="mt-4 font-display text-display-md text-primary">Mon panier</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            text="Explorez la boutique et ajoutez vos meubles préférés."
            actionLabel="Découvrir la boutique"
            actionTo="/boutique"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {cart && cart.warnings.length > 0 && (
              <ul className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800">
                {cart.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            )}

            <ul className="divide-y divide-surface-container-high rounded-lg border border-outline-variant/50 bg-surface-container-lowest">
              {items.map((item) => {
                const image = productImageUrl(item.product);
                return (
                  <li key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <Link
                      to={"/boutique/" + item.product.slug}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container"
                    >
                      {image ? (
                        <img src={image} alt={item.product.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={"/boutique/" + item.product.slug}
                        className="truncate font-display text-headline-sm text-primary hover:text-secondary"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-label-sm text-on-surface-variant">
                        {item.product.sellerName ?? "Vendeur"}
                      </p>
                      {!item.available && item.issue && (
                        <p className="mt-1 text-label-sm text-red-600">{item.issue}</p>
                      )}
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        {formatPrice(item.unitPrice)} l'unité
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <QuantitySelector
                        value={item.quantity}
                        min={1}
                        max={Math.max(1, item.product.stock)}
                        onChange={(qty) => updateItem.mutate({ itemId: item.id, quantity: qty })}
                      />
                      <span className="w-28 text-right font-display text-lg text-primary">
                        {formatPrice(item.lineTotal)}
                      </span>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        aria-label={"Retirer " + item.product.name}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Récapitulatif</h2>

              <dl className="mt-4 space-y-2.5 text-body-sm">
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Sous-total</dt>
                  <dd className="font-semibold text-primary">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Livraison</dt>
                  <dd className="text-on-surface-variant">
                    {remaining > 0 ? "Calculée à l'étape suivante" : "Offerte"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-surface-container-highest pt-4">
                <span className="text-body-md font-semibold text-primary">Sous-total</span>
                {/* Indicatif : le total définitif est recalculé par le serveur (§87). */}
                <span className="font-display text-2xl text-primary">{formatPrice(subtotal)}</span>
              </div>

              {remaining > 0 ? (
                <p className="mt-3 flex items-center gap-2 text-label-sm text-on-surface-variant">
                  <Truck size={14} className="text-secondary" />
                  Plus que {formatPrice(remaining)} pour la livraison offerte
                </p>
              ) : (
                <p className="mt-3 text-label-sm text-emerald-700">Livraison offerte 🎉</p>
              )}

              {/* Un vrai lien et non un bouton : ouverture dans un onglet,
                  copie de l'adresse, annonce correcte par les lecteurs d'écran. */}
              <Button as={Link} to="/commande" className="mt-5 w-full" size="lg">
                Passer commande
              </Button>
              <Link
                to="/boutique"
                className="mt-3 block text-center text-body-sm text-on-surface-variant underline-offset-2 hover:underline"
              >
                Continuer mes achats
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
