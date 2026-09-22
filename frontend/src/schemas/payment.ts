import { z } from "zod";
import { PAYMENT_PROVIDERS } from "../utils/constants";

/**
 * Référence de transaction Mobile Money.
 *
 * Les motifs sont **les mêmes** que les validateurs du backend
 * (`mobile-money.providers.ts`), afin qu'une référence acceptée ici ne soit
 * pas refusée après envoi (§27).
 */

export const paymentProviders = ["mvola", "orange_money", "airtel_money"] as const;

export const paymentSchema = z.object({
  provider: z.enum(paymentProviders, {
    errorMap: () => ({ message: "Choisissez un opérateur." }),
  }),
  transactionReference: z
    .string()
    .trim()
    .min(6, "La référence doit contenir au moins 6 caractères.")
    .max(30, "La référence ne doit pas dépasser 30 caractères."),
  payerPhone: z
    .string()
    .trim()
    .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
});

/**
 * Valide la référence pour un opérateur donné.
 * @returns un message d'erreur, ou `null` si la référence est conforme.
 */
export function validateReference(provider: string, reference: string): string | null {
  const meta = PAYMENT_PROVIDERS.find((p) => p.id === provider);
  if (!meta) return "Opérateur inconnu.";

  const cleaned = reference.trim().toUpperCase();
  if (cleaned.length < 6) return "La référence doit contenir au moins 6 caractères.";
  if (cleaned.length > 30) return "La référence ne doit pas dépasser 30 caractères.";
  if (!meta.pattern.test(cleaned)) {
    return `Format attendu pour ${meta.label} : ${meta.hint}`;
  }
  return null;
}

/** Normalise la saisie avant envoi (majuscules, sans espaces ni tirets). */
export function normalizeReference(value: string): string {
  return value.toUpperCase().replace(/[\s-]+/g, "");
}

export type PaymentFormInput = z.infer<typeof paymentSchema>;
