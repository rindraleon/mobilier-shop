import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeOff, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useSellerProducts, useDeleteProduct } from "../../hooks/useSeller";
import { PRODUCT_STATUS } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import { productImageUrl } from "../../utils/product";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Select } from "../../components/ui/Form";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../utils/errors";
import type { Product, ProductStatus } from "../../types/api";

export default function SellerProducts() {
  const { toast } = useToast();
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<ProductStatus | "">("");
  const { data, isLoading, isError, refetch, isPlaceholderData } = useSellerProducts({
    page,
    limit: 10,
    status: status || undefined,
  });
  const deleteProduct = useDeleteProduct();
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const products = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Mes produits</h1>
        <div className="flex items-center gap-3">
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
          <Button as={Link} to="/vendeur/produits/nouveau" size="sm">
            <Plus size={16} /> Nouveau
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement de vos produits…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger vos produits"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="Aucun produit"
            text="Créez votre premier produit pour le publier dans la boutique."
            actionLabel="Créer un produit"
            actionTo="/vendeur/produits/nouveau"
          />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[720px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Prix</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
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
                            <span className="block truncate font-semibold text-primary">
                              {product.name}
                            </span>
                            <span className="block truncate text-label-sm text-on-surface-variant">
                              {product.sku ?? "—"}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={product.stock <= product.lowStockThreshold ? "text-amber-700" : ""}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge kind="product" status={product.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            to={"/vendeur/produits/" + product.id}
                            aria-label={"Modifier " + product.name}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <Pencil size={16} />
                          </Link>
                          {product.status === "published" && (
                            <Link
                              to={"/boutique/" + product.slug}
                              aria-label={"Voir " + product.name + " dans la boutique"}
                              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            >
                              <EyeOff size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => setToDelete(product)}
                            aria-label={"Supprimer " + product.name}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </span>
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

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteProduct.mutate(toDelete.id, {
            onError: (error: unknown) => toast(errorMessage(error), "error"),
          });
          setToDelete(null);
        }}
        title="Supprimer le produit"
        message="Le produit sera archivé. L'historique des commandes reste consultable."
        confirmLabel="Archiver"
      />
    </div>
  );
}
