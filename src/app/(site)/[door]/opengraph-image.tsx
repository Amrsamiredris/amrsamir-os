import { ImageResponse } from "next/og";
import { getDoor } from "@/lib/content";
import { DOORS, DOOR_SLUGS, type DoorSlug } from "@/lib/doors";

export const alt = "Amr Samir Edris";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return DOOR_SLUGS.map((door) => ({ door }));
}

export default async function Image({ params }: { params: Promise<{ door: string }> }) {
  const { door } = (await params) as { door: DoorSlug };
  const d = DOORS[door];
  const c = await getDoor(door);
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
          background: d.color,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px)",
          backgroundSize: "12px 12px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, opacity: 0.9 }}>amrsamir.me/{door}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>{c.title}</div>
          <div style={{ fontSize: 40, marginTop: 20, maxWidth: 950, lineHeight: 1.2 }}>{c.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>Amr Samir Edris</div>
      </div>
    ),
    size,
  );
}
