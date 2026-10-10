import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { guard, json, readJson, takeChallenge } from "@/lib/admin/api";
import { alert } from "@/lib/admin/notify";
import { listPasskeys, rp, savePasskeys } from "@/lib/admin/passkeys";
import { audit, clientInfo } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: true });
  if (bad) return bad;
  const body = await readJson(req);
  const response = body?.response as RegistrationResponseJSON | undefined;
  const name = String(body?.name ?? "").trim().slice(0, 40) || "My device";
  const challenge = await takeChallenge();
  if (!response || !challenge) return json(400, { error: "That took too long. Try again." });
  const { rpID, origin } = await rp();
  try {
    const v = await verifyRegistrationResponse({ response, expectedChallenge: challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
    if (!v.verified) throw new Error("not verified");
    const c = v.registrationInfo.credential;
    const keys = await listPasskeys();
    if (keys.length >= 10) return json(400, { error: "Remove an old device first (10 max)." });
    keys.push({ id: c.id, publicKey: Buffer.from(c.publicKey).toString("base64url"), counter: c.counter, transports: c.transports, name, createdAt: Date.now() });
    await savePasskeys(keys);
  } catch {
    return json(400, { error: "Couldn't save the fingerprint. Try again." });
  }
  const info = await clientInfo();
  await audit(`Passkey added: ${name}`, info);
  await alert("New fingerprint device added", `Passkey "${name}" was added to amrsamir.me admin from IP ${info.ip}. Not you? Remove it in Admin > Security.`);
  return json(200, { ok: true });
}
