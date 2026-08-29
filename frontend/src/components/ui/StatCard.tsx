import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number | null;
}

export default function StatCard({ icon: Icon, label, value, sub, trend }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="mt-1 truncate font-display text-2xl text-primary">{value}</p>
        {sub && (
          <p className="mt-1 flex items-center gap-1 text-body-sm text-on-surface-variant">
            {trend != null &&
              (trend >= 0 ? (
                <TrendingUp size={14} className="text-emerald-600" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              ))}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
