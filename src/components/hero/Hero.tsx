"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Download, ExternalLink, Mail, MapPin } from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  LeetCodeIcon,
} from "@/components/ui/BrandIcons";
import { site, socials, heroRoles, heroStats } from "@/lib/content";

// R3F must be client-only; load it lazily so it never blocks first paint.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/** A resume hosted elsewhere can't be force-downloaded from our origin. */
const resumeIsExternal = /^https?:\/\//.test(site.resumePath);

/** Cycles through heroRoles, one word swapped in at a time. */
function RotatingRole() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % heroRoles.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  // Width must clear the longest entry in heroRoles ("Backend Engineer", 16).
  return (
    <span className="relative block h-7 w-[17ch] overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={heroRoles[i]}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute inset-0 flex items-center whitespace-nowrap text-accent-2"
        >
          {heroRoles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
    >
      {/* 3D visual (or static fallback for reduced motion).
          Masked and pushed right so it never competes with the headline. */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        {reduce ? (
          <div className="absolute right-0 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-gradient-to-br from-accent/40 via-accent-3/30 to-accent-2/30 blur-3xl md:right-10" />
        ) : (
          <div
            className="absolute inset-0 opacity-40 md:left-[46%] md:opacity-90"
            style={{
              WebkitMaskImage:
                "radial-gradient(58% 58% at 58% 50%, #000 35%, transparent 100%)",
              maskImage:
                "radial-gradient(58% 58% at 58% 50%, #000 35%, transparent 100%)",
            }}
          >
            <HeroCanvas />
          </div>
        )}
      </div>

      {/* Keeps the headline legible over the canvas on small screens */}
      <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-r from-bg via-bg/70 to-transparent md:via-bg/30" />

      <div className="section relative z-10 w-full">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {site.availability}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl"
          >
            {/* Solid, not gradient — the gradient is reserved for the CTA and
                brand marks so it reads as an accent, not a default. */}
            <span className="block text-fg">{site.name}</span>
            <span className="mt-1 block text-muted">{site.role}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 flex items-center gap-2 font-mono text-sm text-faint sm:text-base"
          >
            <RotatingRole />
            <span className="border-l border-border pl-2">
              Python · PostgreSQL
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            {site.pitch}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 flex items-center gap-2 text-sm text-faint"
          >
            <MapPin className="h-4 w-4" />
            {site.location}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-3 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.7)] transition-transform hover:scale-[1.03]"
            >
              View Work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-fg transition-colors hover:border-accent/50"
            >
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
            <a
              href={site.resumePath}
              // `download` is ignored on cross-origin URLs, so a hosted resume
              // (Drive, Dropbox…) opens in a new tab instead.
              {...(resumeIsExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { download: true })}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-muted transition-colors hover:text-fg"
            >
              {resumeIsExternal ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Resume
            </a>
          </motion.div>

          {/* At-a-glance numbers — the first thing a recruiter scans for */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6"
          >
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-fg sm:text-3xl">
                  {s.value}
                </dd>
                <p className="mt-0.5 text-xs text-faint">{s.label}</p>
              </div>
            ))}
          </motion.dl>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-8 flex items-center gap-4"
          >
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-faint transition-colors hover:text-fg"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-faint transition-colors hover:text-fg"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a
              href={socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LeetCode"
              className="text-faint transition-colors hover:text-fg"
            >
              <LeetCodeIcon className="h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-border p-1">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-muted"
            animate={reduce ? {} : { y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
