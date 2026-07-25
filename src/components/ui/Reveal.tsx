"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Direction the element travels in from. */
  from?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  as?: "div" | "li" | "section" | "span";
};

const OFFSET = 28;

export function Reveal({
  children,
  delay = 0,
  from = "up",
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  const offset =
    from === "up"
      ? { y: OFFSET }
      : from === "down"
        ? { y: -OFFSET }
        : from === "left"
          ? { x: OFFSET }
          : from === "right"
            ? { x: -OFFSET }
            : {};

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, ...offset },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduce ? 0.2 : 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

/** Container that staggers its Reveal children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
