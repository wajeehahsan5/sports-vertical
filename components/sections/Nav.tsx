import Image from "next/image";
import Link from "next/link";
import { COPY } from "@/config/copy";

/** The reference's nav: small logo + name, plain links, a light pill with a dark round arrow. */
export function Nav() {
  return (
    <header className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/img/icon.png" alt="" width={30} height={30} className="rounded-[7px]" />
        <span className="display whitespace-nowrap text-[18px]">{COPY.nav.brand}</span>
      </Link>
      <nav aria-label="Sections" className="hidden items-center gap-7 text-[14px] text-body md:flex">
        {COPY.nav.links.map(([label, href]) => (
          <a key={href} href={href} className="hover:text-ink">
            {label}
          </a>
        ))}
      </nav>
      <a href="#audit" className="group inline-flex items-center gap-1">
        <span className="btn btn-light min-h-[40px] px-5 text-[14px]">
          <span className="sm:hidden">Free audit</span>
          <span className="hidden sm:inline">{COPY.nav.cta}</span>
        </span>
        <span aria-hidden="true" className="grid h-[40px] w-[40px] place-items-center rounded-full bg-ink text-mint transition-transform group-hover:translate-x-0.5">
          »
        </span>
      </a>
    </header>
  );
}
