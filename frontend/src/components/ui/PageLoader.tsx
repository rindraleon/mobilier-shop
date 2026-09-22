import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
  className?: string;
}

/** Indicateur de chargement accessible (`role="status"`). */
export default function PageLoader({ label = "Chargement…", className = "" }: PageLoaderProps) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center gap-3 ${className}`}>
      <Loader2 size={28} className="animate-spin text-secondary" aria-hidden="true" />
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
