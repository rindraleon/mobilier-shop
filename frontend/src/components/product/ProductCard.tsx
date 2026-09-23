import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useAddCartItem } from "../../hooks/useCart";
import { useToggleWishlist } from "../../hooks/useWishlist";
import { useAuth } from "../../lib/auth/AuthProvider";
import { discountRate, formatPrice } from "../../utils/format";
import { isLowStock, isPurchasable, productImageUrl, toNumber } from "../../utils/product";
import Stars from "../ui/Stars";
import type { Product } from "../../types/api";

interface ProductCardProps {
  product: Product;
  /** Identifiants déjà présents dans les favoris (évite un état local). */
  wishlisted?: boolean;
}

export default function ProductCard({ product, wishlisted = false }: Readonly<ProductCardProps>) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addItem = useAddCartItem();
  const toggleWishlist = useToggleWishlist();

  const image = productImageUrl(product);
  const promo = discountRate(product.price, product.compareAtPrice);
  const purchasable = isPurchasable(product);
  const lowStock = isLowStock(product.stock);
  const rating = toNumber(product.ratingAverage);

  const handleAdd = (): void => {
    // Le panier est serveur : il exige une session (§8).
    if (!isAuthenticated) {
      navigate("/connexion", { state: { from: "/boutique" } });
      return;
    }
    if (!purchasable) return;
    addItem.mutate({ productId: product.id, quantity: 1 });
  };

  const handleWishlist = (): void => {
    if (!isAuthenticated) {
      navigate("/connexion", { state: { from: "/boutique" } });
      return;
    }
    toggleWishlist.mutate({ productId: product.id, name: product.name });
  };

  return (
    <article className="product-card card group relative flex flex-col overflow-hidden">
      <Link to={"/boutique/" + product.slug} className="relative block aspect-[4/5] overflow-hidden bg-surface-container">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            <ShoppingBag size={32} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {promo > 0 && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-on-secondary">
              −{promo} %
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-on-primary">
              Nouveau
            </span>
          )}
          {!purchasable && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-on-background">
              Rupture de stock
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-on-surface-variant shadow-card transition-colors hover:text-secondary"
        >
          <Heart size={17} className={wishlisted ? "fill-secondary text-secondary" : ""} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            {product.category.name}
          </p>
        )}

        <h3 className="mt-1.5 font-display text-headline-sm leading-snug text-primary">
          <Link to={"/boutique/" + product.slug} className="transition-colors hover:text-secondary">
            {product.name}
          </Link>
        </h3>

        {product.seller && (
          <p className="mt-1 text-label-sm text-on-surface-variant">par {product.seller.shopName}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <Stars value={rating} size={13} />
          <span className="text-label-sm text-on-surface-variant">
            {rating > 0 ? rating.toFixed(1) : "Nouveau"}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl text-primary">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-body-sm text-on-surface-variant line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <p className="mt-1 text-label-sm text-on-surface-variant">
          {product.stock > 0
            ? lowStock
              ? `Plus que ${product.stock} en stock`
              : `${product.stock} en stock`
            : "Indisponible"}
        </p>

        <button
          onClick={handleAdd}
          disabled={!purchasable || addItem.isPending}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag size={16} />
          {addItem.isPending ? "Ajout…" : purchasable ? "Ajouter au panier" : "Indisponible"}
        </button>
      </div>
    </article>
  );
}
