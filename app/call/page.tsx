import type { Metadata } from "next";
import CallLoader from "@/components/call/CallLoader";

export const metadata: Metadata = { title: "Log the call | Janobi Sports", robots: { index: false, follow: false } };

/** Private: linked from Wajeeh's lead alert as /call/?id=…&k=…, gated by an HMAC of the audit id. */
export default function CallPage() {
  return (
    <main className="mx-auto max-w-[620px] px-4 pb-16 pt-10">
      <p className="label text-fg-dim">After the call</p>
      <CallLoader />
    </main>
  );
}
