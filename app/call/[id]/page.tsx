import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OutcomeForm from "@/components/call/OutcomeForm";
import { validOutcomeToken } from "@/lib/server/automation";
import { getStore } from "@/lib/server/store";
import { leadId as parseId } from "@/lib/server/validate";

export const metadata: Metadata = { title: "Log the call | Janobi Sports", robots: { index: false, follow: false } };

/** Private: linked from Wajeeh's lead alert, gated by an HMAC of the audit id. */
export default async function CallPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ id: raw }, { k }] = await Promise.all([params, searchParams]);
  let id: string;
  try {
    id = parseId(raw);
  } catch {
    notFound();
  }
  if (!validOutcomeToken(id, k)) notFound();
  const lead = await getStore().get(id);
  if (!lead) notFound();
  return (
    <main className="mx-auto max-w-[620px] px-4 pb-16 pt-10">
      <p className="label text-fg-dim">After the call</p>
      <h1 className="display mt-2 text-[48px]">{lead.name}</h1>
      <p className="mt-2 text-fg-dim">
        @{lead.instagram} · {lead.email} · now: {lead.status}
      </p>
      <div className="mt-8">
        <OutcomeForm id={id} token={k!} />
      </div>
    </main>
  );
}
