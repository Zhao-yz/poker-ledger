import { describe, expect, it } from "vitest";
import { checkRows, normalizeTime } from "./csv";

describe("CSV import parsing", () => {
  it("reads the time formats from my notes", () => {
    expect(normalizeTime("11am")).toBe("11:00");
    expect(normalizeTime("12am")).toBe("00:00");
    expect(normalizeTime("12pm")).toBe("12:00");
    expect(normalizeTime("~6:30pm")).toBe("18:30");
    expect(normalizeTime("2:45am")).toBe("02:45");
    expect(normalizeTime("23:15")).toBe("23:15");
    expect(normalizeTime("—")).toBe("");
  });

  it("accepts a net-only row and rejects a row with no result", () => {
    const [ok, missing] = checkRows(
      [
        { date: "2026-10-30", venue: "M8trix", start: "11am", end: "2am", net: "-280" },
        { date: "2026-10-31", venue: "M8trix", start: "11am", end: "7pm" },
      ],
      "2026-11-01",
    );
    expect(ok.errors).toEqual([]);
    expect(missing.errors.join(" ")).toMatch(/net result/);
  });
});
