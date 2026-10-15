import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/legal/Footer";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_UPDATED, RETENTION_MONTHS } from "@/config/site";

export const metadata: Metadata = { title: "Privacy | Janobi Sports", robots: { index: false } };

const H = "display mt-10 text-[28px]";
const P = "mt-3 text-[17px] leading-relaxed text-body";

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto max-w-[720px] px-4 pb-20 pt-8 sm:px-6 sm:pt-14">
        <Link href="/" className="label inline-flex min-h-[44px] items-center text-dim hover:text-ink">
          Janobi Sports
        </Link>
        <h1 className="display mt-4 text-[clamp(40px,7vw,64px)]">Privacy</h1>
        <p className={P}>Plain English: what we keep when you take the Personal Brand Audit, and why.</p>

        <h2 className={H}>Who we are</h2>
        <p className={P}>Janobi Agency Ltd, 128 City Road, London EC1V 2NX, United Kingdom. Janobi Sports is part of Janobi.</p>

        <h2 className={H}>What we collect</h2>
        <ul className={`${P} list-disc pl-6`}>
          <li>Your answers to the audit, your sport and your level.</li>
          <li>Your name, email and Instagram handle.</li>
          <li>If you give them: your TikTok, YouTube, website and WhatsApp number.</li>
          <li>Where you&apos;re based (UK, US or elsewhere).</li>
          <li>How you found the page, if the link you used had a referral code or campaign tag in it. Your browser keeps that code for up to 90 days so a later visit still counts.</li>
          <li>Your browser type (the user agent), to spot spam.</li>
        </ul>

        <h2 className={H}>Why</h2>
        <p className={P}>
          To show you your score, look at the public profiles you gave us before your call, email you your score and a few
          short follow-ups about the call, and know which introductions worked.
        </p>

        <h2 className={H}>What we don&apos;t do</h2>
        <p className={P}>
          There are no advertising cookies or trackers on this site. We don&apos;t sell your details. We only look at public
          profiles you point us to.
        </p>

        <h2 className={H}>Booking</h2>
        <p className={P}>Calls are booked through Cal.com, under Cal.com&apos;s own privacy policy.</p>

        <h2 className={H}>Who stores it</h2>
        <p className={P}>Supabase (our database) and Resend (our email sender). Both act on our behalf and nothing else.</p>

        <h2 className={H}>How long</h2>
        <p className={P}>{RETENTION_MONTHS} months, or until you ask us to delete it, whichever comes first.</p>

        <h2 className={H}>Your rights</h2>
        <p className={P}>
          Under UK GDPR, and similar US state laws, you can ask to see, correct or delete what we hold, or object to how we
          use it. Email <a className="underline underline-offset-4" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.
          Every follow-up email has an unsubscribe link, and you can reply to any email to stop them.
        </p>

        <p className="mt-12 text-[14px] text-dim">Updated {PRIVACY_UPDATED}.</p>
      </main>
      <Footer />
    </>
  );
}
