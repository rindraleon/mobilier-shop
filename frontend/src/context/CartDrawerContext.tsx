import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * État d'UI **pur** du tiroir panier (§82).
 *
 * L'ancien `CartContext` mélangeait les données du panier et son ouverture.
 * Les données vivent désormais sur le serveur (TanStack Query) ; il ne reste
 * ici que l'état d'affichage, qui n'a aucune raison d'être persisté.
 */
interface CartDrawerContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ isOpen, openCart, closeCart, toggleCart }),
    [isOpen, openCart, closeCart, toggleCart],
  );

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer doit être utilisé dans un <CartDrawerProvider>.");
  }
  return ctx;
}
