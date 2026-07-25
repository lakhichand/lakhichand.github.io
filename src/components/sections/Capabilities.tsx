"use client";

import { motion } from "framer-motion";
import { Server, Boxes, Gauge, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup } from "@/components/ui/Reveal";
import { capabilities, type Capability } from "@/lib/content";

const ICONS = { server: Server, boxes: Boxes, gauge: Gauge };

/** Each card gets its own accent so the row doesn't read as one flat block. */
const TINTS = [
  { text: "text-accent", bg: "bg-accent/12", glow: "rgba(139,92,246,0.35)" },
  { text: "text-accent-3", bg: "bg-accent-3/12", glow: "rgba(244,114,182,0.35)" },
  { text: "text-accent-2", bg: "bg-accent-2/12", glow: "rgba(34,211,238,0.35)" },
];

function Card({ item, index }: { item: Capability; index: number }) {
  const Icon = ICONS[item.icon];
  const tint = TINTS[index % TINTS.length];

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="card-surface card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 hover:card-lift-on"
    >
      {/* Accent bloom that warms up on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: tint.glow }}
      />

      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${tint.bg} ${tint.text}`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-4 font-display text-lg font-semibold text-fg">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {item.description}
      </p>

      <ul className="mt-4 space-y-2 border-t border-border pt-4">
        {item.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-faint">
            <Check className={`mt-0.5 h-3.5 w-3.5 flex-none ${tint.text}`} />
            {b}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function Capabilities() {
  return (
    <section id="services" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="What I do"
        title="Three things I'm hired for"
        description="The work I do day to day — and what you can hand me on day one."
      />

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
        {capabilities.map((c, i) => (
          <Card key={c.title} item={c} index={i} />
        ))}
      </RevealGroup>
    </section>
  );
}
