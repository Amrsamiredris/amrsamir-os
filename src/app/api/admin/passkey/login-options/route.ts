import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { guard, json, saveChallenge } from "@/lib/admin/api";
import { listPasskeys, rp } from "@/lib/admin/passkeys";
import { limited } from "@/lib/admin/ratelimit";
import { clientInfo } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const bad = await guard({ auth: false });
  if (bad) return bad;
  if (await limited(`pk-login:${(await clientInfo()).ip}`, 20, 900)) return json(429, { error: "Too many attempts. Try again later." });
  const keys = await listPasskeys();
  if (!keys.length) return json(404, { error: "No fingerprint is set up yet. Sign in with your password, then add one in Security." });
  const { rpID } = await rp();
  const options = await generateAuthenticationOptions({ rpID, userVerification: "required", allowCredentials: [] });
  await saveChallenge(options.challenge);
  return json(200, { options });
}
