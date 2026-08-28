import { initialProducts } from "./products";
import { initialUsers } from "./users";
import type { Address, Order, OrderItem, OrderStatus, Product, User } from "../types";

const daysAgo = (n: number): string => new Date(Date.now() - n * 86400000).toISOString();
const product = (id: string): Product => initialProducts.find((p) => p.id === id) as Product;
const userOf = (id: string): User => initialUsers.find((u) => u.id === id) as User;

interface MakeOrderOptions {
  shipping?: string;
  payment?: string;
}

function makeOrder(
  id: string,
  userId: string,
  days: number,
  status: OrderStatus,
  lines: [string, number][],
  opts: MakeOrderOptions = {}
): Order {
  const u = userOf(userId);
  const items: OrderItem[] = lines.map(([pid, qty]) => {
    const p = product(pid);
    return { productId: pid, name: p.name, price: p.price, qty, image: p.image };
  });
  const subtotal = +(items.reduce((s, it) => s + it.price * it.qty, 0)).toFixed(2);
  const shippingMethod = opts.shipping || "standard";
  const shippingCost = subtotal >= 300 ? 0 : shippingMethod === "express" ? 14.9 : 4.9;
  const total = +(subtotal + shippingCost).toFixed(2);
  const addr: Address =
    (u.addresses && u.addresses[0]) ||
    {
      fullName: u.name,
      phone: "06 00 00 00 00",
      address: "1 rue des Exemples",
      address2: "",
      postalCode: "69001",
      city: "Lyon",
      country: "France",
    };
  return {
    id,
    userId,
    customerName: u.name,
    customerEmail: u.email,
    items,
    subtotal,
    discount: 0,
    promoCode: null,
    shippingMethod,
    shippingCost,
    paymentMethod: opts.payment || "card",
    status,
    createdAt: daysAgo(days),
    shippingAddress: addr,
    total,
  };
}

export const initialOrders: Order[] = [
  makeOrder("CMD-1001", "u-3", 165, "livree", [["p1", 1]]),
  makeOrder("CMD-1002", "u-4", 150, "livree", [["p4", 1], ["p5", 2]]),
  makeOrder("CMD-1003", "u-client", 140, "livree", [["p2", 1], ["p9", 1]]),
  makeOrder("CMD-1004", "u-5", 128, "annulee", [["p10", 1]]),
  makeOrder("CMD-1005", "u-6", 115, "livree", [["p6", 1]]),
  makeOrder("CMD-1006", "u-client", 96, "livree", [["p7", 1]]),
  makeOrder("CMD-1007", "u-3", 80, "livree", [["p3", 1], ["p12", 1]]),
  makeOrder("CMD-1008", "u-4", 66, "expediee", [["p8", 1]]),
  makeOrder("CMD-1009", "u-6", 52, "livree", [["p2", 2]], { shipping: "express" }),
  makeOrder("CMD-1010", "u-5", 40, "livree", [["p11", 1]]),
  makeOrder("CMD-1011", "u-client", 26, "livree", [["p4", 1]]),
  makeOrder("CMD-1012", "u-3", 14, "expediee", [["p1", 1], ["p9", 2]]),
  makeOrder("CMD-1013", "u-6", 8, "confirmee", [["p5", 4]]),
  makeOrder("CMD-1014", "u-4", 3, "en_attente", [["p10", 1], ["p3", 1]]),
  makeOrder("CMD-1015", "u-client", 1, "confirmee", [["p8", 1], ["p5", 2]]),
];
