import type { Metadata } from "next";
import { Wallpaper } from "@/components/Wallpaper";
import { OwnerFlag } from "@/components/admin/OwnerFlag";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell" data-door="home">
      <Wallpaper />
      <OwnerFlag />
      <main id="main" className="site-main">
        {children}
      </main>
    </div>
  );
}
