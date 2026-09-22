import { z } from "zod";

/**
 * Produit vendeur.
 *
 * Les montants sont des **entiers MGA** : on interdit d'emblée les décimales
 * pour éviter d'envoyer un prix que le serveur rejetterait (§88).
 */
export const productSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(200),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre." })
    .int("Le prix doit être un montant entier en ariary.")
    .min(0, "Le prix ne peut pas être négatif."),
  compareAtPrice: z.coerce
    .number({ invalid_type_error: "Le prix barré doit être un nombre." })
    .int("Le prix barré doit être un montant entier.")
    .min(0)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  stock: z.coerce
    .number({ invalid_type_error: "Le stock doit être un nombre." })
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif."),
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  material: z.string().trim().max(200).optional().or(z.literal("")),
  dimensions: z.string().trim().max(120).optional().or(z.literal("")),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  status: z.enum(["draft", "pending_review", "published", "out_of_stock", "archived"]),
});

export type ProductFormInput = z.infer<typeof productSchema>;
