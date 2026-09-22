import { api } from "./client";
import type { AuthResponse, AuthUser, UserProfile } from "../../types/api";

/** Inscription. Aucun rôle n'est envoyé : le backend force `customer` (§62). */
export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  /** Crée une demande vendeur `PENDING` en même temps que le compte (§14). */
  asSeller?: boolean;
}

export const authApi = {
  register: (input: RegisterInput) =>
    api.post<AuthResponse>("/auth/register", input, { auth: false }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }, { auth: false }),

  /**
   * Rafraîchit la session. Le backend privilégie le cookie httpOnly ; le jeton
   * en mémoire sert de repli si le navigateur le refuse.
   */
  refresh: (refreshToken?: string | null) =>
    api.post<AuthResponse>("/auth/refresh", refreshToken ? { refreshToken } : {}, {
      auth: false,
      skipRefresh: true,
    }),

  logout: (refreshToken?: string | null) =>
    api.post<{ message: string }>("/auth/logout", refreshToken ? { refreshToken } : {}),

  me: () => api.get<AuthUser>("/auth/me"),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }, { auth: false }),
};

export type { AuthResponse, AuthUser, UserProfile };
