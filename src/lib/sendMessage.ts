import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export type OutgoingMessage = {
  name: string;
  email: string;
  reason: string;
  /** Typed message. Omitted when the visitor recorded instead. */
  text?: string;
  audio?: { blob: Blob; duration: number; mimeType: string } | null;
};

function extensionFor(mimeType: string) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

/**
 * Sends a visitor's message straight to the inbox.
 *
 * Text goes through EmailJS's plain `send()`. A voice note has to go through
 * `sendForm()` instead — EmailJS only picks up attachments from a real <form>
 * element, so we build a throwaway one, populate a file input via DataTransfer,
 * and tear it down afterwards.
 */
export async function sendMessage(payload: OutgoingMessage) {
  if (!emailConfigured) throw new Error("not-configured");

  const summary = payload.text?.trim()
    ? payload.text.trim()
    : `🎙️ Voice message (${formatDuration(payload.audio?.duration ?? 0)}) — attached to this email.`;

  const fields: Record<string, string> = {
    from_name: payload.name,
    reply_to: payload.email,
    reason: payload.reason,
    message: `Reason: ${payload.reason}\n\n${summary}`,
  };

  if (!payload.audio) {
    await emailjs.send(SERVICE_ID!, TEMPLATE_ID!, fields, {
      publicKey: PUBLIC_KEY!,
    });
    return;
  }

  const form = document.createElement("form");
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  const file = new File(
    [payload.audio.blob],
    `voice-message.${extensionFor(payload.audio.mimeType)}`,
    { type: payload.audio.mimeType },
  );
  const transfer = new DataTransfer();
  transfer.items.add(file);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "voice";
  fileInput.files = transfer.files;
  form.appendChild(fileInput);

  document.body.appendChild(form);
  try {
    await emailjs.sendForm(SERVICE_ID!, TEMPLATE_ID!, form, {
      publicKey: PUBLIC_KEY!,
    });
  } finally {
    form.remove();
  }
}
