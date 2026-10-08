import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";
import { DOORS } from "@/lib/doors";

export const alt = "Amr Samir Edris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const s = await getSite();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#e3e6ed",
          backgroundImage: "radial-gradient(rgba(42,46,55,0.28) 1.5px, transparent 1.6px)",
          backgroundSize: "12px 12px",
          color: "#15161a",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>amrsamir.me</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>{s.name}</div>
          <div style={{ fontSize: 38, marginTop: 24, maxWidth: 1000, lineHeight: 1.25 }}>{s.headline}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {Object.values(DOORS).map((d) => (
            <div key={d.slug} style={{ display: "flex", padding: "10px 22px", borderRadius: 14, background: d.color, color: "#fff", fontSize: 28, fontWeight: 700 }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
