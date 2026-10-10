import { guard, json } from "@/lib/admin/api";
import { revokeAll } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const bad = await guard({ auth: true });
  if (bad) return bad;
  await revokeAll();
  return json(200, { ok: true });
}
