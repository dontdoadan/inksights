import type { ReactNode } from "react";

export const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

export const num = (n: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  );

export function NumberSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <span className="font-display font-bold text-mint tabular-nums">
          {prefix}
          {num(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-mint cursor-pointer"
      />
    </div>
  );
}

export function ResultStat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        emphasis
          ? "border-mint bg-mint/10"
          : "border-border bg-ink-deep"
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-display font-black tabular-nums ${
          emphasis ? "text-mint text-3xl md:text-4xl" : "text-ice text-2xl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function MetricCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-ink-elev p-6 ${className}`}
    >
      {children}
    </div>
  );
}
