/**
 * Single source of truth for all site content.
 * Edit this file to update your portfolio — nothing else needs to change.
 */

export const site = {
  name: "Lakhichand Borse",
  role: "Software Engineer",
  // Short label under the name in the hero
  tagline: "Backend & ERP Engineer · Python · PostgreSQL",
  pitch:
    "I build scalable backend systems and enterprise ERP solutions that stay fast, reliable, and rock-solid in production.",
  location: "Gandhinagar, Gujarat, India",
  // Public contact email (pulled from your resume — change if you prefer a different one)
  email: "Lakhichand2000@gmail.com",
  phone: "+91 9075538847",
  // Used for SEO canonical URL, sitemap, and Open Graph. Update once you have a domain.
  url: "https://lakhichand.github.io",
  // Resume. Either a file in /public ("/resume.pdf") or a full URL — the button
  // detects which and opens external links in a new tab instead of downloading.
  resumePath:
    "https://drive.google.com/file/d/1a5xXhr7mIUmWj5nFjLCDk2-K9oBa0CBY/view",
  // Portrait shown in the About section. Drop the file in /public.
  // Leave as an empty string to fall back to the initials monogram.
  photo: "/profile.jpg",
  availability: "Open to backend / full-stack roles",
  // Typical turnaround shown on the contact card.
  responseTime: "Usually replies within a day",
} as const;

/**
 * Words that cycle in the hero, one at a time, under the name.
 * Keep them short — they animate in place.
 */
export const heroRoles: string[] = [
  "Backend Engineer",
  "ERP Specialist",
  "Python Developer",
  "Problem Solver",
];

/** Three-at-a-glance numbers under the hero CTAs. Keep to three. */
export const heroStats: { value: string; label: string }[] = [
  { value: "3+", label: "Years shipping" },
  { value: "500+", label: "DSA problems" },
  { value: "100+", label: "Bugs squashed" },
];

export const socials = {
  github: "https://github.com/lakhichand",
  linkedin: "https://www.linkedin.com/in/lakhichand-borse-679316226/",
  leetcode: "https://leetcode.com/u/Lakhichand1377/",
  // twitter: "https://x.com/yourhandle", // add if you have one
} as const;

export const about = {
  heading: "About",
  // 2–3 short paragraphs.
  paragraphs: [
    "I'm a Software Engineer with 3+ years of experience designing, developing, and maintaining scalable backend systems and enterprise ERP solutions in Python and PostgreSQL.",
    "At Odoo I ship clean, maintainable code across the full SDLC — building and integrating APIs, optimizing ORM queries, and resolving critical production issues through structured root-cause analysis for enterprise customers worldwide.",
    "I have a strong foundation in data structures, algorithms, OOP, performance tuning, and memory management, and I care about writing software that's reliable, well-tested, and a pleasure to maintain.",
  ],
};

/** Compact facts shown beside the photo in the About section. */
export const quickFacts: { label: string; value: string }[] = [
  { label: "Experience", value: "3+ years" },
  { label: "Currently", value: "Software Engineer @ Odoo" },
  { label: "Focus", value: "Backend · ERP · PostgreSQL" },
  { label: "Based in", value: "Gandhinagar, India" },
];

/**
 * "What I do" — the three things I'm hired for, in plain language.
 * `icon` maps to a lucide icon name in the Capabilities component.
 */
export type Capability = {
  icon: "server" | "boxes" | "gauge";
  title: string;
  description: string;
  bullets: string[];
};

export const capabilities: Capability[] = [
  {
    icon: "boxes",
    title: "ERP & Odoo",
    description:
      "Custom modules and version upgrades across SaaS, on-premise, and Odoo.sh environments.",
    bullets: ["Custom module development", "One-on-one migrations", "Sales · Inventory · Accounting"],
  },
  {
    icon: "gauge",
    title: "Performance & Debugging",
    description:
      "Slow queries traced to their source and production incidents closed with a real root cause.",
    bullets: [
      "ORM & SQL query tuning",
      "Data handling & analysis",
      "Log analysis on Linux",
      "Root-cause investigation",
    ],
  },
  {
    icon: "server",
    title: "Backend Engineering",
    description:
      "Business logic built to survive real traffic, real data, and real deadlines.",
    bullets: [
      "Strong logic & problem-solving",
      "Python services",
      "Clean, tested, reviewable code",
    ],
  },
];

/** Skills grouped by category — rendered as an animated tag grid. */
export const skills: { category: string; items: string[] }[] = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "Java"],
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MySQL", "SQL", "ORM Optimization", "DB Migrations"],
  },
  {
    category: "DevOps & Tools",
    items: ["Git", "GitHub", "CI/CD", "Docker", "Odoo.sh"],
  },
  {
    category: "Editors & IDEs",
    items: ["VS Code", "GitHub Copilot", "Sublime Text", "PyCharm"],
  },
  {
    category: "Core Concepts",
    items: [
      "Data Structures & Algorithms",
      "OOP",
      "Debugging",
      "Agile / Scrum",
      "Code Reviews",
    ],
  },
  {
    category: "LLM & API Workflows",
    items: ["Claude", "ChatGPT", "API Integration"],
  },
];

export type ExperienceItem = {
  company: string;
  title: string;
  location: string;
  period: string;
  kind: "work" | "education";
  points: string[];
};

/** Chronological journey — newest first — rendered as an animated vertical timeline. */
export const experience: ExperienceItem[] = [
  {
    company: "Odoo",
    title: "Software Engineer",
    location: "Gandhinagar, Gujarat",
    period: "Jan 2024 — Present",
    kind: "work",
    points: [
      "Developed and customized enterprise Odoo applications for clients across multiple industries, building custom modules using Python, the Odoo ORM, PostgreSQL, XML, and JavaScript.",
      "Customized standard Odoo reports and ensured module compatibility (Sales, Purchase, Inventory, CRM, Accounting, Manufacturing), including workflow automation, security configuration, and UI improvements.",
      "Managed multiple ERP environments (Odoo SaaS, On-Premise, Odoo.sh) and legacy systems; automated migration processes and provided end-to-end, one-on-one migration support through each customer's transition to the new version.",
      "Reviewed team members' upgrade code and merged it under dedicated contracts, ensuring customer databases remained stable throughout one-on-one migrations.",
      "Built internal Python helper utilities for recurring tasks, reducing time spent on repetitive failure patterns and surfacing process-improvement opportunities across the team.",
      "Delivered clean, maintainable, and efficient backend code across the full SDLC, collaborating within Agile teams and supporting version upgrades.",
    ],
  },
  {
    company: "Odoo",
    title: "Software Engineer Intern",
    location: "Gandhinagar, Gujarat",
    period: "Jul 2023 — Jan 2024",
    kind: "work",
    points: [
      "Worked within the R&D team resolving tickets from Belgium HQ on Planning, Timesheet, and Project modules in a fast-paced, distributed Agile environment.",
      "Optimized SQL queries and Python backend logic via Odoo shell; used Linux tooling for log analysis, significantly reducing menu load times.",
    ],
  },
  {
    company: "Testyantra Software Solution",
    title: "Apprentice Trainee",
    location: "Pune, Maharashtra",
    period: "Jan 2022 — Jun 2022",
    kind: "work",
    points: [
      "Collaborated with QA teams to design test plans and cases; validated releases applying structured SDLC and QA best practices.",
    ],
  },
  {
    company: "Savitribai Phule Pune University",
    title: "B.E. Mechanical Engineering",
    location: "Pune, Maharashtra",
    period: "2019 — 2022",
    kind: "education",
    points: ["GPA: 8.5 / 10.0"],
  },
  {
    company: "Maharashtra State Board of Technical Education",
    title: "Diploma in Engineering",
    location: "Maharashtra",
    period: "2016 — 2019",
    kind: "education",
    points: ["73.82 / 100%"],
  },
];

export type Project = {
  name: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  repoUrl?: string;
  // Optional image path in /public. Falls back to a generated gradient if omitted.
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "Real Estate Management System",
    description:
      "A full-scale ERP solution automating property listings, leads, sales pipeline, bookings, contracts, and analytics — with backend logic, optimized ORM queries, and dynamic UI components.",
    tech: ["Python", "PostgreSQL", "Odoo ORM", "XML", "OWL"],
    // repoUrl: "https://github.com/lakhichand/...", // add if public
    featured: true,
  },
  {
    name: "Job Portal",
    description:
      "A job board connecting seekers and recruiters — browse and apply to roles, post and manage listings, with authentication and role-based dashboards.",
    tech: ["Python", "Django", "PostgreSQL", "Bootstrap"],
    // liveUrl: "https://...",
    // repoUrl: "https://github.com/lakhichand/...",
  },
  {
    name: "NGO Website",
    description:
      "A responsive website for a non-profit — donations, volunteer sign-ups, events, and an admin panel to manage content, all optimized for mobile.",
    tech: ["React", "Next.js", "Tailwind CSS"],
    // liveUrl: "https://...",
    // repoUrl: "https://github.com/lakhichand/...",
  },
  {
    name: "Sorting Algorithm Visualizer",
    description:
      "A real-time web app that visualizes sorting algorithms with adjustable speed controls — demonstrating data structures, algorithms, and clean object-oriented design.",
    tech: ["JavaScript", "HTML", "CSS"],
    // liveUrl: "https://...",
    // repoUrl: "https://github.com/lakhichand/...",
  },
  {
    name: "Wordle Clone",
    description:
      "A browser word-guessing game — daily puzzles, on-screen keyboard input, and win/streak tracking. A fun, polished take on the classic. 🎯",
    tech: ["JavaScript", "React", "CSS"],
    // liveUrl: "https://...",
    // repoUrl: "https://github.com/lakhichand/...",
  },
];

export type Achievement = {
  // The number to count up to. Use `suffix` for things like "+" or "%".
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export const achievements: Achievement[] = [
  { value: 3, suffix: "+", label: "Years building production backends" },
  { value: 500, suffix: "+", label: "DSA problems solved" },
  {
    value: 100,
    suffix: "+",
    label: "Bugs fixed across Odoo core, community, enterprise & upgrade",
  },
];

/**
 * Highlighted badges shown alongside the counters.
 * `icon` maps to a lucide icon in Achievements.tsx — emoji don't scale, don't
 * inherit colour, and render differently on every OS.
 */
export const badges: { icon: "trophy" | "zap" | "brain"; label: string }[] = [
  { icon: "trophy", label: "Best Performer at Odoo" },
  { icon: "zap", label: "Production reliability specialist" },
  { icon: "brain", label: "500+ problems on LeetCode / GfG / HackerRank" },
];

/** One-tap opener suggestions shown as chips above the contact message box. */
export const messageSuggestions: { label: string; text: string }[] = [
  {
    label: "👋 Just saying hi",
    text: "Hi Lakhichand! I came across your portfolio and wanted to say hello. ",
  },
  {
    label: "💼 A role for you",
    text: "Hi Lakhichand, we have a backend / full-stack opening I think you'd be a great fit for. Would you be open to a quick chat?",
  },
  {
    label: "🤝 Let's collaborate",
    text: "Hi Lakhichand, I'm working on a project and would love to collaborate. Here's what I have in mind: ",
  },
  {
    label: "❓ Quick question",
    text: "Hi Lakhichand, I had a quick question about your work at Odoo — ",
  },
];

/**
 * Greeter chatbot config. The suggestion answers are canned (built from the
 * data above) so the bot is useful instantly with zero API cost. Free-text
 * questions are answered by Claude when the AI feature is enabled.
 */
export type ChatSuggestion = {
  q: string; // the label shown on the chip
  a?: string; // instant canned reply (works with no API cost)
  scrollTo?: string; // optional section id to jump to, e.g. "#projects"
};

export const assistant = {
  name: `${site.name.split(" ")[0]}'s Assistant`,
  greeting: `Hi! 👋 I'm ${site.name.split(" ")[0]}'s assistant. Tap a question below, or jump straight to a section of the site.`,
  // One-tap conversation starters for recruiters / reviewers.
  // Some answer instantly; some scroll the visitor to the right section.
  suggestions: [
    {
      q: "What are his top skills?",
      a: "He's a backend-focused Software Engineer. Core stack: Python, PostgreSQL, REST APIs and the Odoo framework — plus JavaScript, Docker, Git/CI-CD, and a strong DSA/OOP foundation (500+ problems solved).",
    },
    {
      q: "Is he open to work?",
      a: `Yes — he's open to backend / full-stack roles. The quickest way to reach him is the contact form on this page, or email ${site.email}.`,
    },
    {
      q: "🧭 View his journey",
      scrollTo: "#experience",
      a: "Sure — taking you to his experience & education timeline. 👇",
    },
    {
      q: "📁 Show his projects",
      scrollTo: "#projects",
      a: "Here are the projects he's built. 👇",
    },
    {
      q: "📊 See his impact",
      scrollTo: "#achievements",
      a: "Taking you to the numbers. 👇",
    },
    {
      q: "✉️ How to contact him",
      a: `Email ${site.email}, call ${site.phone}, or find him on GitHub as @lakhichand and on LinkedIn as Lakhichand Borse. There's a contact form right here on the site too.`,
    },
  ] as ChatSuggestion[],
  // Label for the chip that re-opens the full question list at any time.
  menuLabel: "💬 Show all questions",
  // Reply used for free-text questions when the AI backend isn't configured.
  offlineReply: `Good question! I can only share what's here on the site, so for anything more specific you'll want to reach ${site.name.split(" ")[0]} directly — email ${site.email} or use the contact form below. Meanwhile, here are things I can help with right now:`,
};

/**
 * Copy for the assistant's guided "leave a message" flow. The bot walks a
 * visitor through name → reason → email → message (typed or recorded), then
 * emails it straight through — no page change needed.
 */
export const messageFlow = {
  entryLabel: "✉️ Leave a message",
  intro: `Happy to take a message — it goes straight to ${site.name.split(" ")[0]}'s inbox. First up: what's your name?`,
  askName: "What's your name?",
  askReason: "Nice to meet you, {name}! What's this about?",
  reasons: [
    "💼 A role / hiring",
    "🤝 Project or collaboration",
    "❓ A quick question",
    "👋 Just saying hi",
  ],
  askEmail: "Got it. What email should he reply to?",
  askMode:
    "Last bit — how do you want to leave your message? Type it, or just talk and I'll attach the recording.",
  typePrompt: "Go ahead — type your message below.",
  reviewIntro: "Here's what I'll send. Look right?",
  manualHint: "Prefer the full contact form? I can take you there instead.",
  manualLabel: "📝 Use the contact form",
  sent: "Sent! ✅ It's in his inbox with your details — he usually replies within a day.",
  invalidEmail: "Hmm, that doesn't look like an email address. Mind trying again?",
  invalidName: "I didn't quite catch that — what should I call you?",
  emptyMessage: "Looks empty! Type something, or record a voice note instead.",
  notConfigured:
    "The mail bridge isn't switched on for this deployment yet. Your details are safe here though — let me take you to the contact form.",
  failed:
    "That didn't go through, sorry. Let me take you to the contact form so nothing gets lost.",
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Journey", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Impact", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];
