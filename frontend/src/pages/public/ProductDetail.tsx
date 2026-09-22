import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag, Store, Truck } from "lucide-react";
import { useProduct } from "../../hooks/useCatalog";
import { useAddCartItem } from "../../hooks/useCart";
import { useToggleWishlist } from "../../hooks/useWishlist";
import { useAuth } from "../../lib/auth/AuthProvider";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { discountRate, formatDate, formatPrice } from "../../utils/format";
import { isLowStock, isPurchasable, productImageUrl, toNumber } from "../../utils/product";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import Stars from "../../components/ui/Stars";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import ProductCard from "../../components/product/ProductCard";
import { useProducts } from "../../hooks/useCatalog";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const addItem = useAddCartItem();
  const toggleWishlist = useToggleWishlist();
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<number>(0);

  // Produits du même vendeur ou de la même catégorie.
  const { data: related } = useProducts(
    product ? { category: product.category?.slug, limit: 5 } : { limit: 0 },
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement du produit…" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container-app py-20">
        <EmptyState
          title="Produit introuvable"
          text={error instanceof Error ? error.message : "Ce produit n'existe pas ou a été retiré."}
          actionLabel="Réessayer"
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[activeImage]?.url ?? productImageUrl(product);
  const promo = discountRate(product.price, product.compareAtPrice);
  const purchasable = isPurchasable(product);
  const lowStock = isLowStock(product.stock);
  const rating = toNumber(product.ratingAverage);
  const maxQuantity = Math.max(1, product.stock);

  const handleAdd = (): void => {
    if (!isAuthenticated) {
      navigate("/connexion", { state: { from: "/boutique/" + product.slug } });
      return;
    }
    addItem.mutate({ productId: product.id, quantity });
  };

  const relatedProducts = (related?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Boutique", to: "/boutique" },
          ...(product.category
            ? [
                {
                  label: product.category.name,
                  to: "/boutique?categorie=" + product.category.slug,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galerie */}
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container">
            {currentImage ? (
              <img src={currentImage} alt={product.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(i)}
                  aria-label={"Image " + (i + 1)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-surface-container transition-colors ${
                    i === activeImage ? "border-secondary" : "border-transparent hover:border-outline-variant"
                  }`}
                >
                  {image.url ? (
                    <img src={image.url} alt={image.alt ?? product.name} className="h-full w-full object-cover" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fiche */}
        <div>
          {product.category && (
            <p className="text-label-md uppercase tracking-wider text-secondary">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-display-md text-primary">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars value={rating} size={16} />
            <span className="text-body-sm text-on-surface-variant">
              {product.ratingCount > 0
                ? `${rating.toFixed(1)} · ${product.ratingCount} avis`
                : "Aucun avis pour le moment"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-primary">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-body-lg text-on-surface-variant line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-label-sm font-bold text-on-secondary">
                  −{promo} %
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-5 text-body-lg text-on-surface-variant">{product.shortDescription}</p>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.material && (
              <div className="rounded-lg bg-surface-container-low p-3.5">
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Matière</dt>
                <dd className="mt-0.5 text-body-sm text-primary">{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div className="rounded-lg bg-surface-container-low p-3.5">
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Dimensions</dt>
                <dd className="mt-0.5 text-body-sm text-primary">{product.dimensions}</dd>
              </div>
            )}
          </dl>

          {/* Stock */}
          <div className="mt-6">
            {product.stock > 0 ? (
              <p className={`text-body-sm ${lowStock ? "text-amber-700" : "text-emerald-700"}`}>
                {lowStock
                  ? `Stock limité — plus que ${product.stock} disponible${product.stock > 1 ? "s" : ""}`
                  : `En stock — ${product.stock} disponible${product.stock > 1 ? "s" : ""}`}
              </p>
            ) : (
              <p className="text-body-sm text-red-600">Rupture de stock</p>
            )}
          </div>

          {/* Quantité + actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-outline-variant bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
                className="px-3 py-3 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2.5rem] text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Augmenter la quantité"
                className="px-3 py-3 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!purchasable || addItem.isPending}
              className="flex-1 sm:flex-none"
            >
              <ShoppingBag size={18} />
              {addItem.isPending ? "Ajout…" : purchasable ? "Ajouter au panier" : "Indisponible"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleWishlist.mutate({ productId: product.id, name: product.name })}
              aria-label="Ajouter aux favoris"
            >
              <Heart size={18} />
            </Button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Truck size={16} className="text-secondary" />
            Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD)} · Retours sous 30 jours
          </p>

          {/* Vendeur */}
          {product.seller && (
            <div className="mt-8 flex items-center gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <Store size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Vendu par</p>
                <p className="truncate text-body-md font-semibold text-primary">
                  {product.seller.shopName}
                </p>
              </div>
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="font-display text-headline-sm text-primary">Description</h2>
              <p className="mt-3 whitespace-pre-line text-body-md text-on-surface-variant">
                {product.description}
              </p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 text-body-sm">
            {product.sku && (
              <div>
                <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Référence</dt>
                <dd className="text-primary">{product.sku}</dd>
              </div>
            )}
            <div>
              <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">Ajouté le</dt>
              <dd className="text-primary">{formatDate(product.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-headline-md text-primary">Dans la même catégorie</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
