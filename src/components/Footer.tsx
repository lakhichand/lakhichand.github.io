import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site, socials, nav } from "@/lib/content";

export function Footer() {
  const year = 2026; // build-time constant; bump as needed

  return (
    <footer className="mt-10 border-t border-border py-10">
      <div className="section flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold">{site.name}</p>
          <p className="mt-1 text-xs text-faint">
            © {year} · Built with Next.js, React Three Fiber &amp; Framer Motion.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            aria-label="Email"
            className="text-faint transition-colors hover:text-fg"
          >
            <Mail className="h-5 w-5" />
          </a>
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
        </div>
      </div>
    </footer>
  );
}
