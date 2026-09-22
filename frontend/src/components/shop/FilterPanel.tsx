import { X } from "lucide-react";
import { useCategories } from "../../hooks/useCatalog";
import { PRICE_RANGES } from "../../utils/constants";
import type { Category } from "../../types/api";

interface FilterPanelProps {
  categorie: string;
  onCategorie: (slug: string) => void;
  priceRanges: string[];
  onPriceRanges: (ids: string[]) => void;
  inStockOnly: boolean;
  onInStockOnly: (value: boolean) => void;
  onReset: () => void;
  /** Compteurs par catégorie renvoyés par l'API (`meta` de la recherche). */
  counts?: Record<string, number>;
  total?: number;
}

export default function FilterPanel({
  categorie,
  onCategorie,
  priceRanges,
  onPriceRanges,
  inStockOnly,
  onInStockOnly,
  onReset,
  counts,
  total,
}: FilterPanelProps) {
  const { data: categories = [] } = useCategories() as {
    data: Category[] | undefined;
  };

  const toggleRange = (id: string): void => {
    onPriceRanges(
      priceRanges.includes(id) ? priceRanges.filter((r) => r !== id) : [...priceRanges, id],
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-headline-sm text-primary">Filtres</h2>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant transition-colors hover:text-secondary"
        >
          <X size={13} /> Réinitialiser
        </button>
      </div>

      <div className="mt-5">
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">Catégorie</p>
        <ul className="mt-3 space-y-1.5">
          <li>
            <button
              onClick={() => onCategorie("toutes")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-body-sm transition-colors ${
                categorie === "toutes"
                  ? "bg-secondary-container font-semibold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Toutes
              {total !== undefined && <span className="text-label-sm">{total}</span>}
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategorie(category.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-body-sm transition-colors ${
                  categorie === category.slug
                    ? "bg-secondary-container font-semibold text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {category.name}
                {counts && counts[category.slug] !== undefined && (
                  <span className="text-label-sm">{counts[category.slug]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">Prix</p>
        <ul className="mt-3 space-y-2">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={priceRanges.includes(range.id)}
                  onChange={() => toggleRange(range.id)}
                  className="h-4 w-4 rounded border-outline-variant accent-secondary"
                />
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-outline-variant accent-secondary"
          />
          En stock uniquement
        </label>
      </div>
    </div>
  );
}
