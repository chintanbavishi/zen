import type { GameState, GameAction } from "./gameState";
import { STARTING_CASH, TOTAL_MONTHS } from "./constants";
import { teamChoices, officeChoices, b2cGrowthChoices, b2bGrowthChoices, temptations, curveballs } from "./gameData";
import { simulateGame } from "./outcomeEngine";

function computeRunway(cash: number, monthlyBurn: number, totalMonths: number): number {
  if (monthlyBurn <= 0) return totalMonths;
  return Math.min(totalMonths, Math.floor(cash / monthlyBurn));
}

export function initialState(): GameState {
  return {
    screen: 0,
    cash: STARTING_CASH,
    monthlyBurn: 0,
    monthsTotal: TOTAL_MONTHS,
    runwayMonths: TOTAL_MONTHS,
    businessType: null,
    teamChoice: null,
    officeChoice: null,
    growthChoice: null,
    temptationsAccepted: [],
    curveballId: null,
    curveballResolution: null,
    mrr: 0,
    arr: 0,
    mau: 0,
    customers: 0,
    momGrowth: 0,
    retention: 100,
    monthEvents: [],
    outcome: null,
    easterEgg: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_TYPE": {
      return { ...state, businessType: action.payload };
    }

    case "SET_TEAM": {
      const choice = teamChoices.find((c) => c.id === action.payload);
      if (!choice) return state;
      // Remove old team cost if already set
      const oldTeam = state.teamChoice ? teamChoices.find((c) => c.id === state.teamChoice) : null;
      const oldCost = oldTeam ? oldTeam.monthlyCost : 0;
      const newBurn = state.monthlyBurn - oldCost + choice.monthlyCost;
      return {
        ...state,
        teamChoice: action.payload,
        monthlyBurn: newBurn,
        runwayMonths: computeRunway(state.cash, newBurn, state.monthsTotal),
      };
    }

    case "SET_OFFICE": {
      const choice = officeChoices.find((c) => c.id === action.payload);
      if (!choice) return state;
      const oldOffice = state.officeChoice ? officeChoices.find((c) => c.id === state.officeChoice) : null;
      const oldCost = oldOffice ? oldOffice.monthlyCost : 0;
      const newBurn = state.monthlyBurn - oldCost + choice.monthlyCost;
      return {
        ...state,
        officeChoice: action.payload,
        monthlyBurn: newBurn,
        runwayMonths: computeRunway(state.cash, newBurn, state.monthsTotal),
      };
    }

    case "SET_GROWTH": {
      const allGrowth = [...b2cGrowthChoices, ...b2bGrowthChoices];
      const choice = allGrowth.find((c) => c.id === action.payload);
      if (!choice) return state;

      // Remove old growth cost if already set
      const oldGrowthChoice = state.growthChoice ? allGrowth.find((c) => c.id === state.growthChoice) : null;
      const oldMonthly = oldGrowthChoice ? oldGrowthChoice.monthlyCost : 0;

      const newBurn = state.monthlyBurn - oldMonthly + choice.monthlyCost;
      const newCash = state.cash - choice.oneTimeCost;

      return {
        ...state,
        growthChoice: action.payload,
        monthlyBurn: newBurn,
        cash: newCash,
        runwayMonths: computeRunway(newCash, newBurn, state.monthsTotal),
      };
    }

    case "ACCEPT_TEMPTATION": {
      const temptation = temptations.find((t) => t.id === action.payload);
      if (!temptation) return state;
      if (state.temptationsAccepted.includes(action.payload)) return state;
      const newCash = state.cash - temptation.cost;
      return {
        ...state,
        cash: newCash,
        temptationsAccepted: [...state.temptationsAccepted, action.payload],
        runwayMonths: computeRunway(newCash, state.monthlyBurn, state.monthsTotal),
      };
    }

    case "SKIP_TEMPTATION": {
      return state;
    }

    case "RESOLVE_CURVEBALL": {
      const { id, choice } = action.payload;
      const curveball = curveballs.find((c) => c.id === id);
      if (!curveball) return state;

      let newCash = state.cash;
      if (choice === "fix") {
        newCash = state.cash - curveball.fixCost;
      }

      return {
        ...state,
        curveballId: id,
        curveballResolution: choice,
        cash: newCash,
        runwayMonths: computeRunway(newCash, state.monthlyBurn, state.monthsTotal),
      };
    }

    case "RUN_SIMULATION": {
      const result = simulateGame(state);
      return {
        ...state,
        monthEvents: result.monthEvents,
        mrr: result.finalMrr,
        arr: result.finalArr,
        mau: result.finalMau,
        customers: result.finalCustomers,
        momGrowth: result.momGrowth,
        retention: result.retention,
        outcome: result.outcome,
        easterEgg: result.easterEgg,
      };
    }

    case "NEXT_SCREEN": {
      return { ...state, screen: state.screen + 1 };
    }

    case "RESTART": {
      return initialState();
    }

    default: {
      return state;
    }
  }
}
