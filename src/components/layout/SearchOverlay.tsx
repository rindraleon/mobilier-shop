import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { categoryName, formatPrice } from "../../utils/format";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { products } = useStore();
  const [query, setQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = query.trim().toLowerCase();
  const results =
    trimmed.length >= 2
      ? products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(trimmed)).slice(0, 6)
      : [];

  const submit = (e?: SyntheticEvent) => {
    e?.preventDefault();
    if (!trimmed) return;
    navigate(`/boutique?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Recherche">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 bg-surface-container-lowest shadow-card-hover animate-slide-down">
        <div className="container-app py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-headline-sm text-primary">Rechercher un produit</h2>
            <button
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => submit(e)}>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Canapé, table, lampe…"
                className="input-field h-14 rounded-xl pl-12 pr-28 text-body-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary transition-colors hover:bg-secondary"
              >
                Rechercher
              </button>
            </div>
          </form>

          {trimmed.length >= 2 && (
            <div className="mt-5">
              {results.length === 0 ? (
                <p className="py-6 text-center text-body-md text-on-surface-variant">
                  Aucun résultat pour « {query.trim()} ».
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-surface-container-highest">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/boutique/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 py-3 transition-colors hover:bg-surface-container-low"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-14 w-12 rounded-md object-cover"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-md font-medium text-primary">{p.name}</p>
                            <p className="text-label-sm text-on-surface-variant">{categoryName(p.category)}</p>
                          </div>
                          <span className="shrink-0 text-body-sm font-semibold text-secondary">
                            {formatPrice(p.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => submit()}
                    className="mt-3 flex items-center gap-1.5 text-body-sm font-semibold text-secondary hover:underline"
                  >
                    Voir tous les résultats <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
