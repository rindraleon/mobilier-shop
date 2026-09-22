import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProducts } from "../../hooks/useCatalog";
import { formatPrice } from "../../utils/format";
import { productImageUrl } from "../../utils/product";
import PageLoader from "../ui/PageLoader";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Recherche plein écran : délégation au moteur de filtrage serveur (§45). */
export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [term, setTerm] = useState<string>("");
  // Requête envoyée uniquement à partir de 2 caractères.
  const { data, isFetching } = useProducts(
    term.trim().length >= 2 ? { search: term.trim(), limit: 6 } : { limit: 0 },
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const results = data?.items ?? [];
  const searching = term.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label="Recherche">
      <div className="absolute inset-0 bg-on-background/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative mx-auto mt-0 w-full max-w-3xl animate-slide-down bg-surface-container-lowest shadow-card-hover sm:mt-16 sm:rounded-xl">
        <div className="flex items-center gap-3 border-b border-surface-container-highest px-5 py-4">
          <Search size={20} className="shrink-0 text-on-surface-variant" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Rechercher un canapé, une table, un fauteuil…"
            aria-label="Rechercher un produit"
            className="w-full bg-transparent text-body-lg text-on-background outline-none placeholder:text-on-surface-variant/60"
          />
          <button onClick={onClose} aria-label="Fermer la recherche" className="rounded-lg p-1.5 hover:bg-surface-container">
            <X size={20} />
          </button>
        </div>

        <div className="thin-scroll max-h-[60vh] overflow-y-auto p-3">
          {!searching ? (
            <p className="px-3 py-8 text-center text-body-sm text-on-surface-variant">
              Saisissez au moins 2 caractères pour lancer la recherche.
            </p>
          ) : isFetching && results.length === 0 ? (
            <div className="py-10">
              <PageLoader label="Recherche…" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-body-sm text-on-surface-variant">
              Aucun produit ne correspond à « {term} ».
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((product) => {
                const image = productImageUrl(product);
                return (
                  <li key={product.id}>
                    <Link
                      to={"/boutique/" + product.slug}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-surface-container"
                    >
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container">
                        {image ? (
                          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-semibold text-primary">
                          {product.name}
                        </span>
                        <span className="block text-label-sm text-on-surface-variant">
                          {product.category?.name}
                          {product.seller?.shopName ? ` · ${product.seller.shopName}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-body-sm font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {searching && results.length > 0 && (
            <Link
              to={"/boutique?q=" + encodeURIComponent(term.trim())}
              onClick={onClose}
              className="mt-2 block rounded-lg bg-surface-container px-3 py-3 text-center text-body-sm font-semibold text-secondary hover:bg-secondary-container"
            >
              Voir tous les résultats pour « {term} »
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
