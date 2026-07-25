import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1000px 500px at 10% -10%, #2a1a5e 0%, transparent 60%), radial-gradient(900px 500px at 100% 20%, #0e3b52 0%, transparent 55%), #07070b",
          color: "#ecebf5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#22d3ee",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 40, height: 3, background: "#22d3ee" }} />
          {site.role}
        </div>

        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            marginTop: 24,
            lineHeight: 1.05,
            background: "linear-gradient(100deg,#a78bfa,#f472b6,#22d3ee)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            fontSize: 34,
            marginTop: 24,
            color: "#a2a1b5",
            maxWidth: 900,
          }}
        >
          {site.pitch}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 24,
            color: "#6f6e85",
          }}
        >
          {site.location}
        </div>
      </div>
    ),
    { ...size },
  );
}
