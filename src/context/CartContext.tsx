import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "./StoreContext";
import { useToast } from "./ToastContext";
import type { Product } from "../types";

/* ------------------------------------------------------------------ */
/* Types du contexte panier & favoris                                  */
/* ------------------------------------------------------------------ */

export interface CartItem {
  id: string;
  qty: number;
}

export interface DetailedCartItem extends CartItem {
  product: Product;
}

export interface AppliedPromo {
  code: string;
  rate: number;
}

export interface CartContextValue {
  items: CartItem[];
  detailedItems: DetailedCartItem[];
  subtotal: number;
  cartCount: number;
  addToCart: (productId: string, qty?: number) => boolean;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  wishlist: string[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useStore();
  const { toast } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => load("anti_cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => load("anti_wishlist", []));
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  useEffect(() => save("anti_cart", items), [items]);
  useEffect(() => save("anti_wishlist", wishlist), [wishlist]);

  const detailedItems = useMemo<DetailedCartItem[]>(
    () =>
      items
        .map((it) => {
          const product = products.find((p) => p.id === it.id);
          return product ? { ...it, product } : null;
        })
        .filter((x): x is DetailedCartItem => x !== null),
    [items, products]
  );

  const subtotal = useMemo<number>(
    () => +detailedItems.reduce((sum, it) => sum + it.product.price * it.qty, 0).toFixed(2),
    [detailedItems]
  );

  const cartCount = useMemo<number>(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);

  const addToCart = (productId: string, qty = 1): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    if (product.stock <= 0) {
      toast("Ce produit est en rupture de stock.", "error");
      return false;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === productId);
      const currentQty = existing ? existing.qty : 0;
      const newQty = Math.min(currentQty + qty, product.stock);
      if (newQty === currentQty) {
        toast(`Stock maximum atteint pour ${product.name}.`, "warning");
        return prev;
      }
      return existing
        ? prev.map((i) => (i.id === productId ? { ...i, qty: newQty } : i))
        : [...prev, { id: productId, qty: newQty }];
    });
    toast(`${product.name} a été ajouté au panier.`);
    return true;
  };

  const updateQty = (productId: string, qty: number): void => {
    const product = products.find((p) => p.id === productId);
    const max = product ? product.stock : 99;
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, qty: Math.max(1, Math.min(qty, max)) } : i))
    );
  };

  const removeFromCart = (productId: string): void => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    toast("Article retiré du panier.", "info");
  };

  const clearCart = () => setItems([]);

  const isWishlisted = (productId: string): boolean => wishlist.includes(productId);

  const toggleWishlist = (productId: string): void => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        toast(`${product ? product.name : "L'article"} a été retiré de vos favoris.`, "info");
        return prev.filter((id) => id !== productId);
      }
      toast(`${product ? product.name : "L'article"} a été ajouté à vos favoris.`);
      return [...prev, productId];
    });
  };

  const value: CartContextValue = {
    items,
    detailedItems,
    subtotal,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    wishlist,
    wishlistCount: wishlist.length,
    isWishlisted,
    toggleWishlist,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
