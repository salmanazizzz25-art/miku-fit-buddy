import { motion } from "motion/react";

interface Props {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  unit?: string;
}

export function RingChart({
  value,
  max,
  size = 120,
  stroke = 10,
  color = "var(--color-cyan)",
  label,
  unit,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = c * (1 - pct);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          opacity={0.3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-xl font-bold leading-none">{value}</div>
          {unit && <div className="text-[10px] text-muted-foreground">{unit}</div>}
          {label && <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>}
        </div>
      </div>
    </div>
  );
}
