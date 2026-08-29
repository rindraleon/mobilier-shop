import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types";
import { categoryName, discountRate, formatPrice } from "../../utils/format";
import Stars from "../ui/Stars";

interface ProductCardProps {
  product: Product;
}

/**
 * Carte produit réutilisable (boutique, accueil, favoris…).
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, openCart } = useCart();
  const promo = discountRate(product.price, product.oldPrice);
  const wished = isWishlisted(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <article className="product-card group relative flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
        <Link to={`/boutique/${product.slug}`} aria-label={product.name}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {promo > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">−{promo} %</span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-bold text-on-secondary-container">
              Nouveau
            </span>
          )}
        </div>

        {/* Favoris */}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition-all hover:scale-110 ${
            wished ? "text-red-500" : "text-primary"
          }`}
        >
          <Heart size={17} className={wished ? "fill-red-500" : ""} />
        </button>

        {/* Ajout rapide */}
        {!outOfStock && (
          <button
            onClick={() => {
              if (addToCart(product.id, 1)) openCart();
            }}
            aria-label={`Ajouter ${product.name} au panier`}
            className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-primary text-on-primary opacity-0 shadow-card transition-all duration-300 hover:bg-secondary hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100"
          >
            <ShoppingBag size={18} />
          </button>
        )}

        {outOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-on-background/60 py-2 text-center text-label-md uppercase tracking-widest text-white backdrop-blur-sm">
            Rupture de stock
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
          {categoryName(product.category)}
        </p>
        <Link to={`/boutique/${product.slug}`} className="mt-0.5">
          <h3 className="line-clamp-1 font-display text-headline-sm text-primary transition-colors group-hover:text-secondary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-2">
          <Stars value={product.rating} size={13} />
          <span className="text-label-sm text-on-surface-variant">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-body-md font-semibold text-primary">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-body-sm text-on-surface-variant line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
