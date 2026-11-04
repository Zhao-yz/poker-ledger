import { describe, expect, it } from "vitest";
import { validateSession, workedOutNet, type SessionInput } from "./validation";

const session: SessionInput = {
  played_on: "2026-11-01",
  venue_id: "1",
  new_venue: "",
  start_time: "19:00",
  end_time: "23:00",
  stakes: "",
  net: "-200",
  buy_in: "300",
  cash_out: "100",
  notes: "",
};

describe("workedOutNet", () => {
  it("works out net once both amounts are there", () => {
    expect(workedOutNet("300", "455")).toBe("155");
    expect(workedOutNet("300", "0")).toBe("-300");
  });

  it("stays out of the way until both amounts are valid", () => {
    expect(workedOutNet("", "")).toBeNull();
    expect(workedOutNet("300", "")).toBeNull();
    expect(workedOutNet("-5", "100")).toBeNull();
  });
});

describe("correcting a saved session", () => {
  it("saves after changing the cash-out, because net follows it", () => {
    const corrected = { ...session, cash_out: "150" };
    const net = workedOutNet(corrected.buy_in, corrected.cash_out)!;
    expect(net).toBe("-150");
    expect(validateSession({ ...corrected, net }, "2026-11-04").net).toBeUndefined();
  });

  it("still rejects a net that disagrees, for rows that don't come through the form", () => {
    expect(validateSession({ ...session, cash_out: "150" }, "2026-11-04").net).toMatch(/doesn't match/);
  });
});
