import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// Emitted as a file at build time so it survives `output: "export"`.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
