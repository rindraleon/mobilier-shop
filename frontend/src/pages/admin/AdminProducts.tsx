import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Search } from "lucide-react";
import { useAdminProducts } from "../../hooks/useAdmin";
import { PRODUCT_STATUS } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import { productImageUrl } from "../../utils/product";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import { Input, Select } from "../../components/ui/Form";
import type { ProductStatus } from "../../types/api";

export default function AdminProducts() {
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [search, setSearch] = useState<string>("");
  const [term, setTerm] = useState<string>("");

  const { data, isLoading, isError, refetch, isPlaceholderData } = useAdminProducts({
    page,
    limit: 10,
    status: status || undefined,
    search: term || undefined,
  });

  const products = data?.items ?? [];

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Produits</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Catalogue multi-vendeurs. Un produit publié par un vendeur non approuvé est impossible.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(search);
          setPage(1);
        }}
        className="mt-5 flex flex-wrap gap-3"
      >
        <span className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit, un vendeur…"
            className="pl-9"
            aria-label="Rechercher"
          />
        </span>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ProductStatus | "");
            setPage(1);
          }}
          aria-label="Filtrer par statut"
          className="w-48"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(PRODUCT_STATUS).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
      </form>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des produits…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger les produits"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Package} title="Aucun produit" text="Aucun produit ne correspond." />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[860px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Vendeur</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Prix</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container-high bg-surface-container-lowest ${isPlaceholderData ? "opacity-60" : ""}`}>
                {products.map((product) => {
                  const image = productImageUrl(product);
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-surface-container">
                            {image ? (
                              <img src={image} alt={product.name} className="h-full w-full object-cover" />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <Link
                              to={"/boutique/" + product.slug}
                              className="block truncate font-semibold text-primary hover:text-secondary"
                            >
                              {product.name}
                            </Link>
                            <span className="block truncate text-label-sm text-on-surface-variant">
                              {product.sku ?? "—"}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {product.seller?.shopName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        <StatusBadge kind="product" status={product.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data?.meta && (
            <Pagination
              className="mt-6"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
