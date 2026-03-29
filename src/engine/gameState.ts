export type MarketType = "b2b" | "b2c";

export interface TeamMember {
  id: string;
  role: string;
  emoji: string;
  description: string;
  defaultSalary: number;
  salary: number;
  count: number;
  months: number;
  b2bOnly?: boolean;
}

export interface OfficeOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  monthlyCost: number;
  perPerson?: boolean;
  selected: boolean;
}

export interface GrowthOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  monthlyCost: number;
  oneTimeCost: number;
  selected: boolean;
  market: "b2b" | "b2c" | "both";
}

export interface LifestyleItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  monthlyCost: number;
  oneTimeCost: number;
  selected: boolean;
}

export interface CurveballEvent {
  id: string;
  text: string;
  emoji: string;
  optionA: { label: string; cost: number; effect: string };
  optionB: { label: string; cost: number; effect: string };
}

export interface CurveballResponse {
  id: string;
  choice: "a" | "b";
}

export interface MonthEvent {
  month: number;
  text: string;
  emoji: string;
  moneyDelta: number;
}

export interface GameState {
  screen: number;
  cash: number;
  markets: MarketType[];
  team: TeamMember[];
  offices: OfficeOption[];
  growth: GrowthOption[];
  lifestyle: LifestyleItem[];
  curveballs: CurveballEvent[];
  curveballResponses: CurveballResponse[];
  monthEvents: MonthEvent[];
  outcome: "raised" | "died" | null;
  diedAtMonth: number | null;
  founderType: string | null;
  burnEfficiency: number;
}

export type GameAction =
  | { type: "TOGGLE_MARKET"; payload: MarketType }
  | { type: "SET_TEAM_COUNT"; payload: { id: string; count: number } }
  | { type: "SET_TEAM_SALARY"; payload: { id: string; salary: number } }
  | { type: "SET_TEAM_MONTHS"; payload: { id: string; months: number } }
  | { type: "TOGGLE_OFFICE"; payload: string }
  | { type: "TOGGLE_GROWTH"; payload: string }
  | { type: "TOGGLE_LIFESTYLE"; payload: string }
  | { type: "RESPOND_CURVEBALL"; payload: CurveballResponse }
  | { type: "RUN_SIMULATION" }
  | { type: "NEXT_SCREEN" }
  | { type: "PREV_SCREEN" }
  | { type: "RESTART" };
