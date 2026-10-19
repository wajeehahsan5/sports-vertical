"use client";

import { useEffect, useState } from "react";
import { postLead } from "@/components/audit/api";
import OutcomeForm from "./OutcomeForm";

type Lead = { name: string; email: string; instagram: string; status: string };

/** Reads id + token from the link, asks the backend for the lead (it checks the token). */
export default function CallLoader() {
  const [state, setState] = useState<{ id: string; k: string; lead: Lead } | "loading" | "missing">("loading");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get("id") ?? "";
    const k = q.get("k") ?? "";
    (id && k ? postLead<Lead>({ action: "call-lead", id, k }) : Promise.reject())
      .then((lead) => setState({ id, k, lead }))
      .catch(() => setState("missing"));
  }, []);

  if (state === "loading") return <p className="mt-4 text-fg-dim">Loading…</p>;
  if (state === "missing") return <h1 className="display mt-2 text-[48px]">Link not valid</h1>;
  const { lead } = state;
  return (
    <>
      <h1 className="display mt-2 text-[48px]">{lead.name}</h1>
      <p className="mt-2 text-fg-dim">
        @{lead.instagram} · {lead.email} · now: {lead.status}
      </p>
      <div className="mt-8">
        <OutcomeForm id={state.id} token={state.k} />
      </div>
    </>
  );
}
