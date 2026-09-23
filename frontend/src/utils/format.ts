

const mgaFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

/** `4 495 000` → `"4 495 000 Ar"`. */
export const formatPrice = (value: number | null | undefined): string =>
  `${mgaFormatter.format(Math.round(Number(value ?? 0)))} Ar`;

/** Variante compacte pour les gros montants de tableau de bord. */
export const formatPriceCompact = (value: number | null | undefined): string => {
  const amount = Math.round(Number(value ?? 0));
  if (Math.abs(amount) >= 1_000_000) {
    return `${mgaFormatter.format(Math.round(amount / 100_000) / 10)} M Ar`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${mgaFormatter.format(Math.round(amount / 100) / 10)} k Ar`;
  }
  return `${mgaFormatter.format(amount)} Ar`;
};

export const formatDate = (
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string => new Date(value).toLocaleDateString("fr-FR", options);

export const formatDateTime = (value: string | Date): string =>
  new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatRelative = (value: string | Date): string => {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(value, { day: "numeric", month: "short", year: "numeric" });
};

/** Remise en pourcentage entre prix courant et prix barré. */
export const discountRate = (price: number, compareAtPrice: number | null | undefined): number =>
  compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;

export const initials = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Slugify côté UI (les slugs définitifs sont générés par le backend, §43). */
export const slugify = (str: string): string =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export interface ChartDatum {
  label: string;
  value: number;
}

/** Remplit les trous d'une série temporelle pour un graphique continu. */
export const toChartData = (
  points: { date?: string; label?: string; revenue?: number; value?: number }[] = [],
): ChartDatum[] =>
  points.map((point) => ({
    label:
      point.label ??
      new Date(point.date ?? "").toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
    value: Number(point.revenue ?? point.value ?? 0),
  }));
