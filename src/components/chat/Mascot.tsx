"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The little assistant that lives on the chat launcher.
 * Idles with a gentle bob; when `waving` is true it hops and waves an arm.
 */
export function Mascot({ waving = false }: { waving?: boolean }) {
  const reduce = useReducedMotion();

  // Hop: up, land, small bounce, settle.
  const hop = reduce
    ? {}
    : waving
      ? { y: [0, -7, 0, -3, 0] }
      : { y: [0, -1.5, 0] };

  const hopTiming = reduce
    ? {}
    : waving
      ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.5, ease: "easeOut" as const }
      : { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const };

  // The body squashes a touch on landing so the hop has weight.
  const squash = reduce
    ? {}
    : waving
      ? { scaleY: [1, 0.94, 1.04, 1], scaleX: [1, 1.05, 0.97, 1] }
      : {};

  return (
    <svg
      viewBox="0 0 48 52"
      className="h-10 w-10 overflow-visible"
      aria-hidden="true"
      fill="none"
    >
      {/* Ground shadow — tightens as the character lifts off */}
      <motion.ellipse
        cx="24"
        cy="47"
        rx="10"
        ry="2.4"
        fill="#000"
        opacity="0.28"
        animate={reduce || !waving ? {} : { rx: [10, 7, 10, 8.5, 10], opacity: [0.28, 0.16, 0.28, 0.2, 0.28] }}
        transition={hopTiming}
      />

      <motion.g animate={hop} transition={hopTiming}>
        <motion.g
          animate={squash}
          transition={hopTiming}
          style={{ transformOrigin: "24px 44px", transformBox: "view-box" }}
        >
          {/* Legs */}
          <rect x="18.5" y="36" width="4" height="9" rx="2" fill="#fff" />
          <rect x="25.5" y="36" width="4" height="9" rx="2" fill="#fff" />

          {/* Body */}
          <rect x="16" y="21" width="16" height="18" rx="7" fill="#fff" />

          {/* Left arm, resting */}
          <rect x="12" y="24" width="4.5" height="11" rx="2.2" fill="#fff" />

          {/* Right arm — the wave. Pivots at the shoulder. */}
          <motion.rect
            x="31.5"
            y="24"
            width="4"
            height="11"
            rx="2"
            fill="#fff"
            style={{ transformOrigin: "33.7px 26px", transformBox: "view-box" }}
            animate={
              reduce
                ? {}
                : waving
                  ? { rotate: [10, -55, -25, -55, -25, 10] }
                  : { rotate: 10 }
            }
            transition={
              reduce
                ? {}
                : waving
                  ? { duration: 1.6, repeat: Infinity, repeatDelay: 0.2, ease: "easeInOut" }
                  : { duration: 0.4 }
            }
          />

          {/* Head */}
          <circle cx="24" cy="13" r="11" fill="#fff" />

          {/* Face */}
          <circle cx="20" cy="12" r="1.7" fill="#3b0764" />
          <circle cx="28" cy="12" r="1.7" fill="#3b0764" />
          <path
            d="M20.5 16.5c1 1.4 2.1 2 3.5 2s2.5-.6 3.5-2"
            stroke="#3b0764"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <circle cx="16.5" cy="15.5" r="1.6" fill="#f9a8d4" opacity="0.9" />
          <circle cx="31.5" cy="15.5" r="1.6" fill="#f9a8d4" opacity="0.9" />

          {/* Antenna — nods to the fact this is a bot, not a person */}
          <path d="M24 2.5v-.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <motion.circle
            cx="24"
            cy="1.5"
            r="2"
            fill="#22d3ee"
            animate={reduce ? {} : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <rect x="23.2" y="1.5" width="1.6" height="3" fill="#fff" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
