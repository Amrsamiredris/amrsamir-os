import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Window } from "@/components/Window";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/admin/session";
import { store, storeConfigured } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  let hasPassword = false;
  let hasPasskeys = false;
  if (storeConfigured) {
    if (await getSession()) redirect(safeNext);
    hasPassword = Boolean(await store().get("admin:password"));
    hasPasskeys = Boolean((await store().get<unknown[]>("admin:passkeys"))?.length);
  }
  return (
    <div className="door-stage flex items-start justify-center">
      <Window title="Sign in" className="w-full max-w-[440px] lg:self-center">
        <div className="px-7 pt-7 pb-8">
          <h1 className="display text-[44px]">Admin</h1>
          {!storeConfigured ? (
            <p className="muted mt-4 text-[14px]">The admin area isn&apos;t switched on yet: its storage hasn&apos;t been connected.</p>
          ) : !hasPassword ? (
            <p className="muted mt-4 text-[14px]">
              Not set up yet. <Link className="underline underline-offset-4" href="/admin/setup">Set up the admin</Link> with your one-time setup code.
            </p>
          ) : (
            <LoginForm next={safeNext} hasPasskeys={hasPasskeys} />
          )}
        </div>
      </Window>
    </div>
  );
}
