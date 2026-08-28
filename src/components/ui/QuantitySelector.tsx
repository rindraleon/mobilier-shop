import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  small?: boolean;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  small = false,
}: QuantitySelectorProps) {
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-outline-variant bg-white ${small ? "h-8" : "h-11"}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-full rounded-l-lg px-2.5 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
        aria-label="Diminuer la quantité"
      >
        <Minus size={small ? 14 : 16} />
      </button>
      <span className={`min-w-[2.25rem] text-center font-semibold ${small ? "text-body-sm" : ""}`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-full rounded-r-lg px-2.5 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
        aria-label="Augmenter la quantité"
      >
        <Plus size={small ? 14 : 16} />
      </button>
    </div>
  );
}
