import type { Metadata } from "next";
import Link from "next/link";
import BookPanel from "@/components/book/BookPanel";
import { getStore } from "@/lib/server/store";
import { leadId as parseId } from "@/lib/server/validate";

export const metadata: Metadata = {
  title: "Pick a time | Janobi Sports",
  robots: { index: false, follow: false },
};

/** Where the follow-up emails send athletes who took the audit but haven't booked yet. */
export default async function BookPage({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const { a } = await searchParams;
  let lead = null;
  let id = "";
  try {
    id = parseId(a);
    lead = await getStore().get(id);
  } catch {
    lead = null;
  }

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-8 sm:px-5 sm:pt-14">
      <Link href="/" className="label inline-flex min-h-[44px] items-center text-dim hover:text-ink">
        Janobi Sports
      </Link>
      {lead ? (
        <>
          <h1 className="display mt-4 text-[clamp(34px,6vw,56px)]">Pick a time for your 20 minutes</h1>
          <p className="mt-3 max-w-[52ch] text-[17px] text-body">
            On the call we go through your real profiles and bring 3 specific fixes. No cost, no pressure.
          </p>
          <div className="mt-8">
            <BookPanel leadId={id} name={lead.name} email={lead.email} whatsapp={lead.whatsapp} instagram={lead.instagram} />
          </div>
        </>
      ) : (
        <>
          <h1 className="display mt-4 text-[clamp(34px,6vw,56px)]">This link has expired</h1>
          <p className="mt-3 text-[17px] text-body">Take the audit again from the page below. It takes 2 minutes.</p>
          <Link href="/#audit" className="btn btn-ink mt-6 inline-flex">
            Get my free audit
          </Link>
        </>
      )}
    </main>
  );
}
