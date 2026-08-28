import type { Dispatch, SetStateAction } from "react";
import { RotateCcw } from "lucide-react";
import { categories } from "../../data/products";
import { PRICE_RANGES } from "../../utils/constants";
import { Checkbox } from "../ui/Form";

interface FilterPanelProps {
  categorie: string;
  onCategorie: (categorie: string) => void;
  priceRanges: string[];
  onPriceRanges: Dispatch<SetStateAction<string[]>>;
  inStockOnly: boolean;
  onInStockOnly: Dispatch<SetStateAction<boolean>>;
  counts: Record<string, number>;
  total: number;
  onReset: () => void;
}

/**
 * Panneau de filtres réutilisable (desktop + mobile).
 */
export default function FilterPanel({
  categorie,
  onCategorie,
  priceRanges,
  onPriceRanges,
  inStockOnly,
  onInStockOnly,
  counts,
  total,
  onReset,
}: FilterPanelProps) {
  const togglePrice = (id: string): void =>
    onPriceRanges((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-display text-headline-sm text-primary">Catégories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategorie("toutes")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-body-sm transition-colors ${
                categorie === "toutes"
                  ? "bg-secondary-container font-semibold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Toutes les catégories <span className="text-label-sm opacity-70">{total}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onCategorie(cat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-body-sm transition-colors ${
                  categorie === cat.id
                    ? "bg-secondary-container font-semibold text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat.name} <span className="text-label-sm opacity-70">{counts[cat.id] || 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-display text-headline-sm text-primary">Prix</h3>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((range) => (
            <Checkbox
              key={range.id}
              label={range.label}
              checked={priceRanges.includes(range.id)}
              onChange={() => togglePrice(range.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-headline-sm text-primary">Disponibilité</h3>
        <Checkbox
          label="En stock uniquement"
          checked={inStockOnly}
          onChange={(e) => onInStockOnly(e.target.checked)}
        />
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-body-sm font-medium text-secondary transition-colors hover:underline"
      >
        <RotateCcw size={14} /> Réinitialiser les filtres
      </button>
    </div>
  );
}
