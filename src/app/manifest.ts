import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.name.split(" ")[0],
    description: site.pitch,
    start_url: "/",
    display: "standalone",
    background_color: "#07070b",
    theme_color: "#07070b",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
    ],
  };
}
