import type { Metadata } from "next";
import { Window } from "@/components/Window";
import { ResetForm } from "@/components/admin/ResetForm";
import { storeConfigured } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reset password", referrer: "no-referrer" };

export default async function Reset({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="door-stage flex items-start justify-center">
      <Window title="Reset password" className="w-full max-w-[440px] lg:self-center">
        <div className="px-7 pt-7 pb-8">
          <h1 className="display text-[44px]">{token ? "New password" : "Forgot password"}</h1>
          {storeConfigured ? (
            <ResetForm token={typeof token === "string" ? token : ""} />
          ) : (
            <p className="muted mt-4 text-[14px]">The admin area isn&apos;t switched on yet: its storage hasn&apos;t been connected.</p>
          )}
        </div>
      </Window>
    </div>
  );
}
