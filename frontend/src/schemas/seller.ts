import { z } from "zod";

/** Demande vendeur (`ApplySellerDto`). */
export const sellerApplicationSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(2, "Le nom de la boutique doit contenir au moins 2 caractères.")
    .max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(200).optional().or(z.literal("")),
  addressLine: z.string().trim().max(250).optional().or(z.literal("")),
});

export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
