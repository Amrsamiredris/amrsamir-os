import { Shell } from "@/components/Shell";
import { getSite } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <Shell name={site.name} availability={site.availability}>
      {children}
    </Shell>
  );
}
