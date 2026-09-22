import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../lib/api/categories.api";
import { productsApi } from "../lib/api/products.api";
import { queryKeys } from "../lib/query/keys";
import type { Paginated, Product, ProductQuery } from "../types/api";

/** Catégories (publiques, peu volatiles → cache long). */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60_000,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ""),
    queryFn: () => categoriesApi.bySlug(slug as string),
    enabled: Boolean(slug),
  });
}

/** Catalogue public : recherche, filtres, tri, pagination (§44, §45). */
export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productsApi.list(query),
    // Garde les pages précédentes affichées pendant le chargement (pagination fluide).
    placeholderData: (previous) => previous,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(slug ?? ""),
    queryFn: () => productsApi.bySlug(slug as string),
    enabled: Boolean(slug),
  });
}

/** Produits mis en avant pour la page d'accueil. */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.list({ featured: true, limit }),
    queryFn: () => productsApi.list({ featured: true, limit, sort: "newest" }),
    select: (data: Paginated<Product>) => data.items,
    staleTime: 2 * 60_000,
  });
}

export function useNewProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.list({ limit, sort: "newest" }),
    queryFn: () => productsApi.list({ limit, sort: "newest" }),
    select: (data: Paginated<Product>) => data.items,
    staleTime: 2 * 60_000,
  });
}
