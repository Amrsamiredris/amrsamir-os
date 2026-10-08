import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource/silkscreen/400.css";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://amrsamir.me"),
  title: {
    default: "Amr Samir Edris",
    template: "%s · Amr Samir Edris",
  },
  description: "Events, marketing and tech. Amr Samir Edris, UAE.",
  openGraph: { siteName: "Amr Samir Edris", type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e3e6ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1014" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
