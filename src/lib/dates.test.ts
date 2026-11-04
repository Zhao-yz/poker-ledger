import { describe, expect, it } from "vitest";
import { todayInAppZone } from "./dates";

describe("todayInAppZone", () => {
  it("stays on today in the evening, when UTC has already moved to tomorrow", () => {
    // 5pm Pacific on Nov 4, during class, is 1am on Nov 5 in UTC.
    expect(todayInAppZone(new Date("2026-11-05T01:00:00Z"))).toBe("2026-11-04");
  });

  it("rolls over at midnight Pacific, not midnight UTC", () => {
    expect(todayInAppZone(new Date("2026-11-05T07:59:00Z"))).toBe("2026-11-04");
    expect(todayInAppZone(new Date("2026-11-05T08:00:00Z"))).toBe("2026-11-05");
  });

  it("handles summer time", () => {
    // 11pm Pacific on July 4 is 6am on July 5 in UTC.
    expect(todayInAppZone(new Date("2026-07-05T06:00:00Z"))).toBe("2026-07-04");
  });
});
