# Lakhichand Borse — Portfolio

Personal portfolio of a backend & ERP engineer. Dark, animated, mobile-first,
and accessible — with a 3D hero, a scroll-linked timeline, and an assistant that
takes messages by voice or text.

**Live:** https://lakhichand.github.io

---

## Features

- **3D hero** — a distorted crystal and particle field rendered with React Three
  Fiber, masked so it never competes with the headline. Falls back to a static
  gradient when the visitor prefers reduced motion.
- **Scroll-aware navigation** — reading-progress bar plus a pill that slides
  between sections as you scroll.
- **Animated timeline** — experience and education on a track that fills as you
  scroll past it.
- **Project cards** — per-project monogram, tilt on hover, and a cursor-following
  spotlight.
- **Assistant** — a floating chat widget that answers common recruiter questions
  instantly from the site's own content, at zero API cost.
- **Voice messages** — visitors can leave a message by talking instead of typing.
  Live waveform, playback, re-record, then it's emailed as an attachment.
- **Accessible by default** — honours `prefers-reduced-motion`, visible focus
  rings, semantic headings, ARIA labels, and 44px touch targets.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| 3D | React Three Fiber + drei |
| Motion | Framer Motion |
| Icons | lucide-react + inline brand SVGs |
| Email | EmailJS (client-side, no backend) |
| Hosting | GitHub Pages (static export) |

## Getting started

Requires Node 18.18 or newer — built and tested on Node 22.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing the content

**Everything lives in one file: [`src/lib/content.ts`](src/lib/content.ts).**
Name, role, pitch, skills, experience, projects, achievements, social links and
the assistant's replies are all defined there. SEO tags, the sitemap, the OG
image and the favicon initials are derived from it — no component edits needed.

| What | Where |
|---|---|
| Photo | Add to `public/`, then replace the monogram block in `src/components/sections/About.tsx` |
| Resume | Set `site.resumePath` — a file in `public/` or a full URL (external links open in a new tab) |
| Project images | Add to `public/`, then set `image:` on that project |
| Domain | Set `site.url` so canonical URLs, sitemap and Open Graph stay correct |

## Environment variables

Copy the template and fill in what you need:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

Until these are set, the contact form and the assistant both show a friendly
"email me directly" fallback rather than failing silently.

> EmailJS keys are `NEXT_PUBLIC_*` by design — they ship to the browser and are
> meant to be public. Spam is handled with a hidden honeypot field; add domain
> restrictions in the EmailJS dashboard for more protection.

### Contact form setup

1. Create a free account at [emailjs.com](https://www.emailjs.com) (200 emails/month).
2. **Email Services** → connect your inbox → copy the **Service ID**.
3. **Email Templates** → new template using `{{from_name}}`, `{{reply_to}}`,
   `{{message}}` and optionally `{{reason}}`. Set **To** to your address and
   **Reply-To** to `{{reply_to}}` → copy the **Template ID**.
4. **Attachments** tab → add a **Variable Attachment** named `voice`. Without
   this, voice notes arrive as text only and the audio is dropped.
5. **Account → General** → copy the **Public Key**.

Recording needs a secure context: it works on `localhost` and over HTTPS, but
not over plain HTTP on a LAN address.

### Optional: AI replies

The assistant answers its suggested questions from local content with no API
call. Free-text questions can be answered by Claude if you set a key:

```
ANTHROPIC_API_KEY=sk-ant-...     # server-side only, never sent to the browser
ANTHROPIC_MODEL=claude-haiku-4-5
```

This needs a server, so it does **not** work on GitHub Pages — deploy to Vercel
or similar. On a static host the assistant falls back to its built-in answers.

## Deployment

The site is published to GitHub Pages as a static export committed to
[`docs/`](docs), with **Settings → Pages** set to branch `main`, folder `/docs`.

Because GitHub Pages serves static files only, the export excludes the API
routes (`src/app/api/**`) — the AI chat endpoint is unavailable there. Everything
else, including the contact form and the voice recorder, works normally.

For a deployment with the API routes intact, use Vercel: import the repository
and add the same environment variables.

## Project structure

```
src/
  app/           App Router pages, layout, metadata, API routes
  components/
    hero/        3D canvas + hero section
    sections/    About, Capabilities, Experience, Projects, Achievements, Contact
    chat/        Assistant widget, mascot, voice recorder
    ui/          Reveal animations, section headings, brand icons
  lib/
    content.ts   All site content
    sendMessage.ts  EmailJS delivery for text and voice
docs/            Static export served by GitHub Pages
```

## Licence

Content and design are personal to Lakhichand Borse. The code is available for
reference and learning.
