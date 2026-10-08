import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  const s = await getSite();
  const [first, ...rest] = s.name.split(" ");
  const esc = (v: string) => v.replace(/([,;\\])/g, "\\$1");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(rest.join(" "))};${esc(first)};;;`,
    `FN:${esc(s.name)}`,
    s.email && `EMAIL;TYPE=INTERNET:${s.email}`,
    s.phone && `TEL;TYPE=CELL:${s.phone.replace(/\s/g, "")}`,
    "URL:https://amrsamir.me",
    s.linkedin && `URL;TYPE=LinkedIn:${s.linkedin}`,
    s.location && `ADR;TYPE=WORK:;;;;;;${esc(s.location)}`,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="amr-samir-edris.vcf"',
    },
  });
}
