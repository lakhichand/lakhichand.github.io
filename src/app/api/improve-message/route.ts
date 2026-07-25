import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Default model per the Claude API guidance. For this short, simple rewrite you
// can set ANTHROPIC_MODEL=claude-haiku-4-5 in your env to cut cost/latency.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const MAX_INPUT_CHARS = 2000;

// Best-effort in-memory rate limit (per warm serverless instance). Not a hard
// guarantee — see README for platform-level limits on a public endpoint.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { count: number; start: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

const SYSTEM = `You are a writing assistant that polishes a short message a visitor is about to send through a personal portfolio contact form.
Rewrite the message so it is clear, correct, and warmly professional:
- Fix grammar, spelling, and punctuation; improve flow and clarity.
- Keep it concise and in the sender's first-person voice.
- Preserve the original meaning and intent. Do NOT invent facts, names, links, or details that are not present.
- Do not add a subject line, greeting, or signature unless the original already has one.
Return ONLY the improved message text — no preamble, quotes, or commentary.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Feature is dormant until a key is added — the UI hides the button on 503.
    return Response.json(
      { error: "not_configured" },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let message: unknown;
  try {
    ({ message } = await req.json());
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  if (message.length > MAX_INPUT_CHARS) {
    return Response.json({ error: "too_long" }, { status: 413 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Polish this contact-form message:\n\n"""\n${message}\n"""`,
        },
      ],
    });

    const improved = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!improved) {
      return Response.json({ error: "no_output" }, { status: 502 });
    }
    return Response.json({ improved });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "auth" }, { status: 500 });
    }
    console.error("improve-message error:", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
