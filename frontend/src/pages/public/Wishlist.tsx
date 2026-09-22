import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist, useRemoveFromWishlist } from "../../hooks/useWishlist";
import { useAuth } from "../../lib/auth/AuthProvider";
import { formatPrice } from "../../utils/format";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import Button from "../../components/ui/Button";

export default function Wishlist() {
  const { isAuthenticated, isBooting } = useAuth();
  const { data: wishlist, isLoading } = useWishlist();
  const remove = useRemoveFromWishlist();

  const items = wishlist ?? [];

  if (isBooting || (isAuthenticated && isLoading)) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement des favoris…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-app py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Favoris" }]} />
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Connectez-vous pour gérer vos favoris"
            text="Votre liste de favoris est enregistrée sur votre compte."
            actionLabel="Se connecter"
            actionTo="/connexion"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Favoris" }]} />
      <h1 className="mt-4 font-display text-display-md text-primary">Mes favoris</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Aucun favori pour le moment"
            text="Parcourez la boutique et ajoutez les meubles qui vous plaisent."
            actionLabel="Découvrir la boutique"
            actionTo="/boutique"
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="card flex flex-col overflow-hidden">
              <Link to={"/boutique/" + item.slug} className="block aspect-[4/3] bg-surface-container">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link
                  to={"/boutique/" + item.slug}
                  className="font-display text-headline-sm text-primary hover:text-secondary"
                >
                  {item.name}
                </Link>
                <p className="mt-2 font-display text-lg text-primary">{formatPrice(item.price)}</p>
                <p
                  className={`mt-1 text-label-sm ${
                    item.stock > 0 ? "text-on-surface-variant" : "text-red-600"
                  }`}
                >
                  {item.stock > 0 ? `${item.stock} en stock` : "Rupture de stock"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button as={Link} to={"/boutique/" + item.slug} size="sm" className="flex-1">
                    Voir le produit
                  </Button>
                  <button
                    onClick={() => remove.mutate(item.id)}
                    aria-label={"Retirer " + item.name + " des favoris"}
                    className="rounded-lg border border-outline-variant px-3 text-on-surface-variant transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <Heart size={16} className="fill-current" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
