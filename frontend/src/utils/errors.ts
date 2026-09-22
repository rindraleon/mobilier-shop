import { ApiError, NetworkError } from "../lib/api/client";

/**
 * Traduit une erreur technique en message compréhensible (§85).
 * Le message du backend est prioritaire : il est déjà rédigé pour l'utilisateur.
 */
export function errorMessage(error: unknown, fallback = "Une erreur est survenue."): string {
  if (error instanceof ApiError) {
    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return "Veuillez corriger les champs signalés.";
    }
    return error.message || fallback;
  }
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/** Erreur récupérable : l'utilisateur peut réessayer (réseau, 5xx, 429). */
export function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError) return error.statusCode >= 500 || error.statusCode === 429;
  return false;
}
