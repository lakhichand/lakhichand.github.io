import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: Props) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <Reveal>
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-2">
          <span className="h-px w-6 bg-accent-2/60" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
