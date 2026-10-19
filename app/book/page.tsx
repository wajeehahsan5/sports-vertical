import type { Metadata } from "next";
import Link from "next/link";
import BookLoader from "@/components/book/BookLoader";

export const metadata: Metadata = {
  title: "Pick a time | Janobi Sports",
  robots: { index: false, follow: false },
};

/** Where the follow-up emails send athletes who took the audit but haven't booked yet. */
export default function BookPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-8 sm:px-5 sm:pt-14">
      <Link href="/" className="label inline-flex min-h-[44px] items-center text-fg-dim hover:text-fg">
        Janobi Sports
      </Link>
      <BookLoader />
    </main>
  );
}
