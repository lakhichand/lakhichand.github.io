"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Mic,
  Keyboard,
  Play,
  Pause,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { assistant, site, messageFlow } from "@/lib/content";
import { Mascot } from "./Mascot";
import { VoiceRecorder, type Recording } from "./VoiceRecorder";
import { sendMessage, emailConfigured } from "@/lib/sendMessage";

type Msg = { role: "user" | "assistant"; content: string };

/** Steps of the guided "leave a message" flow. `null` = normal chat. */
type Step =
  | null
  | "name"
  | "reason"
  | "email"
  | "mode"
  | "text"
  | "voice"
  | "review"
  | "sending"
  | "sent";

type Draft = {
  name: string;
  reason: string;
  email: string;
  text: string;
  recording: Recording | null;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  reason: "",
  email: "",
  text: "",
  recording: null,
};

const initials = site.name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .slice(0, 2);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function fmtDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Small inline player for the recorded note, shown in the review card. */
function VoiceChip({ recording }: { recording: Recording }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5">
      <button
        type="button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (el.paused) {
            void el.play();
            setPlaying(true);
          } else {
            el.pause();
            setPlaying(false);
          }
        }}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white"
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5" />
        )}
      </button>
      <span className="flex flex-1 items-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-accent-2/70"
            style={{
              height: `${6 + Math.abs(Math.sin(i * 1.7)) * 14}px`,
            }}
          />
        ))}
      </span>
      <span className="flex-none font-mono text-xs tabular-nums text-muted">
        {fmtDuration(recording.duration)}
      </span>
      <audio
        ref={ref}
        src={recording.url}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

export function ChatWidget() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [wave, setWave] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: assistant.greeting },
  ]);

  const [step, setStep] = useState<Step>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const say = (content: string) =>
    setMessages((m) => [...m, { role: "assistant", content }]);
  const echo = (content: string) =>
    setMessages((m) => [...m, { role: "user", content }]);

  // Opening the panel also retires the teaser, so the effect below never has
  // to set state synchronously just to hide it.
  function openChat() {
    setWave(false);
    setOpen(true);
  }

  // While the chat is closed, the launcher peeks a "hi, I'm here" bubble
  // shortly after load and then roughly every 20 seconds.
  useEffect(() => {
    if (open) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const trigger = () => {
      setWave(true);
      hideTimer = setTimeout(() => setWave(false), 4500);
    };
    const first = setTimeout(trigger, 2500);
    const interval = setInterval(trigger, 20000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [open]);

  // Keep the conversation scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, sending, step, reduce]);

  function navigateTo(href: string) {
    const el = document.querySelector(href);
    if (el) {
      setOpen(false);
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
  }

  /** Hands whatever's been collected over to the full contact form. */
  function handOffToForm() {
    window.dispatchEvent(
      new CustomEvent("portfolio:prefill-contact", {
        detail: {
          name: draft.name,
          email: draft.email,
          message: draft.text,
          reason: draft.reason,
        },
      }),
    );
    setStep(null);
    navigateTo("#contact");
  }

  function startFlow() {
    echo(messageFlow.entryLabel);
    setDraft(EMPTY_DRAFT);
    setMenuOpen(false);
    setStep("name");
    say(messageFlow.intro);
    setTimeout(() => inputRef.current?.focus(), 120);
  }

  function cancelFlow() {
    if (draft.recording) URL.revokeObjectURL(draft.recording.url);
    setDraft(EMPTY_DRAFT);
    setStep(null);
    setMenuOpen(true);
    say("No problem — cancelled. Anything else I can help with?");
  }

  function chooseReason(reason: string) {
    echo(reason);
    setDraft((d) => ({ ...d, reason }));
    setStep("email");
    say(messageFlow.askEmail);
    setTimeout(() => inputRef.current?.focus(), 120);
  }

  function chooseMode(mode: "text" | "voice") {
    if (mode === "voice") {
      echo("🎙️ Record a voice note");
      setStep("voice");
      return;
    }
    echo("⌨️ Type it");
    setStep("text");
    say(messageFlow.typePrompt);
    setTimeout(() => inputRef.current?.focus(), 120);
  }

  /** Handles the composer submit while the guided flow is running. */
  function advance(value: string) {
    const v = value.trim();

    if (step === "name") {
      if (v.length < 2) return say(messageFlow.invalidName);
      echo(v);
      setDraft((d) => ({ ...d, name: v }));
      setInput("");
      setStep("reason");
      return say(messageFlow.askReason.replace("{name}", v));
    }

    if (step === "reason") {
      if (!v) return;
      echo(v);
      setDraft((d) => ({ ...d, reason: v }));
      setInput("");
      setStep("email");
      return say(messageFlow.askEmail);
    }

    if (step === "email") {
      if (!isEmail(v)) return say(messageFlow.invalidEmail);
      echo(v);
      setDraft((d) => ({ ...d, email: v }));
      setInput("");
      setStep("mode");
      return say(messageFlow.askMode);
    }

    if (step === "text") {
      if (!v) return say(messageFlow.emptyMessage);
      echo(v);
      setDraft((d) => ({ ...d, text: v, recording: null }));
      setInput("");
      setStep("review");
      return say(messageFlow.reviewIntro);
    }
  }

  async function submitDraft() {
    if (!emailConfigured) {
      say(messageFlow.notConfigured);
      setTimeout(handOffToForm, 900);
      return;
    }
    setStep("sending");
    try {
      await sendMessage({
        name: draft.name,
        email: draft.email,
        reason: draft.reason,
        text: draft.text || undefined,
        audio: draft.recording
          ? {
              blob: draft.recording.blob,
              duration: draft.recording.duration,
              mimeType: draft.recording.mimeType,
            }
          : null,
      });
      setStep("sent");
      say(messageFlow.sent);
    } catch {
      setStep("review");
      say(messageFlow.failed);
      setTimeout(handOffToForm, 1200);
    }
  }

  function handleSuggestion(s: (typeof assistant.suggestions)[number]) {
    setMessages((m) => [
      ...m,
      { role: "user", content: s.q },
      ...(s.a ? [{ role: "assistant" as const, content: s.a }] : []),
    ]);
    setMenuOpen(false);
    if (s.scrollTo) {
      setTimeout(() => navigateTo(s.scrollTo as string), reduce ? 0 : 350);
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      // 404 = statically exported build with no API route behind it.
      if (res.status === 503 || res.status === 404) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: assistant.offlineReply },
        ]);
        setMenuOpen(true);
        return;
      }
      if (res.status === 429) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "One moment — a lot of questions at once! Try again in a few seconds.",
          },
        ]);
        return;
      }
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ||
            `Sorry, I couldn't answer that. Reach ${site.name.split(" ")[0]} at ${site.email}.`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Something went wrong on my end. You can email ${site.name.split(" ")[0]} at ${site.email} instead.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const composerActive =
    step === null || step === "name" || step === "reason" || step === "email" || step === "text";

  const placeholder =
    step === "name"
      ? "Your name…"
      : step === "reason"
        ? "Or tell me in your own words…"
        : step === "email"
          ? "you@company.com"
          : step === "text"
            ? "Type your message…"
            : "Ask about my work…";

  return (
    <>
      {/* Launcher + teaser */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {wave && !open && (
            <motion.button
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={openChat}
              className="glass max-w-[15rem] rounded-2xl rounded-br-sm px-4 py-3 text-left text-sm text-fg shadow-xl"
            >
              <span className="block font-semibold">Hii! 👋</span>
              <span className="mt-0.5 block text-muted">
                I&apos;m {site.name.split(" ")[0]}&apos;s assistant — ask me
                anything, or leave a voice note.
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!open && (
            <motion.button
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={reduce ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openChat}
              aria-label="Open chat assistant"
              className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)]"
            >
              <Mascot waving={wave} />
              {!wave && (
                <span className="absolute right-0 top-0 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-2" />
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="glass fixed bottom-5 right-5 z-50 flex h-[min(34rem,82vh)] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-white/[0.03] px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-xs font-bold text-white">
                {initials}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-fg">{assistant.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-faint">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  Usually replies instantly
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user" ? "flex justify-end" : "flex justify-start"
                  }
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-gradient-to-br from-accent to-accent-3 text-white"
                        : "rounded-bl-sm border border-border bg-white/[0.04] text-fg"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-white/[0.04] px-3.5 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-muted"
                        animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: d * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* --- guided flow controls --- */}

              {step === "reason" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {messageFlow.reasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => chooseReason(r)}
                      className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent-2 transition-colors hover:bg-accent/20"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              {step === "mode" && (
                <div className="grid gap-2 pt-1 sm:grid-cols-2">
                  <button
                    onClick={() => chooseMode("voice")}
                    className="flex items-center gap-2.5 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-accent/20"
                  >
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white">
                      <Mic className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-medium">Record</span>
                      <span className="block text-xs text-faint">
                        Just talk
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => chooseMode("text")}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-white/[0.04] px-3 py-2.5 text-left text-sm text-fg transition-colors hover:border-accent/40"
                  >
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/5 text-muted">
                      <Keyboard className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-medium">Type</span>
                      <span className="block text-xs text-faint">
                        Write it out
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {(step === "review" || step === "sending") && (
                <div className="space-y-3 rounded-2xl border border-border bg-white/[0.04] p-3.5">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-14 flex-none text-xs text-faint">Name</dt>
                      <dd className="text-fg">{draft.name}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-14 flex-none text-xs text-faint">Email</dt>
                      <dd className="break-all text-fg">{draft.email}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-14 flex-none text-xs text-faint">About</dt>
                      <dd className="text-fg">{draft.reason}</dd>
                    </div>
                  </dl>

                  {draft.recording ? (
                    <VoiceChip recording={draft.recording} />
                  ) : (
                    <p className="rounded-xl border border-border bg-black/20 px-3 py-2 text-sm leading-relaxed text-muted">
                      {draft.text}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={submitDraft}
                      disabled={step === "sending"}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-3 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-70"
                    >
                      {step === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send it
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelFlow}
                      disabled={step === "sending"}
                      className="rounded-full border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:text-fg disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {step === "sent" && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                  <p className="text-sm font-medium text-green-200">
                    Message delivered
                  </p>
                  <button
                    onClick={() => {
                      setStep(null);
                      setDraft(EMPTY_DRAFT);
                      setMenuOpen(true);
                    }}
                    className="mt-1 text-xs text-muted underline-offset-4 hover:underline"
                  >
                    Back to questions
                  </button>
                </div>
              )}

              {/* Suggestion chips — only when no flow is running */}
              {!sending &&
                step === null &&
                (menuOpen ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={startFlow}
                      className="rounded-full border border-accent/50 bg-gradient-to-r from-accent/20 to-accent-3/20 px-3 py-1.5 text-left text-xs font-medium text-fg transition-colors hover:from-accent/30 hover:to-accent-3/30"
                    >
                      {messageFlow.entryLabel}
                    </button>
                    {assistant.suggestions.map((s) => (
                      <button
                        key={s.q}
                        onClick={() => handleSuggestion(s)}
                        className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-left text-xs text-accent-2 transition-colors hover:bg-accent/20"
                      >
                        {s.q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setMenuOpen(true)}
                      className="rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg"
                    >
                      {assistant.menuLabel}
                    </button>
                    <button
                      onClick={startFlow}
                      className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent-2 transition-colors hover:bg-accent/20"
                    >
                      {messageFlow.entryLabel}
                    </button>
                  </div>
                ))}

              {/* Always leave a manual escape hatch out of the bot */}
              {step !== null && step !== "sent" && step !== "voice" && (
                <button
                  onClick={handOffToForm}
                  className="flex w-full items-center justify-center gap-1.5 pt-1 text-xs text-faint transition-colors hover:text-fg"
                >
                  {messageFlow.manualLabel}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Composer */}
            {composerActive && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === null) send(input);
                  else advance(input);
                }}
                className="flex items-center gap-2 border-t border-border bg-white/[0.03] px-3 py-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  aria-label="Type your message"
                  type={step === "email" ? "email" : "text"}
                  className="min-w-0 flex-1 rounded-full border border-border bg-white/[0.04] px-4 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-accent/50"
                />

                {/* Jump straight to recording from the composer */}
                {(step === null || step === "text") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === "text") setStep("voice");
                      else startFlow();
                    }}
                    aria-label="Send a voice message"
                    title="Send a voice message"
                    className="grid h-9 w-9 flex-none place-items-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent-2"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            )}

            {/* Voice sheet slides over the whole panel */}
            <AnimatePresence>
              {step === "voice" && (
                <VoiceRecorder
                  onCancel={() => {
                    setStep("mode");
                    say("No worries — type it instead?");
                  }}
                  onDone={(r) => {
                    setDraft((d) => ({ ...d, recording: r, text: "" }));
                    echo(`🎙️ Voice message · ${fmtDuration(r.duration)}`);
                    setStep("review");
                    say(messageFlow.reviewIntro);
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
