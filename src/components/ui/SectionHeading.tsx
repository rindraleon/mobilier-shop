import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  center?: boolean;
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  center = false,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-10 flex flex-col gap-4 md:mb-12 ${
        center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={center ? "max-w-2xl" : "max-w-xl"}>
        {eyebrow && (
          <span
            className={`mb-2 inline-block text-label-md uppercase tracking-[0.18em] ${
              light ? "text-secondary-fixed-dim" : "text-secondary"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={`font-display text-headline-lg md:text-display-md ${light ? "text-on-primary" : "text-primary"}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-3 text-body-lg ${light ? "text-primary-fixed-dim" : "text-on-surface-variant"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
