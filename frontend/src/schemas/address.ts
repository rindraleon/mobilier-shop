import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(60).optional().or(z.literal("")),
  fullName: z.string().trim().min(1, "Le nom du destinataire est requis.").max(160),
  phone: z
    .string()
    .trim()
    .min(4, "Le numéro de téléphone est requis.")
    .max(40)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide."),
  addressLine1: z.string().trim().min(1, "L'adresse est requise.").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().min(1, "La ville est requise.").max(120),
  country: z.string().trim().min(1, "Le pays est requis.").max(120),
  isDefault: z.boolean().optional(),
});

export type AddressFormInput = z.infer<typeof addressSchema>;

export const emptyAddress: AddressFormInput = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "Madagascar",
  isDefault: false,
};
