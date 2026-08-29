import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { initialProducts } from "../data/products";
import { initialUsers } from "../data/users";
import { initialOrders } from "../data/orders";
import type { Address, Order, OrderItem, Product, ProductDraft, User } from "../types";
import { PROMO_CODES, SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from "../utils/constants";
import { slugify } from "../utils/format";

/* ------------------------------------------------------------------ */
/* Types du contexte global (données boutique, auth, commandes)        */
/* ------------------------------------------------------------------ */

export type AuthResult = { ok: true; user?: User } | { ok: false; error: string };
export type PromoResult = { ok: true; code: string; rate: number } | { ok: false; error: string };

export interface PlaceOrderPayload {
  items: { productId: string; qty: number }[];
  shippingAddress: Address;
  shippingMethod: string;
  paymentMethod: string;
  promoCode: string | null;
  userId: string;
  customerName: string;
  customerEmail: string;
}

export interface StoreContextValue {
  products: Product[];
  users: User[];
  orders: Order[];
  user: User | null;
  productById: (id: string) => Product | null;
  login: (email: string, password: string) => AuthResult;
  register: (data: { name: string; email: string; password: string }) => AuthResult;
  logout: () => void;
  addProduct: (draft: ProductDraft) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (payload: PlaceOrderPayload) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateProfile: (userId: string, data: { name: string; email: string }) => AuthResult;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => AuthResult;
  saveAddress: (userId: string, address: Address, addressId?: string | null) => Address | undefined;
  deleteAddress: (userId: string, addressId: string) => void;
  setDefaultAddress: (userId: string, addressId: string) => void;
  validatePromo: (code: string) => PromoResult;
}

const StoreContext = createContext<StoreContextValue | null>(null);

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

const nextOrderId = (orders: Order[]): string => {
  const max = orders.reduce(
    (m, o) => Math.max(m, parseInt(String(o.id).replace(/\D/g, ""), 10) || 0),
    1000
  );
  return `CMD-${max + 1}`;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => load("anti_products", initialProducts));
  const [users, setUsers] = useState<User[]>(() => load("anti_users", initialUsers));
  const [orders, setOrders] = useState<Order[]>(() => load("anti_orders", initialOrders));
  const [sessionId, setSessionId] = useState<string | null>(() => load<string | null>("anti_session", null));

  useEffect(() => save("anti_products", products), [products]);
  useEffect(() => save("anti_users", users), [users]);
  useEffect(() => save("anti_orders", orders), [orders]);
  useEffect(() => save("anti_session", sessionId), [sessionId]);

  const user = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);
  const productById = useMemo(
    () => (id: string): Product | null => products.find((p) => p.id === id) ?? null,
    [products]
  );

  /* ---------- Authentification ---------- */
  const login = (email: string, password: string): AuthResult => {
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "Aucun compte n'est associé à cet email." };
    if (found.password !== password) return { ok: false, error: "Mot de passe incorrect." };
    setSessionId(found.id);
    return { ok: true, user: found };
  };

  const register = ({ name, email, password }: { name: string; email: string; password: string }): AuthResult => {
    const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { ok: false, error: "Cet email est déjà utilisé." };
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "client",
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setSessionId(newUser.id);
    return { ok: true, user: newUser };
  };

  const logout = () => setSessionId(null);

  /* ---------- Produits (admin) ---------- */
  const addProduct = (draft: ProductDraft): Product => {
    let slug = slugify(draft.name) || `produit-${Date.now()}`;
    if (products.some((p) => p.slug === slug)) slug = `${slug}-2`;
    const product: Product = {
      ...draft,
      id: `p-${Date.now()}`,
      slug,
      rating: 4.5,
      reviews: 0,
      oldPrice: draft.oldPrice || null,
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  };

  const updateProduct = (id: string, patch: Partial<Product>): void =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const deleteProduct = (id: string): void => setProducts((prev) => prev.filter((p) => p.id !== id));

  /* ---------- Commandes ---------- */
  const placeOrder = (payload: PlaceOrderPayload): Order => {
    const items: OrderItem[] = payload.items.flatMap(({ productId, qty }) => {
      const p = products.find((x) => x.id === productId);
      return p ? [{ productId, name: p.name, price: p.price, qty, image: p.image }] : [];
    });
    const subtotal = +items.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2);
    const rate = payload.promoCode ? PROMO_CODES[payload.promoCode] || 0 : 0;
    const discount = +(subtotal * rate).toFixed(2);
    const method = SHIPPING_METHODS.find((m) => m.id === payload.shippingMethod) ?? SHIPPING_METHODS[0];
    const shippingCost = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
    const total = +(subtotal - discount + shippingCost).toFixed(2);
    const order: Order = {
      id: nextOrderId(orders),
      createdAt: new Date().toISOString(),
      status: "en_attente",
      ...payload,
      items,
      subtotal,
      discount,
      promoCode: rate ? payload.promoCode : null,
      shippingMethod: method.id,
      shippingCost,
      total,
    };
    setOrders((prev) => [order, ...prev]);
    // Décrément du stock
    setProducts((prev) =>
      prev.map((p) => {
        const it = items.find((i) => i.productId === p.id);
        return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
      })
    );
    return order;
  };

  const updateOrderStatus = (id: string, status: Order["status"]): void =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  /* ---------- Profil client ---------- */
  const updateProfile = (userId: string, { name, email }: { name: string; email: string }): AuthResult => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "Utilisateur introuvable." };
    if (
      users.some((u) => u.id !== userId && u.email.toLowerCase() === email.trim().toLowerCase())
    ) {
      return { ok: false, error: "Cet email est déjà utilisé par un autre compte." };
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, name: name.trim(), email: email.trim().toLowerCase() } : u
      )
    );
    return { ok: true };
  };

  const changePassword = (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): AuthResult => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { ok: false, error: "Utilisateur introuvable." };
    if (target.password !== currentPassword) {
      return { ok: false, error: "Mot de passe actuel incorrect." };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères." };
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)));
    return { ok: true };
  };

  const saveAddress = (
    userId: string,
    address: Address,
    addressId: string | null = null
  ): Address | undefined => {
    let saved: Address | undefined;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (addressId) {
          const addresses = u.addresses.map((a) => (a.id === addressId ? { ...a, ...address } : a));
          saved = addresses.find((a) => a.id === addressId);
          return { ...u, addresses };
        }
        const newAddress: Address = { ...address, id: `a-${Date.now()}` };
        saved = newAddress;
        return { ...u, addresses: [...u.addresses, newAddress] };
      })
    );
    return saved;
  };

  const deleteAddress = (userId: string, addressId: string): void =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, addresses: u.addresses.filter((a) => a.id !== addressId) } : u
      )
    );

  const setDefaultAddress = (userId: string, addressId: string): void =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })) }
          : u
      )
    );

  /* ---------- Codes promo ---------- */
  const validatePromo = (code: string): PromoResult => {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return { ok: false, error: "Saisissez un code." };
    const rate = PROMO_CODES[normalized];
    if (!rate) return { ok: false, error: "Ce code promo est invalide ou expiré." };
    return { ok: true, code: normalized, rate };
  };

  const value: StoreContextValue = {
    products,
    users,
    orders,
    user,
    productById,
    login,
    register,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    placeOrder,
    updateOrderStatus,
    updateProfile,
    changePassword,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    validatePromo,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore doit être utilisé dans un StoreProvider");
  return ctx;
}
