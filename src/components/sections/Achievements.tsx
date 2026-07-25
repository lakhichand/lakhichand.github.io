"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  animate as animateValue,
} from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { achievements, badges, type Achievement } from "@/lib/content";

function Counter({ item }: { item: Achievement }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // A zero-duration animation jumps straight to the final value, so the
    // reduced-motion path needs no separate branch.
    const controls = animateValue(0, item.value, {
      duration: reduce ? 0 : 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, item.value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {item.prefix}
      {display}
      {item.suffix}
    </span>
  );
}

export function Achievements() {
  return (
    <section id="achievements" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Impact"
        title="By the numbers"
        description="Measurable outcomes and recognition from real production work."
      />

      <RevealGroup className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {achievements.map((item) => (
          <motion.div
            key={item.label}
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="card-surface card-lift group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-10 text-center hover:card-lift-on"
          >
            <div className="absolute inset-x-0 -top-16 mx-auto h-32 w-32 rounded-full bg-accent/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
            <div className="gradient-text font-display text-5xl font-extrabold sm:text-6xl">
              <Counter item={item} />
            </div>
            {/* Fixed label box keeps all three counters on the same baseline */}
            <p className="mt-3 flex min-h-[3.75rem] max-w-[22ch] items-start justify-center text-sm leading-relaxed text-muted">
              {item.label}
            </p>
          </motion.div>
        ))}
      </RevealGroup>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {badges.map((badge, i) => (
          <Reveal key={badge} delay={i * 0.06}>
            <span className="glass inline-block rounded-full px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg">
              {badge}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
