import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "secondary" | "success" | "danger" | "warning" | "info" | "outline";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-container-high text-on-surface-variant border-outline-variant",
  secondary: "bg-secondary-container text-on-secondary-container border-transparent",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-sky-100 text-sky-800 border-sky-200",
  outline: "bg-transparent text-on-surface-variant border-outline-variant",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export default function Badge({ variant = "neutral", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
