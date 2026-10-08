import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";

export const metadata = { title: "Content editor", robots: { index: false, follow: false } };

/** In production the editor only exists when GitHub storage is configured (sign-in protected). */
export default function Layout() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github") notFound();
  return <KeystaticApp />;
}
