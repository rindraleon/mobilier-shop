import { z } from "zod";

/**
 * Validation frontend (§53).
 *
 * Ces règles **doublent** celles du backend, elles ne les remplacent pas :
 * elles servent à donner un retour immédiat à l'utilisateur. Toute règle
 * métier contraignante est également appliquée côté serveur
 * (`class-validator` + `ValidationPipe`), seul endroit digne de confiance.
 */

/** Mêmes contraintes que `RegisterDto` (min 8, au moins une lettre et un chiffre). */
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.");

export const loginSchema = z.object({
  email: z.string().min(1, "L'adresse e-mail est requise.").email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prénom est requis.").max(120),
    lastName: z.string().trim().min(1, "Le nom est requis.").max(120),
    email: z.string().min(1, "L'adresse e-mail est requise.").email("Adresse e-mail invalide."),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
    /** Créer une demande vendeur en même temps que le compte (§14). */
    asSeller: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'adresse e-mail est requise.").email("Adresse e-mail invalide."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel."),
    // `ChangePasswordDto` exige 10 caractères minimum côté serveur.
    newPassword: z
      .string()
      .min(10, "Le nouveau mot de passe doit contenir au moins 10 caractères.")
      .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
      .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre."),
    confirmPassword: z.string().min(1, "Confirmez le nouveau mot de passe."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(120),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(120),
  email: z.string().min(1, "L'adresse e-mail est requise.").email("Adresse e-mail invalide."),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ().-]*$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>;
export type ProfileFormInput = z.infer<typeof profileSchema>;
