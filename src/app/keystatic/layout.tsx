import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";
import { keystaticEnabled } from "@/lib/keystatic-enabled";

export const metadata = { title: "Content editor", robots: { index: false, follow: false } };

/** In production the editor only exists when GitHub storage is configured (sign-in protected). */
export default function Layout() {
  if (!keystaticEnabled) notFound();
  return <KeystaticApp />;
}
