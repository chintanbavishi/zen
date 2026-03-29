import type { GameState, GameAction } from "./gameState";
import { STARTING_CASH, TOTAL_MONTHS } from "./constants";
import { initialTeam, initialOffices, initialGrowth, initialLifestyle, curveballPool } from "./gameData";
import { simulateGame } from "./outcomeEngine";

export function initialState(): GameState {
  return {
    screen: 0,
    cash: STARTING_CASH,
    markets: [],
    revenue: { pricePerMonth: 0, targetCustomers: 0 },
    team: initialTeam.map((t) => ({ ...t })),
    offices: initialOffices.map((o) => ({ ...o })),
    growth: initialGrowth.map((g) => ({ ...g })),
    lifestyle: initialLifestyle.map((l) => ({ ...l })),
    curveballs: [],
    curveballResponses: [],
    monthEvents: [],
    outcome: null,
    diedAtMonth: null,
    founderType: null,
    burnEfficiency: 0,
  };
}

export function getMonthlyBurn(state: GameState): number {
  const teamBurn = state.team.reduce((sum, t) => sum + t.salary * t.count, 0);
  const headcount = state.team.reduce((sum, t) => sum + t.count, 0);
  const officeBurn = state.offices
    .filter((o) => o.selected)
    .reduce((sum, o) => sum + (o.perPerson ? o.monthlyCost * Math.max(1, headcount) : o.monthlyCost), 0);
  const growthBurn = state.growth.filter((g) => g.selected).reduce((sum, g) => sum + g.monthlyCost, 0);
  const lifestyleBurn = state.lifestyle.filter((l) => l.selected).reduce((sum, l) => sum + l.monthlyCost, 0);
  return teamBurn + officeBurn + growthBurn + lifestyleBurn;
}

export function getOneTimeCosts(state: GameState): number {
  const growthOnetime = state.growth.filter((g) => g.selected).reduce((sum, g) => sum + g.oneTimeCost, 0);
  const lifestyleOnetime = state.lifestyle.filter((l) => l.selected).reduce((sum, l) => sum + l.oneTimeCost, 0);
  const curveballCosts = state.curveballResponses.reduce((sum, r) => {
    const cb = state.curveballs.find((c) => c.id === r.id);
    if (!cb) return sum;
    return sum + (r.choice === "a" ? cb.optionA.cost : cb.optionB.cost);
  }, 0);
  return growthOnetime + lifestyleOnetime + curveballCosts;
}

export function getTotalCommittedSpend(state: GameState): number {
  // Team: salary × count × their contract months
  const teamTotal = state.team.reduce((sum, t) => sum + t.salary * t.count * t.months, 0);
  // Office/growth/lifestyle monthly costs × full 18 months
  const headcount = state.team.reduce((sum, t) => sum + t.count, 0);
  const officeTotal = state.offices
    .filter((o) => o.selected)
    .reduce((sum, o) => sum + (o.perPerson ? o.monthlyCost * Math.max(1, headcount) : o.monthlyCost) * TOTAL_MONTHS, 0);
  const growthMonthlyTotal = state.growth.filter((g) => g.selected).reduce((sum, g) => sum + g.monthlyCost * TOTAL_MONTHS, 0);
  const lifestyleMonthlyTotal = state.lifestyle.filter((l) => l.selected).reduce((sum, l) => sum + l.monthlyCost * TOTAL_MONTHS, 0);
  return teamTotal + officeTotal + growthMonthlyTotal + lifestyleMonthlyTotal + getOneTimeCosts(state);
}

export function getRemainingCash(state: GameState): number {
  return Math.max(0, state.cash - getTotalCommittedSpend(state));
}

export function getRunwayMonths(state: GameState): number {
  // Simulate month by month to get accurate runway with variable team durations
  const headcount = state.team.reduce((sum, t) => sum + t.count, 0);
  const officeBurn = state.offices
    .filter((o) => o.selected)
    .reduce((sum, o) => sum + (o.perPerson ? o.monthlyCost * Math.max(1, headcount) : o.monthlyCost), 0);
  const growthBurn = state.growth.filter((g) => g.selected).reduce((sum, g) => sum + g.monthlyCost, 0);
  const lifestyleBurn = state.lifestyle.filter((l) => l.selected).reduce((sum, l) => sum + l.monthlyCost, 0);
  const fixedMonthly = officeBurn + growthBurn + lifestyleBurn;

  let cash = state.cash - getOneTimeCosts(state);
  for (let m = 1; m <= TOTAL_MONTHS; m++) {
    const teamBurn = state.team.reduce((s, t) => s + (m <= t.months ? t.salary * t.count : 0), 0);
    cash -= (teamBurn + fixedMonthly);
    if (cash <= 0) return m - 1 + (cash + teamBurn + fixedMonthly > 0 ? (cash + teamBurn + fixedMonthly) / (teamBurn + fixedMonthly) : 0);
  }
  return TOTAL_MONTHS;
}

function pickCurveballs(state: GameState): typeof curveballPool {
  // Seeded shuffle based on choices
  const seed = state.markets.length + state.team.reduce((s, t) => s + t.count, 0) + state.offices.filter((o) => o.selected).length;
  const shuffled = [...curveballPool].sort((a, b) => {
    const ha = a.id.charCodeAt(0) * 31 + seed;
    const hb = b.id.charCodeAt(0) * 31 + seed;
    return (ha % 97) - (hb % 97);
  });
  return shuffled.slice(0, 3);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "TOGGLE_MARKET": {
      // Single-select: set to this one, or deselect if already selected
      const markets = state.markets.includes(action.payload) ? [] : [action.payload];
      return { ...state, markets };
    }

    case "SET_TEAM_COUNT": {
      const team = state.team.map((t) =>
        t.id === action.payload.id ? { ...t, count: Math.max(0, Math.min(5, action.payload.count)) } : t
      );
      return { ...state, team };
    }

    case "SET_TEAM_SALARY": {
      const team = state.team.map((t) =>
        t.id === action.payload.id ? { ...t, salary: Math.max(0, action.payload.salary) } : t
      );
      return { ...state, team };
    }

    case "SET_TEAM_MONTHS": {
      const team = state.team.map((t) =>
        t.id === action.payload.id ? { ...t, months: Math.max(1, Math.min(18, action.payload.months)) } : t
      );
      return { ...state, team };
    }

    case "SET_REVENUE_PRICE":
      return { ...state, revenue: { ...state.revenue, pricePerMonth: Math.max(0, action.payload) } };

    case "SET_REVENUE_CUSTOMERS":
      return { ...state, revenue: { ...state.revenue, targetCustomers: Math.max(0, action.payload) } };

    case "TOGGLE_OFFICE": {
      const offices = state.offices.map((o) =>
        o.id === action.payload ? { ...o, selected: !o.selected } : o
      );
      return { ...state, offices };
    }

    case "TOGGLE_GROWTH": {
      const growth = state.growth.map((g) =>
        g.id === action.payload ? { ...g, selected: !g.selected } : g
      );
      return { ...state, growth };
    }

    case "TOGGLE_LIFESTYLE": {
      const lifestyle = state.lifestyle.map((l) =>
        l.id === action.payload ? { ...l, selected: !l.selected } : l
      );
      return { ...state, lifestyle };
    }

    case "RESPOND_CURVEBALL": {
      return {
        ...state,
        curveballResponses: [...state.curveballResponses, action.payload],
      };
    }

    case "RUN_SIMULATION": {
      const result = simulateGame(state);
      return {
        ...state,
        monthEvents: result.monthEvents,
        outcome: result.outcome,
        diedAtMonth: result.diedAtMonth,
        founderType: result.founderType,
        burnEfficiency: result.burnEfficiency,
      };
    }

    case "NEXT_SCREEN": {
      const next = state.screen + 1;
      // Generate curveballs when entering curveball screen (screen 6)
      if (next === 7 && state.curveballs.length === 0) {
        return { ...state, screen: next, curveballs: pickCurveballs(state) };
      }
      return { ...state, screen: next };
    }

    case "PREV_SCREEN":
      return { ...state, screen: Math.max(0, state.screen - 1) };

    case "RESTART":
      return initialState();

    default:
      return state;
  }
}
