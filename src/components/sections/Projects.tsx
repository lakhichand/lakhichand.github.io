"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, Lock, Star } from "lucide-react";
import Image from "next/image";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup } from "@/components/ui/Reveal";
import { projects, type Project } from "@/lib/content";

/** Deterministic gradient + monogram per card, so no two look alike. */
const GRADIENTS = [
  "from-violet-500/35 via-fuchsia-500/20 to-cyan-500/30",
  "from-cyan-500/35 via-blue-500/20 to-violet-500/30",
  "from-fuchsia-500/35 via-pink-500/20 to-amber-500/25",
  "from-emerald-500/35 via-teal-500/20 to-cyan-500/30",
  "from-amber-500/30 via-orange-500/20 to-fuchsia-500/30",
];

function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function TiltCard({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 15,
  });

  // Cursor-following spotlight on the card surface
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const spotlight = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(22rem 22rem at ${x}% ${y}%, rgba(139,92,246,0.14), transparent 60%)`,
  );

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    mx.set(rx - 0.5);
    my.set(ry - 0.5);
    px.set(rx * 100);
    py.set(ry * 100);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  const grad = GRADIENTS[index % GRADIENTS.length];
  const hasLinks = Boolean(project.liveUrl || project.repoUrl);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`[perspective:1200px] ${
        project.featured ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <motion.article
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="card-surface group relative flex h-full flex-col overflow-hidden rounded-2xl transition-colors hover:border-accent/40"
      >
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Image / gradient header — the featured card is wider, so it gets a
            shallower ratio to stop the banner from dominating the row. */}
        <div
          className={`relative overflow-hidden ${
            project.featured ? "aspect-[16/7] lg:aspect-[16/6]" : "aspect-[16/10]"
          }`}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.name} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${grad}`}
            >
              {/* Faint blueprint grid behind the monogram */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <span className="relative font-display text-5xl font-extrabold tracking-tight text-white/85 drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110">
                {monogram(project.name)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />

          {project.featured && (
            <span className="glass absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-accent-2">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        <div
          className="flex flex-1 flex-col p-5"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-fg">
              {project.name}
            </h3>
            <div className="flex flex-none items-center gap-2 text-faint">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name} repository`}
                  className="transition-colors hover:text-fg"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name} live site`}
                  className="transition-colors hover:text-fg"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-faint"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Cards with no public link would otherwise look broken */}
          {!hasLinks && (
            <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-faint">
              <Lock className="h-3 w-3" />
              Client work — walkthrough available on request
            </p>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Projects() {
  return (
    <section id="projects" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Projects"
        title="Things I've built"
        description="A selection of work — from full-scale ERP systems to focused tools."
      />

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <TiltCard key={project.name} project={project} index={i} />
        ))}
      </RevealGroup>
    </section>
  );
}
