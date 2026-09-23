import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../../hooks/useCatalog";
import { PRICE_RANGES, SORT_OPTIONS } from "../../utils/constants";
import ProductCard from "../../components/product/ProductCard";
import FilterPanel from "../../components/shop/FilterPanel";
import EmptyState from "../../components/ui/EmptyState";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import PageLoader from "../../components/ui/PageLoader";
import { Select } from "../../components/ui/Form";
import Reveal from "../../components/ui/Reveal";
import type { ProductSort } from "../../types/api";

const PER_PAGE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const q = searchParams.get("q") ?? "";
  const categorie = searchParams.get("categorie") ?? "toutes";
  const sort = (searchParams.get("tri") ?? "newest") as ProductSort;

  const setParam = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "toutes") next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
    setPage(1);
  };

  
  const priceBounds = useMemo(() => {
    if (priceRanges.length === 0) return {};
    const selected = PRICE_RANGES.filter((r) => priceRanges.includes(r.id));
    return {
      minPrice: Math.min(...selected.map((r) => r.min)),
      maxPrice: Math.max(...selected.map((r) => r.max)),
    };
  }, [priceRanges]);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProducts({
    page,
    limit: PER_PAGE,
    search: q || undefined,
    category: categorie !== "toutes" ? categorie : undefined,
    availability: inStockOnly || undefined,
    sort,
    ...priceBounds,
  });

  const products = data?.items ?? [];
  const meta = data?.meta;

  const resetFilters = (): void => {
    setSearchParams({}, { replace: true });
    setPriceRanges([]);
    setInStockOnly(false);
    setPage(1);
  };

  const activeFilterCount =
    (categorie !== "toutes" ? 1 : 0) + priceRanges.length + (inStockOnly ? 1 : 0) + (q ? 1 : 0);

  const panel = (mobile = false) => (
    <FilterPanel
      categorie={categorie}
      onCategorie={(slug) => {
        setParam("categorie", slug);
        if (mobile) setFiltersOpen(false);
      }}
      priceRanges={priceRanges}
      onPriceRanges={(ids) => {
        setPriceRanges(ids);
        setPage(1);
      }}
      inStockOnly={inStockOnly}
      onInStockOnly={(value) => {
        setInStockOnly(value);
        setPage(1);
      }}
      onReset={() => {
        resetFilters();
        if (mobile) setFiltersOpen(false);
      }}
      total={meta?.total}
    />
  );

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Boutique" }]} />

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-display-md text-primary">La Boutique</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Tout notre mobilier, réuni en un seul endroit.
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

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">{panel()}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-primary">{meta?.total ?? 0}</strong> produit
              {(meta?.total ?? 0) > 1 ? "s" : ""}
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
                onChange={(e) => setParam("tri", e.target.value)}
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

          {isLoading ? (
            <div className="py-16">
              <PageLoader label="Chargement du catalogue…" />
            </div>
          ) : isError ? (
            <EmptyState
              icon={PackageSearch}
              title="Impossible de charger le catalogue"
              text={error instanceof Error ? error.message : "Une erreur est survenue."}
              actionLabel="Réessayer"
              onAction={() => void refetch()}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Aucun produit trouvé"
              text="Essayez d'ajuster vos filtres ou d'élargir votre recherche."
              actionLabel="Réinitialiser les filtres"
              onAction={resetFilters}
            />
          ) : (
            <>
              <div
                className={`grid grid-cols-2 gap-4 transition-opacity md:gap-6 xl:grid-cols-3 ${
                  isPlaceholderData ? "opacity-60" : ""
                }`}
              >
                {products.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 5) * 0.06}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>

              {meta && (
                <Pagination
                  className="mt-10"
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  onPageChange={(next) => {
                    setPage(next);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres" size="sm">
        {panel(true)}
      </Modal>
    </div>
  );
}
