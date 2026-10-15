import { AuditOverlay } from "@/components/audit/AuditOverlay";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16">
      <h1 className="display text-[64px]">Janobi Sports</h1>
      <a href="#audit" className="btn btn-ink mt-6">
        Get my free audit
      </a>
      <AuditOverlay />
    </main>
  );
}
