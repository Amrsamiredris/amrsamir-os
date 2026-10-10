import { guard, json } from "@/lib/admin/api";
import { destroySession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  await destroySession();
  return json(200, { ok: true });
}
