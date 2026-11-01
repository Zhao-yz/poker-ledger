import { describe, expect, it } from "vitest";
import { computeStats } from "./stats";

// PLAN.md test 2 (dashboard): the hourly rate is total net over total hours,
// not the average of each session's own hourly rate.
describe("dashboard hourly rate", () => {
  it("divides total net by total hours across sessions", () => {
    const stats = computeStats([
      // +$1,000 over 5 hours (11am to 4pm) = +$200/h on its own
      { played_on: "2026-10-03", start_time: "11:00", end_time: "16:00", net: 1000 },
      // −$200 over 3 hours (10pm to 1am, past midnight) = −$66.67/h on its own
      { played_on: "2026-10-04", start_time: "22:00", end_time: "01:00", net: -200 },
    ]);

    expect(stats.totalNet).toBe(800);
    expect(stats.totalHours).toBe(8);
    expect(stats.hourly).toBe(100); // 800 ÷ 8, not (200 + −66.67) ÷ 2 = 66.67
  });
});
