/** All page copy. Source of truth: janobi-sports/strategy/04-landing-copy.md. No em dashes. */
export const COPY = {
  nav: {
    brand: "Janobi Sports",
    links: [
      ["What we build", "#build"],
      ["How it works", "#how"],
      ["Packages", "#packages"],
      ["FAQ", "#faq"],
    ] as const,
    cta: "Get my free audit",
  },
  hero: {
    tag: { place: "UK · US", image: "/img/tag.jpg" },
    stat: "For fighters, boxers and footballers. Free, 2 minutes.",
    h1: "You've earned a bigger name than your feed shows.",
    cta: "Get my free audit",
    ctaLabel: ["Get your free", "brand audit"] as const,
    images: [
      { src: "/img/hero-1.jpg", alt: "A fighter in MMA gloves, guard up, on a black background" },
      { src: "/img/hero-2.jpg", alt: "A fighter in boxing gloves inside a cage" },
      { src: "/img/hero-3.jpg", alt: "A fighter in MMA gloves looking into the camera" },
    ],
    avatars: ["/img/avatar-1.jpg", "/img/avatar-2.jpg", "/img/avatar-3.jpg"],
  },
  build: {
    eyebrow: "What we build",
    h2: "Everything people see when they look you up.",
    cta: "Get my free audit",
    photo: {
      src: "/img/build.jpg",
      alt: "A fighter taping his hands before training",
      place: "Built around your real training week",
      title: "Sponsors check first",
      body: "Before a brand backs you, they look you up. Your profile does the talking before you do.",
    },
    pillars: {
      identity: "Mark, colours, photos, profile.",
      content: "Camp, fight week, everyday.",
      home: "Website and media kit.",
    },
    audit: { title: "Start with the audit", body: "2 minutes, free. See which of the three needs work first." },
  },
  why: {
    photo: { src: "/img/why.jpg", alt: "A fighter sitting on the gym floor beside his gloves" },
    stats: [
      ["2 min", "to take the audit"],
      ["3", "pillars we score"],
      ["3", "fixes on your call"],
    ] as const,
    statement: "Careers are short, and the name outlasts them. Your record shows what you can do. Your brand decides who hears about it.",
    cta: "How the audit works",
  },
  packages: {
    eyebrow: "Packages",
    h2: "Pick the gap you want closed.",
    sub: "Prices depend on where you are and what you need. We go through them on the call.",
    founding: (left: number, total: number) =>
      `Founding athletes: ${left} of ${total} spots left at a reduced rate, in return for letting us share your before and after.`,
  },
  how: {
    eyebrow: "How the audit works",
    h2: "Two minutes now. Twenty on a call.",
    steps: [
      { n: "01", title: "Answer 9 quick questions", body: "About your profile, your content and where people land when they search you." },
      { n: "02", title: "See your score", body: "Instantly, across Identity, Content and Home base." },
      { n: "03", title: "Get 3 real fixes", body: "We look at your actual profiles before a 20-minute call and bring 3 specific fixes. Yours to keep." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    h2: "Questions athletes ask.",
    items: [
      { q: "Who's Janobi?", a: "A UK-registered creative studio with a global team. We build brands, content and websites. Janobi Sports is the part of the studio that works with athletes." },
      { q: "Which sports do you work with?", a: "Combat sports first (MMA, boxing, Muay Thai and grappling), plus football and other sports. If you compete, it works." },
      { q: "Do I need a big following?", a: "No. The audit works at every level, and a strong brand is easier to build before the big fight than after it." },
      { q: "What happens on the call?", a: "We go through your profiles, show you 3 specific fixes and, if you want, what working together looks like. No pressure either way." },
      { q: "How much of my time does it take?", a: "Very little. We plan around your training and fight schedule and ask for short, specific things." },
      { q: "Do you get me sponsors?", a: "We don't act as your agent. We make you sponsor-ready: the look, the content and the media kit that make those conversations easier." },
    ],
  },
  final: { h2: "See how your brand scores.", sub: "Free, 2 minutes, no card, no catch.", cta: "Get my free audit" },
} as const;
