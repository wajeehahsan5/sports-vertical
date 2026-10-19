"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { postLead } from "@/components/audit/api";
import BookPanel from "./BookPanel";

type Lead = { name: string; email: string; whatsapp: string; instagram: string };

/** /book/?a=<audit id>: loads the lead in the browser (the page itself is a static file). */
export default function BookLoader() {
  const [state, setState] = useState<{ id: string; lead: Lead } | "loading" | "missing">("loading");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("a") ?? "";
    (id ? postLead<Lead>({ action: "book-lead", id }) : Promise.reject())
      .then((lead) => setState({ id, lead }))
      .catch(() => setState("missing"));
  }, []);

  if (state === "loading") return <p className="mt-8 text-fg-dim">Loading your audit…</p>;
  if (state === "missing") {
    return (
      <>
        <h1 className="display mt-4 text-[clamp(34px,6vw,56px)]">This link has expired</h1>
        <p className="mt-3 text-[17px] text-fg-body">Take the audit again from the page below. It takes 2 minutes.</p>
        <Link href="/#audit" className="btn btn-mint mt-6 inline-flex">
          Get my free audit
        </Link>
      </>
    );
  }
  return (
    <>
      <h1 className="display mt-4 text-[clamp(34px,6vw,56px)]">Pick a time for your 20 minutes</h1>
      <p className="mt-3 max-w-[52ch] text-[17px] text-fg-body">
        On the call we go through your real profiles and bring 3 specific fixes. No cost, no pressure.
      </p>
      <div className="mt-8">
        <BookPanel leadId={state.id} {...state.lead} />
      </div>
    </>
  );
}
