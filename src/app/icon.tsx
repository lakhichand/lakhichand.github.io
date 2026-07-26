import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

// Emitted as a file at build time so it survives `output: "export"`.
export const dynamic = "force-static";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Branded favicon: your initials on a violet→pink gradient tile.
export default function Icon() {
  const initials = site.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 700,
          color: "white",
          background: "linear-gradient(135deg,#8b5cf6,#f472b6)",
          borderRadius: 14,
          fontFamily: "sans-serif",
        }}
      >
        {initials}
      </div>
    ),
    { ...size },
  );
}
