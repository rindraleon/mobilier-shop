import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "light" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-secondary",
  accent: "bg-secondary text-on-secondary hover:bg-primary",
  outline:
    "border border-outline-variant bg-transparent text-on-background hover:border-secondary hover:text-secondary",
  ghost: "bg-transparent text-on-background hover:bg-surface-container",
  light: "bg-white text-primary hover:bg-secondary-container shadow-card",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-body-sm font-medium",
  md: "px-5 py-2.5 text-body-sm font-semibold",
  lg: "px-7 py-3.5 text-body-md font-semibold",
};

type ButtonProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

/**
 * Bouton polymorphe et réutilisable.
 * Exemple : <Button as={Link} to="/boutique">Voir</Button>
 */
export default function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps<T>) {
  const Comp: ElementType = as ?? "button";
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-300 hover:shadow-card-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
