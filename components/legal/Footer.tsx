import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink px-4 pb-8 pt-6 text-[14px] text-on-dark-dim">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
        <p>© Janobi Agency Ltd · 128 City Road, London EC1V 2NX</p>
        <Link href="/privacy" className="inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-on-dark">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
