import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Nombre total d'éléments, affiché à gauche. */
  total?: number;
  className?: string;
}

/** Pagination réutilisable pour toutes les listes paginées (§44). */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  const push = (p: number) => pages.push(p);
  const window = 1;

  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <nav
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      aria-label="Pagination"
    >
      <p className="text-body-sm text-on-surface-variant">
        Page <strong className="text-primary">{page}</strong> sur {totalPages}
        {total !== undefined && ` · ${total} résultat${total > 1 ? "s" : ""}`}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-white text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary disabled:opacity-40"
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={"gap-" + i} className="px-1 text-on-surface-variant">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 rounded-lg border px-2.5 text-body-sm font-semibold transition-colors ${
                p === page
                  ? "border-secondary bg-secondary text-on-secondary"
                  : "border-outline-variant bg-white text-on-surface-variant hover:border-secondary hover:text-secondary"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-white text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
