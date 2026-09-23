import type { CartItem, Product } from "../types/api";

export function productImageUrl(product: {
  images?: { url?: string | null; isPrimary?: boolean; sortOrder?: number }[];
  imageUrl?: string | null;
}): string | null {
  if (product.images && product.images.length > 0) {
    const sorted = [...product.images].sort(
      (a, b) => Number(b.isPrimary ?? false) - Number(a.isPrimary ?? false) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const primary = sorted.find((img) => img.url);
    if (primary?.url) return primary.url;
  }
  return product.imageUrl ?? null;
}

/** Le produit peut être ajouté au panier. */
export function isPurchasable(product: Pick<Product, "status" | "stock">): boolean {
  return product.status === "published" && product.stock > 0;
}

/** Stock faible au regard du seuil produit (§70). */
export function isLowStock(stock: number, threshold = 5): boolean {
  return stock > 0 && stock <= threshold;
}

/** `numeric` PostgreSQL est sérialisé en chaîne : on normalise. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Total indicatif du panier, calculé côté client pour l'affichage uniquement. */
export function cartSubtotal(items: CartItem[]): number {
  return items
    .filter((item) => item.available)
    .reduce((sum, item) => sum + item.lineTotal, 0);
}
