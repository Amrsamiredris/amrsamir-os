import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { requireAdmin } from "@/lib/admin/session";
import { store } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

type Message = { at: number; name: string; email: string; company?: string; topic: string; message: string };
const when = (t: number) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(t);

export default async function Messages() {
  await requireAdmin();
  const list = await store().lrange<Message>("contact:messages", 100);
  return (
    <AdminFrame active="messages">
      <h1 className="display text-[clamp(40px,5vw,64px)]">Messages</h1>
      <p className="muted mt-3 text-[14px]">Everything sent through the contact form, newest first. A copy also goes to your email.</p>
      {list.length ? (
        <ol className="mt-8 grid gap-4">
          {list.map((m, i) => (
            <li key={i} className="rounded-[var(--radius-inner)] p-5" style={{ background: "var(--glass-strong)", boxShadow: "0 0 0 0.5px var(--hairline-strong)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="h3">
                  {m.name}
                  {m.company ? <span className="muted font-normal">, {m.company}</span> : null}
                </p>
                <p className="subtle text-[12px]">
                  {m.topic}, {when(m.at)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">{m.message}</p>
              <a className="btn mt-4" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}>
                Reply to {m.email}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="subtle mt-8">No messages yet. They show up here as soon as someone uses the form on /contact.</p>
      )}
    </AdminFrame>
  );
}
