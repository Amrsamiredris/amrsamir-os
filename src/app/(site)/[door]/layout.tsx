import { notFound } from "next/navigation";
import { Window } from "@/components/Window";
import { DoorSidebar } from "@/components/DoorSidebar";
import { DOOR_SLUGS, DOORS, isDoor } from "@/lib/doors";
import { getDoor } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return DOOR_SLUGS.map((door) => ({ door }));
}

export default async function DoorLayout({ children, params }: LayoutProps<"/[door]">) {
  const { door } = await params;
  if (!isDoor(door)) notFound();
  const content = await getDoor(door);
  return (
    <div className="door-stage">
      <Window
        title={content.title}
        className="door-win"
        closeHref="/"
        closeLabel={`Close ${DOORS[door].label} and go back to the desktop`}
      >
        <div className="door-grid">
          <DoorSidebar door={door} label={DOORS[door].label} />
          <div className="door-scroll" tabIndex={0} aria-label={`${DOORS[door].label} content`}>
            <div className="door-content">{children}</div>
          </div>
        </div>
      </Window>
    </div>
  );
}
