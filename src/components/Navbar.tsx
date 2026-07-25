"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/lib/content";

/** Ids of the sections the nav points at, in document order. */
const SECTION_IDS = nav.map((n) => n.href.replace("#", ""));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Thin reading-progress bar pinned to the very top of the page.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Back at the hero — nothing in the nav should look selected.
      if (window.scrollY < 240) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight whichever section owns the middle of the viewport.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const initials = site.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="h-0.5 origin-left bg-gradient-to-r from-accent via-accent-3 to-accent-2"
      />

      <div
        className={`section mt-3 flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 ${
          scrolled ? "glass shadow-lg" : "bg-transparent"
        }`}
      >
        <a
          href="#top"
          className="flex items-center gap-2 font-display text-sm font-bold"
          aria-label="Home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-3 text-white">
            {initials}
          </span>
          <span className="hidden sm:inline">{site.name}</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = active === id;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10"
                  />
                )}
                {item.label}
              </a>
            );
          })}
          <a
            href="#contact"
            className="ml-2 rounded-full bg-fg px-4 py-1.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Let&apos;s talk
          </a>
        </nav>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="section mt-2 md:hidden"
          >
            <div className="glass flex flex-col rounded-2xl p-2">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm transition-colors hover:bg-white/5 hover:text-fg ${
                    active === item.href.replace("#", "")
                      ? "bg-white/5 text-fg"
                      : "text-muted"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-fg px-4 py-3 text-center text-sm font-semibold text-bg"
              >
                Let&apos;s talk
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
