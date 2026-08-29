import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-1.5 text-label-sm text-on-surface-variant"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={14} className="text-outline" />}
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-secondary">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-on-background">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
