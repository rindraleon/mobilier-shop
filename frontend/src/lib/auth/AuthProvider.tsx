import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { authApi, type RegisterInput } from "../api/auth.api";
import { clearTokens, onSessionChange, setTokens } from "../api/client";
import { queryKeys } from "../query/keys";
import type { AuthUser, SellerStatus, UserRole } from "../../types/api";

/* ------------------------------------------------------------------ */
/* Contrat du contexte                                                 */
/* ------------------------------------------------------------------ */

export interface AuthContextValue {
  /** Utilisateur connecté, `null` si anonyme ou session expirée. */
  user: AuthUser | null;
  /** `true` pendant la restauration de session au démarrage. */
  isBooting: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  /** Vendeur **approuvé** : le seul cas autorisé à vendre (§10). */
  isApprovedSeller: boolean;
  sellerStatus: SellerStatus | null;
  hasRole: (...roles: UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Met à jour l'utilisateur en mémoire (après `PATCH /users/me`). */
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Fournisseur                                                         */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const queryClient = useQueryClient();

  
  useEffect(() => {
    let cancelled = false;

    authApi
      .refresh()
      .then((session) => {
        if (cancelled) return;
        setTokens(session);
        // Défensif : une session sans utilisateur équivaut à un visiteur.
        setUserState(session?.user ?? null);
      })
      .catch(() => {
        // Pas de session (visiteur) ou refresh expiré : état anonyme sûr.
        if (!cancelled) clearTokens();
      })
      .finally(() => {
        if (!cancelled) setIsBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(
    () =>
      onSessionChange((token) => {
        if (token) return;
        setUserState(null);
        queryClient.removeQueries({ queryKey: queryKeys.cart.all });
        queryClient.removeQueries({ queryKey: queryKeys.orders.all });
        queryClient.removeQueries({ queryKey: queryKeys.notifications.all });
        queryClient.removeQueries({ queryKey: queryKeys.wishlist.all });
      }),
    [queryClient],
  );

  const setUser = useCallback((next: AuthUser) => setUserState(next), []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const session = await authApi.login(email, password);
      setTokens(session);
      setUserState(session.user);
      // Les données privées de l'utilisateur précédent ne doivent pas fuiter.
      queryClient.clear();
      return session.user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthUser> => {
      const session = await authApi.register(input);
      setTokens(session);
      setUserState(session.user);
      queryClient.clear();
      return session.user;
    },
    [queryClient],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // La déconnexion locale doit réussir même si l'API est injoignable.
    }
    clearTokens();
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    const status = user?.sellerStatus ?? null;
    return {
      user,
      isBooting,
      isAuthenticated: user !== null,
      isAdmin: role === "admin",
      isSeller: role === "seller",
      isApprovedSeller: role === "seller" && status === "approved",
      sellerStatus: status,
      hasRole: (...roles: UserRole[]) => (role ? roles.includes(role) : false),
      login,
      register,
      logout,
      setUser,
    };
  }, [user, isBooting, login, register, logout, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Accès                                                               */
/* ------------------------------------------------------------------ */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  }
  return ctx;
}
