import { motion } from "motion/react";

type Mood = "happy" | "cheer" | "concerned" | "idle";

interface Props {
  size?: number;
  mood?: Mood;
  className?: string;
}

/**
 * Stylized anime-inspired companion character (original SVG).
 * Teal twin-tails, glowing aura, idle blink + sway animations.
 */
export function MikuCharacter({ size = 180, mood = "idle", className = "" }: Props) {
  const mouth =
    mood === "happy" || mood === "cheer"
      ? "M 95 138 Q 110 152 125 138"
      : mood === "concerned"
      ? "M 95 142 Q 110 134 125 142"
      : "M 98 140 Q 110 146 122 140";

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* aura */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.2 190 / 0.5), transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      <svg
        viewBox="0 0 220 240"
        className="relative animate-float"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 195)" />
            <stop offset="100%" stopColor="oklch(0.55 0.18 200)" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.02 60)" />
            <stop offset="100%" stopColor="oklch(0.92 0.04 30)" />
          </linearGradient>
          <radialGradient id="eyeGrad">
            <stop offset="0%" stopColor="oklch(0.95 0.18 195)" />
            <stop offset="60%" stopColor="oklch(0.55 0.2 200)" />
            <stop offset="100%" stopColor="oklch(0.25 0.1 220)" />
          </radialGradient>
        </defs>

        {/* twin-tail back left */}
        <g className="animate-sway" style={{ transformOrigin: "60px 80px" }}>
          <path
            d="M 60 70 C 20 100, 10 170, 30 220 L 55 215 C 50 170, 60 120, 75 95 Z"
            fill="url(#hairGrad)"
            stroke="oklch(0.4 0.15 210)"
            strokeWidth="1.5"
          />
        </g>
        {/* twin-tail back right */}
        <g className="animate-sway" style={{ transformOrigin: "160px 80px", animationDelay: "-3s" }}>
          <path
            d="M 160 70 C 200 100, 210 170, 190 220 L 165 215 C 170 170, 160 120, 145 95 Z"
            fill="url(#hairGrad)"
            stroke="oklch(0.4 0.15 210)"
            strokeWidth="1.5"
          />
        </g>

        {/* back hair */}
        <path
          d="M 60 90 Q 60 50 110 40 Q 160 50 160 90 L 160 130 L 60 130 Z"
          fill="url(#hairGrad)"
        />

        {/* face */}
        <ellipse cx="110" cy="120" rx="44" ry="50" fill="url(#skinGrad)" />

        {/* hair front bangs */}
        <path
          d="M 66 95 Q 80 65 110 60 Q 140 65 154 95 Q 145 88 130 92 Q 125 78 110 76 Q 95 78 90 92 Q 75 88 66 95 Z"
          fill="url(#hairGrad)"
          stroke="oklch(0.4 0.15 210)"
          strokeWidth="1"
        />
        {/* side bangs */}
        <path d="M 66 95 Q 60 130 70 150 L 80 145 Q 75 120 78 100 Z" fill="url(#hairGrad)" />
        <path d="M 154 95 Q 160 130 150 150 L 140 145 Q 145 120 142 100 Z" fill="url(#hairGrad)" />

        {/* eyes */}
        <g className="animate-blink" style={{ transformOrigin: "92px 118px" }}>
          <ellipse cx="92" cy="118" rx="9" ry="12" fill="url(#eyeGrad)" />
          <circle cx="94" cy="115" r="3" fill="white" opacity="0.9" />
          <circle cx="89" cy="122" r="1.5" fill="white" opacity="0.7" />
        </g>
        <g className="animate-blink" style={{ transformOrigin: "128px 118px" }}>
          <ellipse cx="128" cy="118" rx="9" ry="12" fill="url(#eyeGrad)" />
          <circle cx="130" cy="115" r="3" fill="white" opacity="0.9" />
          <circle cx="125" cy="122" r="1.5" fill="white" opacity="0.7" />
        </g>

        {/* blush */}
        <ellipse cx="82" cy="135" rx="7" ry="3" fill="oklch(0.85 0.12 20 / 0.5)" />
        <ellipse cx="138" cy="135" rx="7" ry="3" fill="oklch(0.85 0.12 20 / 0.5)" />

        {/* mouth */}
        <path d={mouth} stroke="oklch(0.4 0.1 20)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* collar / neck tie */}
        <path d="M 90 165 L 110 175 L 130 165 L 130 185 L 90 185 Z" fill="oklch(0.3 0.06 220)" />
        <rect x="106" y="170" width="8" height="14" fill="oklch(0.78 0.18 195)" rx="1" />

        {/* sparkle */}
        {mood === "cheer" && (
          <>
            <text x="40" y="60" fontSize="22" fill="oklch(0.85 0.2 190)">✦</text>
            <text x="170" y="80" fontSize="18" fill="oklch(0.85 0.2 190)">✧</text>
          </>
        )}
      </svg>
    </motion.div>
  );
}
