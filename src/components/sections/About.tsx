"use client";

import { motion, useReducedMotion } from "framer-motion";
import { User } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { about, skills, site, quickFacts } from "@/lib/content";

const initials = site.name
  .split(" ")
  .map((n) => n[0])
  .join("");

export function About() {
  const reduce = useReducedMotion();

  return (
    <section id="about" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="About"
        title="Engineer who ships reliable software"
        description="A quick look at who I am and the tools I reach for."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Left rail: portrait + quick facts (sticks while the bio scrolls) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal from="left">
            <div className="group relative mx-auto w-full max-w-xs lg:mx-0">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent/30 via-accent-3/20 to-accent-2/30 opacity-60 blur-2xl transition-opacity group-hover:opacity-90" />
              <div className="card-surface relative aspect-[4/5] overflow-hidden rounded-3xl">
                {/* Replace this block with a real <Image /> once you add a photo to /public */}
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-surface-2 to-surface">
                  <span
                    aria-hidden="true"
                    className="gradient-text font-display text-7xl font-extrabold opacity-90"
                  >
                    {initials}
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-bg/90 to-transparent px-4 pb-3 pt-8 text-xs text-faint">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-mono">add your-photo.jpg</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal from="left" delay={0.08}>
            <dl className="card-surface mx-auto mt-6 w-full max-w-xs divide-y divide-white/5 rounded-2xl px-4 lg:mx-0">
              {quickFacts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline justify-between gap-3 py-3"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                    {f.label}
                  </dt>
                  <dd className="text-right text-sm text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Right: bio + skills */}
        <div>
          <div className="space-y-4">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-base leading-relaxed text-muted sm:text-lg">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {skills.map((group, gi) => (
              <Reveal key={group.category} delay={gi * 0.05}>
                <div className="card-surface card-lift h-full rounded-2xl p-4 hover:card-lift-on">
                  <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((skill, si) => (
                      <motion.span
                        key={skill}
                        initial={
                          reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }
                        }
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: si * 0.03, duration: 0.3 }}
                        whileHover={reduce ? {} : { y: -2 }}
                        className="cursor-default rounded-lg border border-border bg-white/[0.03] px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-accent/50 hover:text-fg"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-8 text-sm text-faint">
              Based in {site.location} ·{" "}
              <span className="text-accent-2">{site.availability}</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
