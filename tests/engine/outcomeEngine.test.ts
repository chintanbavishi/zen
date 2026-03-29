import { describe, it, expect } from "vitest";
import { simulateGame } from "../../src/engine/outcomeEngine";
import { initialState, gameReducer } from "../../src/engine/gameReducer";

describe("simulateGame", () => {
  it("dies with high burn", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 3 } });
    state = gameReducer(state, { type: "TOGGLE_OFFICE", payload: "real_office" });
    state = gameReducer(state, { type: "TOGGLE_GROWTH", payload: "meta_ads" });
    // burn = 36K + 4.5K + 5K = 45.5K/mo, runway ~5.5 months
    const result = simulateGame(state);
    expect(result.outcome).toBe("died");
    expect(result.diedAtMonth).toBeLessThan(10);
  });

  it("survives with low burn and growth", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2c" });
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "junior_eng", count: 1 } });
    state = gameReducer(state, { type: "TOGGLE_OFFICE", payload: "apartment" });
    state = gameReducer(state, { type: "TOGGLE_GROWTH", payload: "organic" });
    // burn = 6K/mo, runway = 250K/6K = ~41 months (capped 18)
    const result = simulateGame(state);
    expect(result.outcome).toBe("raised");
  });

  it("generates events for each month survived", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2b" });
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "senior_eng", count: 1 } });
    state = gameReducer(state, { type: "TOGGLE_GROWTH", payload: "cold_email" });
    const result = simulateGame(state);
    expect(result.monthEvents.length).toBeGreaterThan(0);
    expect(result.monthEvents[0].month).toBe(1);
  });

  it("dies if no growth selected", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "junior_eng", count: 1 } });
    // No growth = no traction = dies
    const result = simulateGame(state);
    expect(result.outcome).toBe("died");
  });

  it("categorizes founder type", () => {
    let state = initialState();
    state = gameReducer(state, { type: "TOGGLE_MARKET", payload: "b2c" });
    state = gameReducer(state, { type: "SET_TEAM_COUNT", payload: { id: "junior_eng", count: 1 } });
    state = gameReducer(state, { type: "TOGGLE_GROWTH", payload: "organic" });
    const result = simulateGame(state);
    expect(result.founderType).toBeTruthy();
  });
});
