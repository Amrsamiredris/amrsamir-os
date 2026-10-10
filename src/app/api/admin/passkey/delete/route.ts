import { guard, json, readJson } from "@/lib/admin/api";
import { listPasskeys, savePasskeys } from "@/lib/admin/passkeys";
import { audit, clientInfo } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: true });
  if (bad) return bad;
  const id = String((await readJson(req))?.id ?? "");
  const keys = await listPasskeys();
  const gone = keys.find((k) => k.id === id);
  if (!gone) return json(404, { error: "Not found." });
  await savePasskeys(keys.filter((k) => k.id !== id));
  await audit(`Passkey removed: ${gone.name}`, await clientInfo());
  return json(200, { ok: true });
}
