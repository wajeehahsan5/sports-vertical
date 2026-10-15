import { describe, expect, it } from "vitest";
import { cleanRef, mergeAttribution } from "@/lib/attribution";

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 9, 16);

describe("cleanRef", () => {
  it("lowercases, trims and dashes spaces", () => {
    expect(cleanRef("  Sarah UK ")).toBe("sarah-uk");
  });
  it("rejects junk and long values", () => {
    expect(cleanRef("<script>")).toBeNull();
    expect(cleanRef("a".repeat(33))).toBeNull();
    expect(cleanRef("")).toBeNull();
  });
});

describe("mergeAttribution", () => {
  it("stores ref and utms from the first visit", () => {
    const a = mergeAttribution(null, "?ref=sk&utm_source=whatsapp&x=1", T0);
    expect(a).toEqual({ first_seen: T0, ref: "sk", utm_source: "whatsapp" });
  });

  it("returns null when there is nothing to store", () => {
    expect(mergeAttribution(null, "?x=1", T0)).toBeNull();
  });

  it("keeps the first touch for 90 days, even against a new ref", () => {
    const first = mergeAttribution(null, "?ref=sk", T0)!;
    expect(mergeAttribution(first, "", T0 + 10 * DAY)).toEqual(first);
    expect(mergeAttribution(first, "?ref=other", T0 + 89 * DAY)).toEqual(first);
  });

  it("lets a new ref replace an expired one", () => {
    const first = mergeAttribution(null, "?ref=sk", T0)!;
    expect(mergeAttribution(first, "?ref=other", T0 + 91 * DAY)).toEqual({ first_seen: T0 + 91 * DAY, ref: "other" });
  });

  it("drops an expired touch when the new visit has nothing", () => {
    const first = mergeAttribution(null, "?ref=sk", T0)!;
    expect(mergeAttribution(first, "", T0 + 91 * DAY)).toBeNull();
  });

  it("drops a junk ref but keeps valid utms", () => {
    expect(mergeAttribution(null, "?ref=%3Cscript%3E&utm_medium=dm", T0)).toEqual({ first_seen: T0, utm_medium: "dm" });
  });
});
