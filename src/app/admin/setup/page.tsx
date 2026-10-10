import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Window } from "@/components/Window";
import { SetupForm } from "@/components/admin/SetupForm";
import { store, storeConfigured } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set up" };

export default async function Setup() {
  if (!storeConfigured || !process.env.ADMIN_SETUP_TOKEN || (await store().get("admin:password"))) redirect("/admin/login");
  return (
    <div className="door-stage flex items-start justify-center">
      <Window title="Set up admin" className="w-full max-w-[480px] lg:self-center">
        <div className="px-7 pt-7 pb-8">
          <h1 className="display text-[40px]">Set up</h1>
          <p className="muted mt-3 text-[14px]">One time only. Enter the setup code, then choose your admin password. Next you&apos;ll add your fingerprint.</p>
          <SetupForm />
        </div>
      </Window>
    </div>
  );
}
