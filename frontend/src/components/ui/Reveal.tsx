import { useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Animation d'apparition au scroll (composant réutilisable).
 * <Reveal delay={0.2}>…</Reveal>
 */
export default function Reveal({ children, delay = 0, className = "", as }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = as ?? "div";

  return (
    <Tag ref={ref} style={{ transitionDelay: `${delay}s` }} className={`fade-up ${className}`}>
      {children}
    </Tag>
  );
}
