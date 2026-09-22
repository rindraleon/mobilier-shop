import { api, buildQuery } from "./client";
import type {
  CreateProductInput,
  Paginated,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "../../types/api";

export const productsApi = {
  /** Catalogue public : recherche, filtres, tri, pagination (§44, §45). */
  list: (query: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/products" + buildQuery(query)),

  bySlug: (slug: string) => api.get<Product>("/products/" + slug),

  /** [Vendeur approuvé] Créer un produit. Le vendeur vient du JWT (§17). */
  create: (input: CreateProductInput) => api.post<Product>("/products", input),

  update: (id: string, input: UpdateProductInput) =>
    api.patch<Product>("/products/" + id, input),

  /** Soft delete : l'historique des commandes est préservé (§71). */
  remove: (id: string) => api.delete<void>("/products/" + id),

  /** [Vendeur approuvé] Mes produits, tous statuts confondus. */
  mine: (query: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/products/seller/me" + buildQuery(query)),
};
