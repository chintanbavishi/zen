import { describe, it, expect } from "vitest";
import { gameReducer, initialState, getMonthlyBurn, getRunwayMonths } from "../../src/engine/gameReducer";

describe("gameReducer", () => {
  it("starts with $250,000", () => {
    const state = initialState();
    expect(state.cash).toBe(250_000);
  });

  it("TOGGLE_MARKET single-selects market", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2c" });
    expect(state.markets).toEqual(["b2c"]);
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2b" });
    expect(state.markets).toEqual(["b2b"]);
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2b" });
    expect(state.markets).toEqual([]);
  });

  it("SET_TEAM_COUNT updates headcount", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 2 } });
    const eng = state.team.find((t) => t.id === "senior_eng")!;
    expect(eng.count).toBe(2);
    expect(getMonthlyBurn(state)).toBe(24_000);
  });

  it("SET_TEAM_COUNT caps at 5", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "intern", count: 10 } });
    expect(state.team.find((t) => t.id === "intern")!.count).toBe(5);
  });

  it("SET_TEAM_SALARY updates custom salary", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 1 } });
    state = gameReducer(state, { type: "SET_TEAM_SALARY", payload: { id: "senior_eng", salary: 15000 } });
    expect(getMonthlyBurn(state)).toBe(15_000);
  });

  it("TOGGLE_OFFICE selects/deselects", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_OFFICE", payload: "apartment" });
    expect(state.offices.find((o) => o.id === "apartment")!.selected).toBe(true);
    state = gameReducer(state, { type: "TOGGLE_OFFICE", payload: "apartment" });
    expect(state.offices.find((o) => o.id === "apartment")!.selected).toBe(false);
  });

  it("TOGGLE_GROWTH selects/deselects", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_GROWTH", payload: "meta_ads" });
    expect(state.growth.find((g) => g.id === "meta_ads")!.selected).toBe(true);
    expect(getMonthlyBurn(state)).toBe(5_000);
  });

  it("TOGGLE_LIFESTYLE selects/deselects", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_LIFESTYLE", payload: "vests" });
    expect(state.lifestyle.find((l) => l.id === "vests")!.selected).toBe(true);
  });

  it("computes runway correctly", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 1 } });
    // 250K / 12K = ~20.8, capped at 18
    expect(getRunwayMonths(state)).toBe(18);
  });

  it("computes runway with high burn", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 2 } });
    state = gameReducer(state, { type: "TOGGLE_OFFICE", payload: "real_office" });
    // burn = 24K + 4.5K = 28.5K, runway = 250K/28.5K = ~8.77
    expect(Math.floor(getRunwayMonths(state))).toBe(8);
  });

  it("NEXT_SCREEN increments screen", () => {
    let state = initialState();
    state = gameReducer(state, { type: "NEXT_SCREEN" });
    expect(state.screen).toBe(1);
  });

  it("PREV_SCREEN decrements screen", () => {
    let state = { ...initialState(), screen: 3 };
    state = gameReducer(state, { type: "PREV_SCREEN" });
    expect(state.screen).toBe(2);
  });

  it("SET_TEAM_MONTHS updates contract duration", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 1 } });
    state = gameReducer(state, { type: "SET_TEAM_MONTHS", payload: { id: "senior_eng", months: 3 } });
    expect(state.team.find((t) => t.id === "senior_eng")!.months).toBe(3);
  });

  it("SET_TEAM_MONTHS clamps between 1 and 18", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_MONTHS", payload: { id: "senior_eng", months: 0 } });
    expect(state.team.find((t) => t.id === "senior_eng")!.months).toBe(1);
    state = gameReducer(state, { type: "SET_TEAM_MONTHS", payload: { id: "senior_eng", months: 24 } });
    expect(state.team.find((t) => t.id === "senior_eng")!.months).toBe(18);
  });

  it("team members default to 18 months", () => {
    const state = initialState();
    state.team.forEach((t) => expect(t.months).toBe(18));
  });

  it("RESTART resets to initial state", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2c" });
    state = gameReducer(state, { type: "RESTART" });
    expect(state.markets).toEqual([]);
    expect(state.cash).toBe(250_000);
  });
});
