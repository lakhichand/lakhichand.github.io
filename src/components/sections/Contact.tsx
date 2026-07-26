"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Send,
  WandSparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
} from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  LeetCodeIcon,
} from "@/components/ui/BrandIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { site, socials, messageSuggestions, gmailCompose } from "@/lib/content";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// The AI "Improve" button only appears when you opt in with this flag (set it
// alongside ANTHROPIC_API_KEY on the server). Keeps the feature hidden by default.
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

type Status = "idle" | "sending" | "success" | "error";

type PrefillDetail = {
  name?: string;
  email?: string;
  message?: string;
  reason?: string;
};

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [improving, setImproving] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(AI_ENABLED);
  const [aiNote, setAiNote] = useState("");

  // The chat assistant hands its half-finished draft over here when a visitor
  // would rather fill the form in themselves.
  useEffect(() => {
    function onPrefill(e: Event) {
      const d = (e as CustomEvent<PrefillDetail>).detail ?? {};
      if (d.name) setName(d.name);
      if (d.email) setEmail(d.email);
      if (d.message || d.reason) {
        setMessage(d.message || (d.reason ? `${d.reason}\n\n` : ""));
      }
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 600);
    }
    window.addEventListener("portfolio:prefill-contact", onPrefill);
    return () =>
      window.removeEventListener("portfolio:prefill-contact", onPrefill);
  }, []);

  async function improveMessage() {
    if (!message.trim() || improving) return;
    setImproving(true);
    setAiNote("");
    try {
      const res = await fetch("/api/improve-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.status === 503) {
        // Feature isn't configured on this deployment — hide the button.
        setAiAvailable(false);
        return;
      }
      if (res.status === 429) {
        setAiNote("Whoa — give it a moment before polishing again.");
        return;
      }
      if (!res.ok) {
        setAiNote("Couldn't polish that just now. Your message is unchanged.");
        return;
      }
      const data = (await res.json()) as { improved?: string };
      if (data.improved) setMessage(data.improved);
    } catch {
      setAiNote("Couldn't polish that just now. Your message is unchanged.");
    } finally {
      setImproving(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real users never fill this hidden field. Bots do.
    if ((data.get("company") as string)?.trim()) {
      // Pretend success so bots get no signal.
      setStatus("success");
      form.reset();
      setName("");
      setEmail("");
      setMessage("");
      return;
    }

    const name = (data.get("from_name") as string)?.trim();
    const email = (data.get("reply_to") as string)?.trim();
    const msg = message.trim();

    if (!name || !email || !msg) {
      setStatus("error");
      setErrorMsg("Please fill in your name, email, and a message.");
      return;
    }

    if (!CONFIGURED) {
      setStatus("error");
      setErrorMsg(
        "The contact form isn't connected yet. Please email me directly using the button below.",
      );
      return;
    }

    try {
      setStatus("sending");
      setErrorMsg("");
      await emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        { from_name: name, reply_to: email, message: msg },
        { publicKey: PUBLIC_KEY! },
      );
      setStatus("success");
      form.reset();
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        "Something went wrong sending your message. Please try again or email me directly.",
      );
      console.error(err);
    }
  }

  return (
    <section id="contact" className="section scroll-mt-24 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something"
        description="Have a role, a project, or just want to say hi? Drop me a line — I usually reply within a day."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: direct contact details */}
        <Reveal from="left">
          <div className="space-y-4">
            <a
              href={gmailCompose}
              target="_blank"
              rel="noopener noreferrer"
              title={site.email}
              className="card-surface flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-accent/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs text-faint">Email</span>
                <span className="text-sm text-fg">{site.email}</span>
              </span>
            </a>

            <a
              href={`tel:${site.phone.replace(/\s+/g, "")}`}
              className="card-surface flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-accent/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-3/15 text-accent-3">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs text-faint">Phone</span>
                <span className="text-sm text-fg">{site.phone}</span>
              </span>
            </a>

            <div className="card-surface flex items-center gap-4 rounded-2xl p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-2/15 text-accent-2">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs text-faint">Current location</span>
                <span className="text-sm text-fg">{site.location}</span>
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="glass grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:text-fg"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="glass grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:text-fg"
              >
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a
                href={socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LeetCode"
                className="glass grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:text-fg"
              >
                <LeetCodeIcon className="h-5 w-5" />
              </a>
            </div>

            {/* Sets expectations, and stops this column dead-ending in whitespace */}
            <div className="card-surface rounded-2xl p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                {site.availability}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {site.responseTime}. Happy to talk about backend roles, ERP work,
                or a project you&apos;re trying to get off the ground.
              </p>
              <p className="mt-3 flex items-center gap-2 text-xs text-faint">
                <Clock className="h-3.5 w-3.5" />
                Timezone IST (UTC+5:30)
              </p>
            </div>
          </div>
        </Reveal>

        {/* Right: form */}
        <Reveal from="right">
          <form onSubmit={onSubmit} className="card-surface rounded-2xl p-6 sm:p-8">
            {/* Honeypot — visually hidden, off-screen, not tab-focusable */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label>
                Company
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="grid gap-5">
              <Field label="Name" htmlFor="from_name">
                <input
                  ref={nameRef}
                  id="from_name"
                  name="from_name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Email" htmlFor="reply_to">
                <input
                  id="reply_to"
                  name="reply_to"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </Field>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs text-faint">Quick starters:</span>
                  {messageSuggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setMessage(s.text)}
                      className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <label htmlFor="message" className="block">
                  <span className="sr-only">Message</span>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me a bit about what you have in mind…"
                      className="input resize-none pb-12"
                    />

                    {aiAvailable && (
                      <button
                        type="button"
                        onClick={improveMessage}
                        disabled={improving || !message.trim()}
                        title="Polish your message with AI"
                        className="group absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-2 transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {improving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Polishing…
                          </>
                        ) : (
                          <>
                            <WandSparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                            Improve with AI
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </label>

                {aiNote && (
                  <p className="mt-1.5 text-xs text-faint">{aiNote}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-3 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-12px_rgba(139,92,246,0.7)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      Send message
                    </>
                  )}
                </button>

                <a
                  href={gmailCompose}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={site.email}
                  className="text-sm text-faint transition-colors hover:text-fg"
                >
                  or email directly
                </a>
              </div>

              {/* Status feedback */}
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <StatusNote key="ok" tone="success">
                    <CheckCircle2 className="h-4 w-4" />
                    Thanks! Your message is on its way — I&apos;ll be in touch soon.
                  </StatusNote>
                )}
                {status === "error" && (
                  <StatusNote key="err" tone="error">
                    <AlertCircle className="h-4 w-4" />
                    {errorMsg}
                  </StatusNote>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function StatusNote({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        tone === "success"
          ? "border-green-500/30 bg-green-500/10 text-green-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {children}
    </motion.p>
  );
}
