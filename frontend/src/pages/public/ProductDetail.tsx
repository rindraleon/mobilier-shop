import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, PackageCheck, PackageX, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useCart } from "../../context/CartContext";
import { categoryName, discountRate, formatPrice } from "../../utils/format";
import { sampleReviews } from "../../utils/reviews";
import ProductCard from "../../components/product/ProductCard";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Stars from "../../components/ui/Stars";
import QuantitySelector from "../../components/ui/QuantitySelector";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import SectionHeading from "../../components/ui/SectionHeading";
import EmptyState from "../../components/ui/EmptyState";

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "description", label: "Description" },
  { id: "caracteristiques", label: "Caractéristiques" },
  { id: "avis", label: "Avis" },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useStore();
  const { addToCart, toggleWishlist, isWishlisted, openCart } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [tab, setTab] = useState<string>("description");

  const product = products.find((p) => p.slug === slug);

  useEffect(() => {
    setQty(1);
    setTab("description");
  }, [slug]);

  if (!product) {
    return (
      <div className="container-app py-20">
        <EmptyState
          icon={PackageX}
          title="Produit introuvable"
          text="Ce produit n'existe plus ou a été retiré de la boutique."
          actionLabel="Retour à la boutique"
          actionTo="/boutique"
        />
      </div>
    );
  }

  const promo = discountRate(product.price, product.oldPrice);
  const wished = isWishlisted(product.id);
  const outOfStock = product.stock <= 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const reassurance: { icon: LucideIcon; text: string }[] = [
    { icon: Truck, text: "Livraison standard offerte dès 300 € — express en 24/48 h" },
    { icon: RotateCcw, text: "Retours gratuits sous 30 jours, sans justification" },
    { icon: ShieldCheck, text: "Garantie 5 ans sur l'ensemble de nos meubles" },
    { icon: PackageCheck, text: "Emballage renforcé et montage facile inclus" },
  ];

  const stockInfo = outOfStock ? (
    <span className="flex items-center gap-2 text-body-sm font-medium text-red-600">
      <span className="h-2 w-2 rounded-full bg-red-500" /> Rupture de stock — réapprovisionnement en cours
    </span>
  ) : product.stock <= 5 ? (
    <span className="flex items-center gap-2 text-body-sm font-medium text-amber-600">
      <span className="h-2 w-2 rounded-full bg-amber-500" /> Plus que {product.stock} exemplaire
      {product.stock > 1 ? "s" : ""} en stock
    </span>
  ) : (
    <span className="flex items-center gap-2 text-body-sm font-medium text-emerald-600">
      <span className="h-2 w-2 rounded-full bg-emerald-500" /> En stock — expédié sous 24 h
    </span>
  );

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Boutique", to: "/boutique" },
          { label: categoryName(product.category), to: `/boutique?categorie=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Visuel */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container shadow-card">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full lg:min-h-[540px]"
          />
          {promo > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
              −{promo} %
            </span>
          )}
          {product.isNew && (
            <span className="absolute left-4 top-16 rounded-full bg-secondary-container px-3 py-1.5 text-sm font-bold text-on-secondary-container">
              Nouveau
            </span>
          )}
        </div>

        {/* Infos */}
        <div>
          <Link
            to={`/boutique?categorie=${product.category}`}
            className="text-label-md uppercase tracking-[0.15em] text-secondary hover:underline"
          >
            {categoryName(product.category)}
          </Link>
          <h1 className="mt-2 font-display text-display-md text-primary">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars value={product.rating} size={17} />
            <span className="text-body-sm text-on-surface-variant">
              {product.rating.toFixed(1).replace(".", ",")}/5 · {product.reviews} avis
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-body-lg text-on-surface-variant line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <Badge variant="danger">Économisez {formatPrice(product.oldPrice - product.price)}</Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-body-lg text-on-surface-variant">{product.description}</p>

          <div className="mt-6">{stockInfo}</div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantitySelector value={qty} onChange={setQty} max={outOfStock ? 1 : product.stock} />
            <Button
              variant="accent"
              size="lg"
              disabled={outOfStock}
              onClick={() => {
                if (addToCart(product.id, qty)) openCart();
              }}
            >
              <ShoppingBag size={19} /> Ajouter au panier
            </Button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label={wished ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-all ${
                wished
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary"
              }`}
            >
              <Heart size={20} className={wished ? "fill-red-500" : ""} />
            </button>
          </div>

          {/* Réassurance */}
          <ul className="mt-8 space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-5">
            {reassurance.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                <Icon size={18} className="shrink-0 text-secondary" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Onglets */}
      <div className="mt-14">
        <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/60" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-body-md font-medium transition-colors ${
                tab === t.id
                  ? "border-secondary text-secondary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {t.label}
              {t.id === "avis" && ` (${product.reviews})`}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === "description" && (
            <div className="max-w-3xl">
              <p className="text-body-lg leading-relaxed text-on-surface-variant">{product.longDescription}</p>
            </div>
          )}

          {tab === "caracteristiques" && (
            <dl className="max-w-2xl divide-y divide-surface-container-highest rounded-lg border border-outline-variant/40">
              {(
                [
                  ["Matériau", product.material],
                  ["Dimensions", product.dimensions],
                  ["Catégorie", categoryName(product.category)],
                  ["Garantie", "5 ans"],
                  ["Entretien", "Chiffon humide, huile spécifique 1 à 2 fois par an"],
                  ["Livraison", "Colis renforcé, pieds à monter (notice incluse)"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 px-5 py-3.5">
                  <dt className="text-label-md text-on-surface-variant">{label}</dt>
                  <dd className="col-span-2 text-body-md text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === "avis" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="card h-fit p-6 text-center">
                <p className="font-display text-5xl text-primary">{product.rating.toFixed(1).replace(".", ",")}</p>
                <Stars value={product.rating} size={18} className="mt-3 justify-center" />
                <p className="mt-2 text-body-sm text-on-surface-variant">Basé sur {product.reviews} avis vérifiés</p>
              </div>
              <ul className="space-y-5 lg:col-span-2">
                {sampleReviews.map((review) => (
                  <li key={review.name} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-primary">{review.title}</p>
                      <Stars value={review.rating} size={14} />
                    </div>
                    <p className="mt-2 text-body-md text-on-surface-variant">{review.text}</p>
                    <p className="mt-3 text-label-sm text-on-surface-variant/70">
                      {review.name} — {review.date} · Achat vérifié
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Produits associés */}
      {related.length > 0 && (
        <div className="mt-10">
          <SectionHeading
            eyebrow="Dans le même esprit"
            title="Vous aimerez aussi"
            action={
              <Button as={Link} to={`/boutique?categorie=${product.category}`} variant="outline">
                Voir la catégorie
              </Button>
            }
          />
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
