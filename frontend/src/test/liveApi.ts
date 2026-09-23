

/** Origine du backend de test. Surchargeable via `VITE_E2E_API`. */
export const API_ORIGIN: string =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.VITE_E2E_API ?? "http://127.0.0.1:3000";

/* ------------------------------------------------------------------ */
/* Jar de cookies (le refresh token vit dans un cookie httpOnly)        */
/* ------------------------------------------------------------------ */

export class CookieJar {
  private readonly jar = new Map<string, string>();

  /** Récupère les `Set-Cookie` d'une réponse. */
  absorb(response: Response): void {
    const headers = response.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const cookies =
      typeof headers.getSetCookie === "function"
        ? headers.getSetCookie()
        : ([headers.get("set-cookie")].filter((v): v is string => Boolean(v)));

    for (const cookie of cookies) {
      const [pair] = cookie.split(";");
      if (!pair) continue;
      const index = pair.indexOf("=");
      if (index <= 0) continue;
      this.jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }

  /** En-tête `Cookie` à renvoyer, ou `null` si le jar est vide. */
  get header(): string | null {
    if (this.jar.size === 0) return null;
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

/* ------------------------------------------------------------------ */
/* fetch « navigateur » : URLs relatives + cookies                      */
/* ------------------------------------------------------------------ */

export interface LiveFetchHandle {
  /** Requêtes observées : `"POST /api/payments/orders/…"`. */
  calls: string[];
  restore: () => void;
}

export function installLiveFetch(jar: CookieJar): LiveFetchHandle {
  const original = globalThis.fetch;
  const calls: string[] = [];

  const live = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const absolute = raw.startsWith("/") ? API_ORIGIN + raw : raw;

    const headers = new Headers(init?.headers);
    const cookie = jar.header;
    if (cookie) headers.set("cookie", cookie);

    calls.push(`${(init?.method ?? "GET").toUpperCase()} ${absolute}`);

    return original(absolute, { ...init, headers }).then((response) => {
      jar.absorb(response);
      return response;
    });
  };

  globalThis.fetch = live;
  if (typeof window !== "undefined") {
    window.fetch = live;
  }

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
      if (typeof window !== "undefined") {
        window.fetch = original;
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* Sonde de disponibilité                                              */
/* ------------------------------------------------------------------ */

/** `true` si le backend répond (utilisé par `describe.skipIf`). */
export async function isApiUp(): Promise<boolean> {
  if (typeof globalThis.fetch !== "function") return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1_500);
    const response = await fetch(`${API_ORIGIN}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Préparation du jeu d'essai                                          */
/* ------------------------------------------------------------------ */

export interface OrderFixture {
  orderId: string;
  orderNumber: string;
  total: number;
  accessToken: string;
  refreshToken: string;
  jar: CookieJar;
}

export async function createPendingOrder(): Promise<OrderFixture> {
  const jar = new CookieJar();
  const handle = installLiveFetch(jar);

  const call = async <T>(
    path: string,
    options: { method?: string; body?: unknown; token?: string } = {},
  ): Promise<T> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(API_ORIGIN + path, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${options.method ?? "GET"} ${path} → ${response.status} ${text}`);
    }
    return (text ? JSON.parse(text) : null) as T;
  };

  try {
    const session = await call<{ accessToken: string; refreshToken: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: { email: "customer@example.local", password: "Motdepasse1!" },
      },
    );

    const catalogue = await call<{ items: Array<{ id: string }> }>(
      "/api/products?limit=1",
    );
    const product = catalogue.items[0];
    if (!product) throw new Error("Le catalogue de démonstration est vide.");

    await call("/api/cart/items", {
      method: "POST",
      token: session.accessToken,
      body: { productId: product.id, quantity: 1 },
    });

    const order = await call<{ id: string; orderNumber: string; total: number }>(
      "/api/orders",
      {
        method: "POST",
        token: session.accessToken,
        body: {
          shippingMethod: "standard",
          shippingAddress: {
            fullName: "Camille Moreau",
            phone: "+261 34 00 000 03",
            addressLine1: "Lot II M 12 Bis",
            city: "Antananarivo",
            country: "Madagascar",
          },
        },
      },
    );

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      jar,
    };
  } finally {
    handle.restore();
  }
}
