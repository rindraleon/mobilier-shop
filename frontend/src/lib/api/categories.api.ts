import { api } from "./client";
import type { Category } from "../../types/api";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageObjectKey?: string;
  imageUrl?: string;
  position?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  /** Publiques : aucune authentification requise. */
  /** `GET /categories` renvoie un tableau (vérifié sur l'API). */
  list: () => api.get<Category[]>("/categories?limit=100"),

  bySlug: (slug: string) => api.get<Category>("/categories/" + slug),

  create: (input: CreateCategoryInput) => api.post<Category>("/categories", input),

  update: (id: string, input: Partial<CreateCategoryInput>) =>
    api.patch<Category>("/categories/" + id, input),

  remove: (id: string) => api.delete<void>("/categories/" + id),
};
