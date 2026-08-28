import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

interface GuardProps {
  children: ReactNode;
}

/** Route réservée aux utilisateurs connectés (client ou admin). */
export function RequireAuth({ children }: GuardProps) {
  const { user } = useStore();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }
  return children;
}

/** Route réservée aux administrateurs. */
export function RequireAdmin({ children }: GuardProps) {
  const { user } = useStore();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
