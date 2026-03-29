import { describe, it, expect } from "vitest";
import { gameReducer, initialState } from "../../src/engine/gameReducer";

describe("gameReducer", () => {
  it("starts with $250,000 and 18 months", () => {
    const state = initialState();
    expect(state.cash).toBe(250_000);
    expect(state.monthsTotal).toBe(18);
    expect(state.monthlyBurn).toBe(0);
    expect(state.runwayMonths).toBe(18);
  });

  it("SET_TYPE sets businessType", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SET_TYPE", payload: "b2b" });
    expect(next.businessType).toBe("b2b");
  });

  it("SET_TEAM adds monthly cost to burn (senior = $12K)", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SET_TEAM", payload: "senior" });
    expect(next.monthlyBurn).toBe(12_000);
    expect(next.teamChoice).toBe("senior");
  });

  it("SET_OFFICE adds to burn (wework after senior = $12,600)", () => {
    const state = initialState();
    const afterTeam = gameReducer(state, { type: "SET_TEAM", payload: "senior" });
    const afterOffice = gameReducer(afterTeam, { type: "SET_OFFICE", payload: "wework" });
    expect(afterOffice.monthlyBurn).toBe(12_600);
  });

  it("SET_GROWTH adds monthly cost for paid_ads ($5K/mo)", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SET_GROWTH", payload: "paid_ads" });
    expect(next.monthlyBurn).toBe(5_000);
    expect(next.cash).toBe(250_000); // no one-time cost
  });

  it("SET_GROWTH deducts one-time cost for influencer ($15K one-time)", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SET_GROWTH", payload: "influencer" });
    expect(next.monthlyBurn).toBe(0); // no monthly cost
    expect(next.cash).toBe(250_000 - 15_000);
  });

  it("ACCEPT_TEMPTATION subtracts from cash", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "ACCEPT_TEMPTATION", payload: "lisbon" });
    expect(next.cash).toBe(250_000 - 3_500);
    expect(next.temptationsAccepted).toContain("lisbon");
  });

  it("SKIP_TEMPTATION does not reduce cash", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SKIP_TEMPTATION", payload: "lisbon" });
    expect(next.cash).toBe(250_000);
    expect(next.temptationsAccepted).not.toContain("lisbon");
  });

  it("RESOLVE_CURVEBALL with fix reduces cash by fixCost", () => {
    const state = initialState();
    // cto_equity fixCost = $5,000
    const next = gameReducer(state, {
      type: "RESOLVE_CURVEBALL",
      payload: { id: "cto_equity", choice: "fix" },
    });
    expect(next.cash).toBe(250_000 - 5_000);
    expect(next.curveballResolution).toBe("fix");
  });

  it("RESOLVE_CURVEBALL with ignore does not reduce cash", () => {
    const state = initialState();
    const next = gameReducer(state, {
      type: "RESOLVE_CURVEBALL",
      payload: { id: "cto_equity", choice: "ignore" },
    });
    expect(next.cash).toBe(250_000);
    expect(next.curveballResolution).toBe("ignore");
  });

  it("computes runway correctly (250K / 12K = 18 capped at totalMonths)", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "SET_TEAM", payload: "senior" });
    // floor(250000 / 12000) = 20, capped at 18
    expect(next.runwayMonths).toBe(18);
  });

  it("computes runway with high burn (250K / 16.5K = 15)", () => {
    const state = initialState();
    const afterTeam = gameReducer(state, { type: "SET_TEAM", payload: "senior" }); // 12K
    const afterOffice = gameReducer(afterTeam, { type: "SET_OFFICE", payload: "real_office" }); // +4.5K = 16.5K
    // floor(250000 / 16500) = 15
    expect(afterOffice.monthlyBurn).toBe(16_500);
    expect(afterOffice.runwayMonths).toBe(15);
  });

  it("RESTART returns to initial state", () => {
    const state = initialState();
    const modified = gameReducer(state, { type: "SET_TYPE", payload: "b2c" });
    const restarted = gameReducer(modified, { type: "RESTART" });
    expect(restarted.businessType).toBeNull();
    expect(restarted.cash).toBe(250_000);
    expect(restarted.screen).toBe(0);
  });

  it("NEXT_SCREEN increments screen", () => {
    const state = initialState();
    const next = gameReducer(state, { type: "NEXT_SCREEN" });
    expect(next.screen).toBe(1);
  });

  it("SET_TEAM replaces old team cost when changed", () => {
    const state = initialState();
    const withSenior = gameReducer(state, { type: "SET_TEAM", payload: "senior" }); // 12K
    const withOffshore = gameReducer(withSenior, { type: "SET_TEAM", payload: "offshore" }); // 8K
    expect(withOffshore.monthlyBurn).toBe(8_000);
  });

  it("ACCEPT_TEMPTATION is idempotent (no double deduction)", () => {
    const state = initialState();
    const once = gameReducer(state, { type: "ACCEPT_TEMPTATION", payload: "merch" });
    const twice = gameReducer(once, { type: "ACCEPT_TEMPTATION", payload: "merch" });
    expect(twice.cash).toBe(once.cash);
    expect(twice.temptationsAccepted.filter((t) => t === "merch")).toHaveLength(1);
  });
});
