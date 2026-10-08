import type { Metadata } from "next";
import { Window } from "@/components/Window";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, phone, LinkedIn and a contact card for Amr Samir Edris.",
  alternates: { canonical: "/contact" },
};

export default async function Contact() {
  const site = await getSite();
  const tel = site.phone.replace(/[^+\d]/g, "");
  const rows = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Phone / WhatsApp", value: site.phone, href: `tel:${tel}` },
    { label: "LinkedIn", value: site.linkedin?.replace(/^https?:\/\/(www\.)?/, ""), href: site.linkedin },
    { label: "Based in", value: site.location },
  ].filter((r) => r.value);

  return (
    <div className="door-stage">
      <Window title="Contact" className="door-win lg:!h-auto lg:max-w-[720px] lg:self-start" closeHref="/" closeLabel="Close Contact and go back to the desktop">
        <div className="door-content">
          <h1 className="display text-[clamp(44px,6vw,80px)]">Say hello</h1>
          <p className="muted mt-3 max-w-[52ch]">Projects, roles, collaborations or a coffee in the UAE. Email is fastest.</p>
          <dl className="mt-8 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[104px_1fr] sm:grid-cols-[140px_1fr] items-center gap-4 py-3.5 text-[15px]">
                <dt className="subtle text-[13px]">{r.label}</dt>
                <dd className="min-w-0 break-words">
                  {r.href ? (
                    <a href={r.href} className="font-medium underline decoration-[var(--hairline-strong)] underline-offset-4 hover:decoration-current">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={`mailto:${site.email}`} className="btn btn-primary">
              Email Amr
            </a>
            <a href="/contact/vcard" className="btn" download>
              Save contact card
            </a>
          </div>
        </div>
      </Window>
    </div>
  );
}
