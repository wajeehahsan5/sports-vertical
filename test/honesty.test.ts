import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COPY } from "@/config/copy";

// Review findings on public claims: each must stay true.
describe("public claims", () => {
  it("privacy page doesn't claim every email has an unsubscribe link (the score email doesn't)", () => {
    expect(readFileSync("app/privacy/page.tsx", "utf8")).not.toContain("Every email we send has an unsubscribe link");
  });
  it("FAQ doesn't imply athletes we've talked to before any exist", () => {
    expect(JSON.stringify(COPY.faq)).not.toContain("athletes we talk to");
  });
});
