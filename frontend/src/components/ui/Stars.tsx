import { Star } from "lucide-react";

interface StarsProps {
  value?: number;
  size?: number;
  className?: string;
}

export default function Stars({ value = 0, size = 16, className = "" }: StarsProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-secondary text-secondary" : "text-outline-variant"}
        />
      ))}
    </div>
  );
}
