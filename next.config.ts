import type { NextConfig } from "next";

/**
 * CI sets NEXT_OUTPUT=export to produce the static bundle GitHub Pages serves
 * (written to `out/`). Locally the flag is unset, so `npm run dev` and
 * `npm run build` behave normally and the API routes keep working.
 */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        // Pages has no image optimiser, so ship the originals.
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
