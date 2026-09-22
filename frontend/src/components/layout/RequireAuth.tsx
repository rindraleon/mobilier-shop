import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthProvider";
import type { UserRole } from "../../types/api";
import FullPageLoader from "../ui/FullPageLoader";
import AccessDenied from "./AccessDenied";

interface GuardProps {
  children: ReactNode;
}

/**
 * Gardes de routing **côté client** (§49).
 *
 * Rappel essentiel : ces gardes ne sont qu'une commodité d'ergonomie. Elles
 * évitent d'afficher une page qui va échouer. La sécurité réelle est
 * exclusivement assurée par les guards NestJS (`JwtAuthGuard`, `RolesGuard`,
 * `SellerStatusGuard`) — contourner le frontend ne donne accès à rien.
 */

/** Toute page nécessitant une session active. */
export function RequireAuth({ children }: GuardProps) {
  const { isAuthenticated, isBooting } = useAuth();
  const location = useLocation();

  // Pendant la restauration de session on ne redirige pas : sinon un simple
  // rechargement sur /espace-client renverrait systématiquement à la connexion.
  if (isBooting) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }
  return <>{children}</>;
}

/** Réserve une route à un ou plusieurs rôles. */
export function RequireRole({ children, roles }: GuardProps & { roles: UserRole[] }) {
  const { isAuthenticated, isBooting, hasRole } = useAuth();
  const location = useLocation();

  if (isBooting) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }
  if (!hasRole(...roles)) return <AccessDenied />;
  return <>{children}</>;
}

/** Espace administrateur. */
export function RequireAdmin({ children }: GuardProps) {
  return <RequireRole roles={["admin"]}>{children}</RequireRole>;
}

/** Espace vendeur : le rôle SELLER ne suffit pas, il faut être approuvé (§10). */
export function RequireSeller({ children }: GuardProps) {
  return <RequireRole roles={["seller"]}>{children}</RequireRole>;
}

/** Combine rôle vendeur **et** statut approuvé. */
export function RequireSellerApproval({ children }: GuardProps) {
  const { isAuthenticated, isBooting, isApprovedSeller, sellerStatus, isAdmin } = useAuth();
  const location = useLocation();

  if (isBooting) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }
  if (isAdmin) return <>{children}</>;
  if (!isApprovedSeller) {
    return <AccessDenied sellerStatus={sellerStatus} />;
  }
  return <>{children}</>;
}

export default RequireAuth;
