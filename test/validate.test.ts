import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/config/audit";
import { attribution, normalizeHandle, submission, ValidationError } from "@/lib/server/validate";

const answers = Object.fromEntries(QUESTIONS.map((q) => [q.key, "a"]));
const base = {
  sport: "mma",
  level: "regional",
  answers,
  contact: { name: "Kai Mercer", email: "Kai@Example.com ", instagram: "@kai.mercer", basedIn: "uk" },
};

describe("normalizeHandle", () => {
  it.each([
    ["@kai.mercer", "kai.mercer"],
    ["  kai.mercer ", "kai.mercer"],
    ["https://www.instagram.com/kai.mercer/?hl=en", "kai.mercer"],
    ["instagram.com/kai.mercer", "kai.mercer"],
    ["https://www.tiktok.com/@kai_fights", "kai_fights"],
    ["https://youtube.com/@KaiMercerMMA", "KaiMercerMMA"],
  ])("%s → %s", (raw, want) => {
    expect(normalizeHandle(raw)).toBe(want);
  });
});

describe("submission", () => {
  it("accepts a valid audit and normalises fields", () => {
    const s = submission(base);
    expect(s.contact.email).toBe("kai@example.com");
    expect(s.contact.instagram).toBe("kai.mercer");
    expect(s.contact.tiktok).toBe("");
  });

  it("requires Instagram", () => {
    expect(() => submission({ ...base, contact: { ...base.contact, instagram: "  " } })).toThrow(ValidationError);
  });

  it("rejects a handle with spaces or symbols", () => {
    expect(() => submission({ ...base, contact: { ...base.contact, instagram: "kai mercer!" } })).toThrow(ValidationError);
  });

  it("rejects an unknown sport, level or basedIn", () => {
    expect(() => submission({ ...base, sport: "chess" })).toThrow(ValidationError);
    expect(() => submission({ ...base, level: "god" })).toThrow(ValidationError);
    expect(() => submission({ ...base, contact: { ...base.contact, basedIn: "mars" } })).toThrow(ValidationError);
  });

  it("rejects a bad answer value", () => {
    expect(() => submission({ ...base, answers: { ...answers, q4: "z" } })).toThrow(ValidationError);
  });

  it("rejects a too-short WhatsApp number but allows none", () => {
    expect(() => submission({ ...base, contact: { ...base.contact, whatsapp: "123" } })).toThrow(ValidationError);
    expect(submission({ ...base, contact: { ...base.contact, whatsapp: "" } }).contact.whatsapp).toBe("");
  });

  it("rejects a bad email", () => {
    expect(() => submission({ ...base, contact: { ...base.contact, email: "kai@" } })).toThrow(ValidationError);
  });
});

describe("attribution", () => {
  it("keeps ref and utm keys only, and only a clean ref", () => {
    expect(attribution({ ref: "sk", utm_source: "dm", fbclid: "x", evil: "y" })).toEqual({ ref: "sk", utm_source: "dm" });
    expect(attribution({ ref: "<b>" })).toEqual({});
  });
});

describe("normalizeHandle on share links (review finding)", () => {
  const bad = [
    "youtube.com/channel/UCabc",
    "youtube.com/c/KaiMercer",
    "https://youtu.be/abc",
    "https://vm.tiktok.com/ZMabc/",
    "instagram.com/stories/kai/123",
    "linktr.ee/kai",
  ];
  it.each(bad)("rejects %s instead of storing a fragment", (raw) => {
    expect(() => submission({ ...base, contact: { ...base.contact, instagram: raw } })).toThrow(ValidationError);
  });
  it("still accepts profile URLs", () => {
    expect(submission({ ...base, contact: { ...base.contact, instagram: "https://instagram.com/kai.mercer" } }).contact.instagram).toBe("kai.mercer");
    expect(submission({ ...base, contact: { ...base.contact, youtube: "https://www.youtube.com/@KaiMMA" } }).contact.youtube).toBe("KaiMMA");
  });
});
