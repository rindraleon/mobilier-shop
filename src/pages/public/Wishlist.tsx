import { Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useStore } from "../../context/StoreContext";
import ProductCard from "../../components/product/ProductCard";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import EmptyState from "../../components/ui/EmptyState";

export default function Wishlist() {
  const { wishlist } = useCart();
  const { products } = useStore();
  const wished = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Mes favoris" }]} />
      <h1 className="mt-4 font-display text-display-md text-primary">Mes favoris</h1>
      <p className="mt-2 text-body-lg text-on-surface-variant">
        Les pièces que vous avez mises de côté — {wished.length} article{wished.length > 1 ? "s" : ""}.
      </p>

      <div className="mt-8">
        {wished.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori pour le moment"
            text="Cliquez sur le cœur d'un produit pour le retrouver ici, quel que soit l'appareil utilisé."
            actionLabel="Explorer la boutique"
            actionTo="/boutique"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {wished.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
