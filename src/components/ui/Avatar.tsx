import { initials } from "../../utils/format";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const palette: string[] = [
  "bg-secondary-container text-on-secondary-container",
  "bg-secondary text-on-secondary",
  "bg-primary text-on-primary",
  "bg-tertiary-container text-on-surface",
];

const sizes: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export default function Avatar({ name = "", size = "md", className = "" }: AvatarProps) {
  const index = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length;
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${palette[index]} ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      {initials(name) || "?"}
    </span>
  );
}
