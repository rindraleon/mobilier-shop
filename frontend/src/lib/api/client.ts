/**
 * Client HTTP centralisé (§51).
 *
 * Exigences couvertes :
 *  - **un seul** point d'appel réseau : aucun `fetch()` ailleurs dans le projet ;
 *  - access token **en mémoire** (jamais dans `localStorage`) ;
 *  - refresh token conservé en mémoire + cookie httpOnly posé par le backend ;
 *  - rafraîchissement automatique et **single-flight** (une seule requête de
 *    refresh même si 10 appels échouent simultanément en 401) ;
 *  - timeout, erreurs typées, annulation.
 *
 * Sécurité (§50) : aucun secret n'est écrit dans `localStorage`/`sessionStorage`.
 * Un rechargement de page rejoue un « silent refresh » via le cookie httpOnly.
 * Si le navigateur refuse le cookie, l'utilisateur est simplement déconnecté —
 * comportement sûr par défaut.
 */

import type { ApiErrorBody, AuthResponse } from "../../types/api";

/** Timeout réseau par défaut (ms). */
const DEFAULT_TIMEOUT = 20_000;

const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "/api";

/* ------------------------------------------------------------------ */
/* Erreur typée                                                        */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  /** Erreurs de validation par champ (422), telles que renvoyées par l'API. */
  readonly fieldErrors: Record<string, string[]>;
  readonly path?: string;

  constructor(body: ApiErrorBody, statusCode: number) {
    const message = Array.isArray(body.message)
      ? body.message.join(" ")
      : body.message || "Une erreur inattendue est survenue.";
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = body.code ?? "UNKNOWN";
    this.fieldErrors = body.errors ?? {};
    this.path = body.path;
  }

  /** Premier message d'erreur pour un champ donné (formulaires). */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  get isValidation(): boolean {
    return this.statusCode === 422 || this.statusCode === 400;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }
}

/** Erreur réseau / timeout : l'API n'a pas répondu. */
export class NetworkError extends Error {
  constructor(message = "Le serveur est injoignable. Vérifiez votre connexion.") {
    super(message);
    this.name = "NetworkError";
  }
}

/* ------------------------------------------------------------------ */
/* Stockage des tokens — mémoire uniquement                            */
/* ------------------------------------------------------------------ */

let accessToken: string | null = null;
/** Seconde vie du refresh token : mémoire (cookie httpOnly = source primaire). */
let refreshToken: string | null = null;

export function setTokens(tokens: Pick<AuthResponse, "accessToken" | "refreshToken">): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function hasStoredRefreshToken(): boolean {
  return refreshToken !== null;
}

/* ------------------------------------------------------------------ */
/* Rafraîchissement                                                    */
/* ------------------------------------------------------------------ */

type RefreshListener = (token: string | null) => void;
const refreshListeners = new Set<RefreshListener>();

/** Permet à l'`AuthProvider` de réagir à une déconnexion provoquée par un 401. */
export function onSessionChange(listener: RefreshListener): () => void {
  refreshListeners.add(listener);
  return () => refreshListeners.delete(listener);
}

function notifySessionChange(token: string | null): void {
  refreshListeners.forEach((listener) => listener(token));
}

/** Promesse de refresh en cours : garantit l'unicité de l'appel (single-flight). */
let refreshInFlight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // le cookie httpOnly est la source de vérité
      headers: {
        "Content-Type": "application/json",
        // Repli si le navigateur bloque le cookie : token gardé en mémoire.
        ...(refreshToken ? {} : {}),
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    if (!response.ok) {
      clearTokens();
      notifySessionChange(null);
      return null;
    }

    const data = (await response.json()) as AuthResponse;
    setTokens(data);
    notifySessionChange(data.accessToken);
    return data.accessToken;
  } catch {
    clearTokens();
    notifySessionChange(null);
    return null;
  }
}

export function refreshSession(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/* ------------------------------------------------------------------ */
/* Construction des requêtes                                           */
/* ------------------------------------------------------------------ */

/** Sérialise des paramètres en supprimant les valeurs vides. */
export function buildQuery(params: object = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") {
      search.set(key, value ? "true" : "false");
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Corps brut (ex. `FormData` pour l'upload de fichiers). */
  body?: BodyInit | null;
  /** Objet sérialisé en JSON. Prioritaire sur `body`. */
  json?: unknown;
  /** Requête authentifiée (défaut : true). */
  auth?: boolean;
  /** Timeout en ms. */
  timeout?: number;
  /** `Idempotency-Key` pour les opérations critiques (§90). */
  idempotencyKey?: string;
  /** Ne pas tenter de rafraîchir le token en cas de 401. */
  skipRefresh?: boolean;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Appel API typé. Lève `ApiError` pour toute réponse en erreur,
 * `NetworkError` si le serveur est injoignable ou la requête expirée.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    json,
    auth = true,
    timeout = DEFAULT_TIMEOUT,
    idempotencyKey,
    skipRefresh = false,
    headers,
    ...rest
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const requestHeaders = new Headers(headers);
  if (json !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth && accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }
  if (idempotencyKey) {
    requestHeaders.set("Idempotency-Key", idempotencyKey);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
      // Nécessaire au cookie httpOnly de refresh (même origine via le proxy).
      credentials: "include",
      body: json !== undefined ? JSON.stringify(json) : (rest.body as BodyInit | undefined),
    });
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new NetworkError("La requête a mis trop de temps. Réessayez.");
    }
    throw new NetworkError();
  }

  clearTimeout(timer);

  /* --- 401 : on tente un refresh puis on rejoue une seule fois (§50) --- */
  if (response.status === 401 && auth && !skipRefresh) {
    const newToken = await refreshSession();
    if (newToken) {
      const retryHeaders = new Headers(requestHeaders);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: retryHeaders,
        credentials: "include",
        body: json !== undefined ? JSON.stringify(json) : (rest.body as BodyInit | undefined),
      });
      const retryBody = await parseBody(retry);
      if (!retry.ok) {
        throw new ApiError(
          (retryBody as ApiErrorBody) ?? { statusCode: retry.status, message: "Erreur" },
          retry.status,
        );
      }
      return retryBody as T;
    }
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      (body as ApiErrorBody) ?? {
        statusCode: response.status,
        message: `Erreur ${response.status}`,
      },
      response.status,
    );
  }

  return body as T;
}

/* ------------------------------------------------------------------ */
/* Raccourcis                                                          */
/* ------------------------------------------------------------------ */

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", json }),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", json }),
  put: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", json }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

export { API_BASE_URL };
