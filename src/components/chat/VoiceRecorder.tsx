"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Square, X, Play, Pause, RotateCcw, Check, MicOff } from "lucide-react";

export type Recording = {
  blob: Blob;
  url: string;
  /** Seconds, rounded to one decimal. */
  duration: number;
  /** Loudness envelope sampled while recording — drawn back in the preview. */
  peaks: number[];
  mimeType: string;
};

const MAX_SECONDS = 60;
const BAR_COUNT = 34;

/** Widest-supported container first; Safari only takes mp4. */
function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function fmt(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Phase = "starting" | "recording" | "review" | "denied";

export function VoiceRecorder({
  onCancel,
  onDone,
}: {
  onCancel: () => void;
  onDone: (r: Recording) => void;
}) {
  const [phase, setPhase] = useState<Phase>("starting");
  // Bumped by "Redo" to re-run the capture effect with a fresh stream.
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const peaksRef = useRef<number[]>([]);
  const startedAtRef = useRef(0);
  const lastPeakRef = useRef(0);
  const liveRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  /* ---------------- drawing ---------------- */

  const paint = useCallback((levels: number[], playedRatio = -1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const count = levels.length;
    const gap = 3;
    const barW = Math.max(2, (w - gap * (count - 1)) / count);
    const mid = h / 2;

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#8b5cf6");
    grad.addColorStop(0.5, "#f472b6");
    grad.addColorStop(1, "#22d3ee");

    for (let i = 0; i < count; i++) {
      const level = Math.min(1, levels[i]);
      const barH = Math.max(barW * 0.9, level * (h - 6));
      const x = i * (barW + gap);
      const y = mid - barH / 2;

      // Bars past the playhead dim out during preview playback.
      const played = playedRatio < 0 || i / count <= playedRatio;
      ctx.globalAlpha = played ? 1 : 0.22;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, barW / 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  /* ---------------- recording ---------------- */

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      void ctxRef.current.close();
    }
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType, audioBitsPerSecond: 32000 } : undefined,
        );
        recorderRef.current = recorder;
        chunksRef.current = [];
        peaksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const type = recorder.mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type });
          const duration = Math.round(((Date.now() - startedAtRef.current) / 1000) * 10) / 10;
          setRecording({
            blob,
            url: URL.createObjectURL(blob),
            duration,
            peaks: peaksRef.current.slice(),
            mimeType: type,
          });
          setPhase("review");
          cleanup();
        };

        const AudioCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioCtx = new AudioCtor();
        ctxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.72;
        source.connect(analyser);
        analyserRef.current = analyser;

        startedAtRef.current = Date.now();
        lastPeakRef.current = 0;
        recorder.start(200);
        setPhase("recording");

        const freq = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          const a = analyserRef.current;
          if (!a) return;
          a.getByteFrequencyData(freq);

          // Voice lives in the low bins — spread those across the bars so the
          // wave reacts to speech instead of sitting flat.
          const usable = Math.floor(freq.length * 0.55);
          const per = Math.max(1, Math.floor(usable / BAR_COUNT));
          const next: number[] = [];
          let sum = 0;
          for (let i = 0; i < BAR_COUNT; i++) {
            let band = 0;
            for (let j = 0; j < per; j++) band += freq[i * per + j] ?? 0;
            const v = band / per / 255;
            sum += v;
            // ease toward the new value so bars glide rather than flicker
            const prev = liveRef.current[i] ?? 0;
            next.push(prev + (Math.pow(v, 0.75) * 1.35 - prev) * 0.4);
          }
          liveRef.current = next;
          paint(next);

          const now = Date.now();
          const secs = (now - startedAtRef.current) / 1000;
          setElapsed(secs);
          if (now - lastPeakRef.current > 90) {
            lastPeakRef.current = now;
            peaksRef.current.push(Math.min(1, (sum / BAR_COUNT) * 2.4));
          }
          if (secs >= MAX_SECONDS) {
            stop();
            return;
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) setPhase("denied");
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      cleanup();
    };
  }, [cleanup, paint, stop, attempt]);

  /* ---------------- preview ---------------- */

  // Resample the envelope to the bar count so the preview keeps its shape.
  const previewLevels = useCallback(() => {
    const peaks = recording?.peaks ?? [];
    if (!peaks.length) return new Array(BAR_COUNT).fill(0.12);
    const out: number[] = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const from = Math.floor((i / BAR_COUNT) * peaks.length);
      const to = Math.max(from + 1, Math.floor(((i + 1) / BAR_COUNT) * peaks.length));
      let max = 0;
      for (let j = from; j < to; j++) max = Math.max(max, peaks[j] ?? 0);
      out.push(Math.max(0.1, max));
    }
    return out;
  }, [recording]);

  useEffect(() => {
    if (phase !== "review") return;
    // Only dim past the playhead while it's actually playing back.
    paint(previewLevels(), playing ? progress : -1);
  }, [phase, progress, playing, paint, previewLevels]);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function discard() {
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setProgress(0);
    onCancel();
  }

  /* ---------------- render ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-surface-2 via-surface to-bg"
      role="dialog"
      aria-label="Record a voice message"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-fg">
          {phase === "recording" && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          {phase === "starting" && "Waiting for the mic…"}
          {phase === "recording" && "Recording"}
          {phase === "review" && "Your message"}
          {phase === "denied" && "Mic unavailable"}
        </span>
        <button
          onClick={discard}
          aria-label="Cancel recording"
          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {phase === "denied" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-muted">
              <MicOff className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted">
              Your browser blocked microphone access. Allow it in the address
              bar, or type your message instead.
            </p>
            <button
              onClick={discard}
              className="mt-1 rounded-full border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-accent/50"
            >
              Type it instead
            </button>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="h-24 w-full"
              aria-hidden="true"
            />
            <p className="font-mono text-3xl font-semibold tabular-nums text-fg">
              {fmt(phase === "review" ? recording?.duration ?? 0 : elapsed)}
            </p>
            {phase === "recording" && (
              <p className="-mt-4 text-xs text-faint">
                Up to {MAX_SECONDS}s · tap stop when you&apos;re done
              </p>
            )}
          </>
        )}
      </div>

      {phase !== "denied" && (
        <div className="flex items-center justify-center gap-5 px-6 pb-7">
          {phase === "review" ? (
            <>
              <button
                onClick={() => {
                  if (recording) URL.revokeObjectURL(recording.url);
                  setRecording(null);
                  setProgress(0);
                  setPlaying(false);
                  setElapsed(0);
                  liveRef.current = new Array(BAR_COUNT).fill(0);
                  setPhase("starting");
                  setAttempt((a) => a + 1);
                }}
                className="flex flex-col items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-border">
                  <RotateCcw className="h-4 w-4" />
                </span>
                Redo
              </button>

              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play back"}
                className="grid h-14 w-14 place-items-center rounded-full border border-border bg-white/5 text-fg transition-colors hover:border-accent/50"
              >
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => recording && onDone(recording)}
                className="flex flex-col items-center gap-1.5 text-xs text-accent-2 transition-opacity hover:opacity-80"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white">
                  <Check className="h-5 w-5" />
                </span>
                Use it
              </button>
            </>
          ) : (
            <motion.button
              onClick={stop}
              disabled={phase !== "recording"}
              aria-label="Stop recording"
              whileTap={{ scale: 0.94 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-3 text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.8)] disabled:opacity-50"
            >
              <Square className="h-5 w-5 fill-current" />
            </motion.button>
          )}
        </div>
      )}

      {recording && (
        <audio
          ref={audioRef}
          src={recording.url}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (recording.duration) {
              setProgress(Math.min(1, el.currentTime / recording.duration));
            }
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
          className="hidden"
        />
      )}
    </motion.div>
  );
}
