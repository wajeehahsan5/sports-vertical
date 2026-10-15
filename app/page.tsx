import { AuditOverlay } from "@/components/audit/AuditOverlay";
import { Footer } from "@/components/legal/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Nav } from "@/components/sections/Nav";
import { Packages } from "@/components/sections/Packages";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { WhyItMatters } from "@/components/sections/WhyItMatters";

export default function Home() {
  return (
    <>
      <Nav />
      <Reveal>
        <main>
          <Hero />
          <WhatWeBuild />
          <WhyItMatters />
          <Packages />
          <HowItWorks />
          <Faq />
          <FinalCta />
        </main>
      </Reveal>
      <Footer />
      <AuditOverlay />
    </>
  );
}
