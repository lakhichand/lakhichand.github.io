"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { experience } from "@/lib/content";

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="experience" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Journey"
        title="Experience & education"
        description="The path so far — roles, internships, and where I studied."
      />

      <div ref={ref} className="relative mt-14 pl-2">
        {/* Track */}
        <div className="absolute bottom-0 left-[11px] top-2 w-px bg-border sm:left-[15px]" />
        {/* Animated progress fill */}
        <motion.div
          className="absolute left-[11px] top-2 w-px origin-top bg-gradient-to-b from-accent via-accent-3 to-accent-2 sm:left-[15px]"
          style={{ scaleY: reduce ? 1 : scaleY, bottom: 0 }}
        />

        <ul className="space-y-10">
          {experience.map((item, i) => {
            const Icon = item.kind === "education" ? GraduationCap : Briefcase;
            return (
              <li key={i} className="relative pl-10 sm:pl-14">
                {/* Node */}
                <span className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full border border-border bg-surface sm:h-8 sm:w-8">
                  <Icon className="h-3 w-3 text-accent-2 sm:h-4 sm:w-4" />
                </span>

                <Reveal from="left" delay={0.03 * i}>
                  <div className="card-surface card-lift rounded-2xl p-5 hover:card-lift-on sm:p-6">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                      <h3 className="font-display text-lg font-semibold text-fg">
                        {item.title}
                        <span className="text-accent"> · {item.company}</span>
                      </h3>
                      <span className="flex flex-none items-center gap-2">
                        {item.period.includes("Present") && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Current
                          </span>
                        )}
                        <span className="font-mono text-xs text-faint">
                          {item.period}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-faint">{item.location}</p>
                    <ul className="mt-3 space-y-2">
                      {item.points.map((p, pi) => (
                        <li
                          key={pi}
                          className="flex gap-2 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-2" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
