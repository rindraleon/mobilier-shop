import type { ChartDatum } from "../../utils/format";

interface BarChartProps {
  data: ChartDatum[];
  formatValue?: (value: number) => string;
}

export default function BarChart({ data, formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = (v: number): string => (formatValue ? formatValue(v) : String(v));
  return (
    <div className="flex h-56 items-end gap-2.5 sm:gap-5">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">{fmt(d.value)}</span>
          <div
            className="w-full max-w-[44px] rounded-t-md bg-secondary/80 transition-all duration-500 hover:bg-secondary"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
            title={`${d.label} : ${fmt(d.value)}`}
          />
          <span className="text-label-sm capitalize text-on-surface-variant">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
