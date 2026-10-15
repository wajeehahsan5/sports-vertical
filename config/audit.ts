/** The Personal Brand Audit, as data. Wording source of truth: janobi-sports/strategy/02-audit.md. */
import type { Band } from "@/lib/audit/score";

export type Pillar = "identity" | "content" | "home";
export type PackageId = "weigh-in" | "camp" | "title-run";
export type Points = 0 | 1 | 2 | 3;
export type QuestionKey = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9";
export type SportId = "mma" | "boxing" | "muay-thai" | "bjj" | "football" | "other";
export type LevelId = "amateur" | "regional" | "national" | "elite";
export type BasedIn = "uk" | "us" | "elsewhere";

export type AuditOption = { value: "a" | "b" | "c" | "d"; label: string; points: Points; finding?: string };
export type AuditQuestion = { key: QuestionKey; pillar: Pillar; title: string; sub: string; options: AuditOption[] };

/** `event`/`events` fill the {event}/{events} tokens in findings. */
export const SPORTS: { value: SportId; label: string; event: string; events: string }[] = [
  { value: "mma", label: "MMA", event: "fight", events: "fights" },
  { value: "boxing", label: "Boxing", event: "fight", events: "fights" },
  { value: "muay-thai", label: "Muay Thai / Kickboxing", event: "fight", events: "fights" },
  { value: "bjj", label: "BJJ / Grappling", event: "match", events: "matches" },
  { value: "football", label: "Football", event: "match", events: "matches" },
  { value: "other", label: "Another sport", event: "event", events: "events" },
];

export const LEVELS: { value: LevelId; label: string; hint: string }[] = [
  { value: "amateur", label: "Amateur or prospect", hint: "Building a record, getting noticed" },
  { value: "regional", label: "Regional pro", hint: "Paid to compete, local name" },
  { value: "national", label: "National or top league", hint: "Known in your sport" },
  { value: "elite", label: "International or elite", hint: "The big stages" },
];

export const PILLARS: Record<Pillar, { label: string; blurb: string }> = {
  identity: { label: "Identity", blurb: "Does your look say who you are?" },
  content: { label: "Content", blurb: "Are you showing up, and showing the right stuff?" },
  home: { label: "Home base", blurb: "Is there one place a sponsor can land?" },
};

export const BANDS: Record<Band, string> = { good: "Looking good", getting: "Getting there", grow: "Room to grow" };

export const PACKAGES: Record<PackageId, { name: string; kind: string; line: string; includes: string[] }> = {
  "weigh-in": {
    name: "Weigh-In",
    kind: "One-off",
    line: "Look like your level, everywhere.",
    includes: ["Personal mark and colours", "Photo direction", "Profile makeover", "Sponsor media kit"],
  },
  camp: {
    name: "Camp",
    kind: "Monthly",
    line: "Show up every week, not just fight week.",
    includes: ["Monthly content plan", "Reels, carousels and stories", "Captions and posting", "Monthly report"],
  },
  "title-run": {
    name: "Title Run",
    kind: "Monthly, 3-month minimum",
    line: "The whole brand, built around you.",
    includes: ["Everything in Camp", "Your personal website", "Weigh-In identity work", "Sponsor-ready from month one"],
  },
};

export const QUESTIONS: AuditQuestion[] = [
  {
    key: "q1",
    pillar: "identity",
    title: "If a sponsor saw your profile right now, would they know what you do and at what level?",
    sub: "Just your photo, name and bio. The first three seconds.",
    options: [
      { value: "a", label: "Instantly", points: 3 },
      { value: "b", label: "Mostly", points: 2 },
      { value: "c", label: "Kind of", points: 1, finding: "Your bio undersells you. A sponsor should get your sport, your weight class or position, and your level in about 3 seconds." },
      { value: "d", label: "Not really", points: 0, finding: "A stranger can't tell what you do from your profile yet. Your photo, name line and 150-character bio are the quickest win here." },
    ],
  },
  {
    key: "q2",
    pillar: "identity",
    title: "Do your posts look like they come from the same person?",
    sub: "Colours, style, the feel of the grid.",
    options: [
      { value: "a", label: "Yes, a clear style", points: 3 },
      { value: "b", label: "Mostly", points: 2 },
      { value: "c", label: "Sometimes", points: 1, finding: "Your feed looks like 3 different people run it. One clear look makes you recognisable mid-scroll." },
      { value: "d", label: "Not at all", points: 0, finding: "Nothing ties your posts together yet. Every post starts from zero." },
    ],
  },
  {
    key: "q3",
    pillar: "identity",
    title: "How are the photos of you out there?",
    sub: "The ones a brand or a journalist could actually use.",
    options: [
      { value: "a", label: "Pro shoot in the last year", points: 3 },
      { value: "b", label: "A few good ones", points: 2 },
      { value: "c", label: "Mostly phone shots", points: 1, finding: "Phone shots work for stories. Your profile needs 5 or 6 photos that look like your level." },
      { value: "d", label: "Barely any", points: 0, finding: "There are barely any good photos of you around, and sponsors and press need at least a handful to use." },
    ],
  },
  {
    key: "q4",
    pillar: "content",
    title: "How often do you post?",
    sub: "On your main account.",
    options: [
      { value: "a", label: "Several times a week", points: 3 },
      { value: "b", label: "About weekly", points: 2 },
      { value: "c", label: "When something happens", points: 1, finding: "Posting only when something happens means people forget you between {events}. Twice a week keeps you in their feed." },
      { value: "d", label: "Rarely", points: 0, finding: "You're quiet most weeks, so fans and the Instagram algorithm never get the chance to know you." },
    ],
  },
  {
    key: "q5",
    pillar: "content",
    title: "Besides results, what do people see from you?",
    sub: "Training, life, personality, the people around you.",
    options: [
      { value: "a", label: "Training, life and personality", points: 3 },
      { value: "b", label: "Some behind the scenes", points: 2 },
      { value: "c", label: "Mostly results", points: 1, finding: "It's mostly results. Fans follow people, and the training, food and family bits are what keep them." },
      { value: "d", label: "Just results", points: 0, finding: "It's only results right now. Camp, the walkout, the people in your corner: none of it is in the feed." },
    ],
  },
  {
    key: "q6",
    pillar: "content",
    title: "When a {event} is coming up, do you build it up?",
    sub: "The weeks before are when people pay the most attention.",
    options: [
      { value: "a", label: "Planned countdown", points: 3 },
      { value: "b", label: "A few posts", points: 2 },
      { value: "c", label: "Just the announcement", points: 1, finding: "An announcement alone leaves a lot on the table. The 4 weeks before a {event} are when attention is easiest to win." },
      { value: "d", label: "Nothing", points: 0, finding: "Your {events} arrive without a build-up. Those last 4 weeks are when people pay the most attention." },
    ],
  },
  {
    key: "q7",
    pillar: "home",
    title: "If someone Googles your name, what comes up first?",
    sub: "Try it later. Most athletes are surprised.",
    options: [
      { value: "a", label: "My own site", points: 3 },
      { value: "b", label: "My Instagram", points: 2 },
      { value: "c", label: "Someone else's page or stats", points: 1, finding: "Searching your name on Google lands on someone else's page, like a stats site or a promoter. They get to tell your story." },
      { value: "d", label: "Not much", points: 0, finding: "Google your name and not much turns up yet. That's the first gap a sponsor notices." },
    ],
  },
  {
    key: "q8",
    pillar: "home",
    title: "Do you have a media kit or sponsor deck?",
    sub: "The document that says who you are, your numbers and what you offer a brand.",
    options: [
      { value: "a", label: "Yes, up to date", points: 3 },
      { value: "b", label: "An old one", points: 2 },
      { value: "c", label: "I've thought about it", points: 1, finding: "A media kit is the one PDF every sponsor conversation needs. It's 6 to 8 pages and quick to make." },
      { value: "d", label: "No", points: 0, finding: "Without a media kit, every sponsor chat starts with you explaining yourself from scratch." },
    ],
  },
  {
    key: "q9",
    pillar: "home",
    title: "How easy is it for a brand to contact you about a deal?",
    sub: "If they found you today.",
    options: [
      { value: "a", label: "Clear contact or manager listed", points: 3 },
      { value: "b", label: "DMs only", points: 2 },
      { value: "c", label: "Hard to find", points: 1, finding: "Brands can't easily see how to reach you. Some won't try twice." },
      { value: "d", label: "Not sure", points: 0, finding: "You're not sure how a brand would reach you, which means some probably haven't." },
    ],
  },
];

/* ── The real-review step ─────────────────────────────────────────────── */

export type FieldKey = "name" | "email" | "instagram" | "whatsapp";

export type Field = {
  key: FieldKey;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "url";
  autoComplete: string;
  inputMode?: "text" | "email" | "tel" | "url";
  required: boolean;
};

export const REVIEW_FIELDS: Field[] = [
  { key: "name", label: "Your name", placeholder: "Kai Mercer", type: "text", autoComplete: "name", required: true },
  { key: "email", label: "Email", placeholder: "you@email.com", type: "email", autoComplete: "email", inputMode: "email", required: true },
  { key: "instagram", label: "Instagram", placeholder: "@yourhandle", type: "text", autoComplete: "off", required: true },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+44 7700 900123", type: "tel", autoComplete: "tel", inputMode: "tel", required: false },
];

export const BASED_IN: { value: BasedIn; label: string }[] = [
  { value: "uk", label: "UK" },
  { value: "us", label: "US" },
  { value: "elsewhere", label: "Elsewhere" },
];
