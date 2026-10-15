import { describe, expect, it } from "vitest";
import { formatWhen } from "@/components/audit/when";

describe("formatWhen", () => {
  const iso = "2026-10-20T15:00:00.000Z";
  it("shows London time for a UK athlete", () => {
    expect(formatWhen(iso, "Europe/London")).toMatch(/Tuesday,? 20 October.*16:00.*(BST|GMT\+1)/);
  });
  it("shows New York time for a US athlete", () => {
    expect(formatWhen(iso, "America/New_York")).toMatch(/Tuesday, October 20.*11:00\sAM.*EDT/);
  });
});
