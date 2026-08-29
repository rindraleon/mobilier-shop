import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { collections } from "../../data/collections";
import { categories } from "../../data/products";
import { PRICE_RANGES, SORT_OPTIONS } from "../../utils/constants";
import ProductCard from "../../components/product/ProductCard";
import FilterPanel from "../../components/shop/FilterPanel";
import EmptyState from "../../components/ui/EmptyState";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Modal from "../../components/ui/Modal";
import { Select } from "../../components/ui/Form";
import Reveal from "../../components/ui/Reveal";

export default function Shop() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("recommande");
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const q = searchParams.get("q") || "";
  const categorie = searchParams.get("categorie") || "toutes";
  const collectionSlug = searchParams.get("collection") || "";
  const collection = collections.find((c) => c.slug === collectionSlug) ?? null;

  const setParam = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "toutes") next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const baseList = useMemo(() => {
    let list = [...products];
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(needle));
    }
    if (collection) list = list.filter((p) => collection.productIds.includes(p.id));
    return list;
  }, [products, q, collection]);

  const counts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = { total: baseList.length };
    categories.forEach((c) => {
      map[c.id] = baseList.filter((p) => p.category === c.id).length;
    });
    return map;
  }, [baseList]);

  const filtered = useMemo(() => {
    let list = [...baseList];
    if (categorie !== "toutes") list = list.filter((p) => p.category === categorie);
    if (priceRanges.length) {
      list = list.filter((p) =>
        priceRanges.some((id) => {
          const range = PRICE_RANGES.find((r) => r.id === id);
          return range ? p.price >= range.min && p.price < range.max : false;
        })
      );
    }
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    switch (sort) {
      case "prix-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "prix-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "nouveautes":
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "note":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [baseList, categorie, priceRanges, inStockOnly, sort]);

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
    setPriceRanges([]);
    setInStockOnly(false);
    setSort("recommande");
  };

  const activeFilterCount =
    (categorie !== "toutes" ? 1 : 0) +
    (collection ? 1 : 0) +
    priceRanges.length +
    (inStockOnly ? 1 : 0) +
    (q ? 1 : 0);

  const panel = (mobile = false) => (
    <FilterPanel
      categorie={categorie}
      onCategorie={(c) => {
        setParam("categorie", c);
        if (mobile) setFiltersOpen(false);
      }}
      priceRanges={priceRanges}
      onPriceRanges={setPriceRanges}
      inStockOnly={inStockOnly}
      onInStockOnly={setInStockOnly}
      counts={counts}
      total={counts.total}
      onReset={() => {
        resetFilters();
        if (mobile) setFiltersOpen(false);
      }}
    />
  );

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Boutique" }]} />

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-display-md text-primary">{collection ? collection.name : "La Boutique"}</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            {collection ? collection.description : "Tout notre mobilier, réuni en un seul endroit."}
          </p>
        </div>
        {(q || activeFilterCount > 0) && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-outline-variant px-4 py-2 text-body-sm text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary"
          >
            <X size={14} /> Effacer les filtres {q && `(recherche : « ${q} »)`}
          </button>
        )}
      </div>

      {collection && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-secondary/30 bg-secondary-container/40 px-5 py-3.5">
          <p className="text-body-sm text-on-secondary-container">
            Collection : <strong>{collection.name}</strong> — {collection.tagline}
          </p>
          <button
            onClick={() => setParam("collection", "")}
            aria-label="Retirer le filtre collection"
            className="rounded-md p-1.5 text-on-secondary-container hover:bg-white/50"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">{panel()}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-primary">{filtered.length}</strong> produit{filtered.length > 1 ? "s" : ""}{" "}
              {filtered.length > 1 ? "trouvés" : "trouvé"}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-body-sm font-medium text-on-background lg:hidden"
              >
                <SlidersHorizontal size={16} /> Filtres
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-on-secondary">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Trier les produits"
                className="w-48"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    Tri : {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Aucun produit trouvé"
              text="Essayez d'ajuster vos filtres ou d'élargir votre recherche."
              actionLabel="Réinitialiser les filtres"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 5) * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres" size="sm">
        {panel(true)}
      </Modal>
    </div>
  );
}
