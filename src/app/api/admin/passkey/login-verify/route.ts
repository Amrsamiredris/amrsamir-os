import { verifyAuthenticationResponse, type AuthenticationResponseJSON } from "@simplewebauthn/server";
import { guard, json, readJson, takeChallenge } from "@/lib/admin/api";
import { alert } from "@/lib/admin/notify";
import { listPasskeys, rp, savePasskeys } from "@/lib/admin/passkeys";
import { audit, clientInfo, createSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  const info = await clientInfo();
  const body = await readJson(req);
  const response = body?.response as AuthenticationResponseJSON | undefined;
  const challenge = await takeChallenge();
  if (!response || !challenge) return json(400, { error: "That took too long. Try again." });

  const keys = await listPasskeys();
  const key = keys.find((k) => k.id === response.id);
  if (!key) {
    await audit("Unknown passkey", info);
    return json(401, { error: "This device's passkey isn't registered here." });
  }
  const { rpID, origin } = await rp();
  try {
    const v = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: { id: key.id, publicKey: Buffer.from(key.publicKey, "base64url"), counter: key.counter, transports: key.transports },
    });
    if (!v.verified) throw new Error("not verified");
    key.counter = v.authenticationInfo.newCounter;
    key.lastUsedAt = Date.now();
    await savePasskeys(keys);
  } catch {
    await audit("Passkey check failed", info);
    return json(401, { error: "Fingerprint check failed. Try again." });
  }
  await createSession("passkey");
  await alert("New sign-in with fingerprint", `Signed in to amrsamir.me admin with passkey "${key.name}".\nIP: ${info.ip}`);
  return json(200, { ok: true });
}
