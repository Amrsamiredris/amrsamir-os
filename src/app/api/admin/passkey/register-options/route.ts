import { generateRegistrationOptions } from "@simplewebauthn/server";
import { guard, json, saveChallenge } from "@/lib/admin/api";
import { listPasskeys, rp } from "@/lib/admin/passkeys";

export const dynamic = "force-dynamic";

export async function POST() {
  const bad = await guard({ auth: true });
  if (bad) return bad;
  const { rpID, rpName } = await rp();
  const keys = await listPasskeys();
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: "amr",
    userDisplayName: "Amr Samir Edris",
    userID: new TextEncoder().encode("amrsamir-admin"),
    attestationType: "none",
    excludeCredentials: keys.map((k) => ({ id: k.id, transports: k.transports })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  await saveChallenge(options.challenge);
  return json(200, { options });
}
