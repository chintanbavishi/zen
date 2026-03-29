export type BusinessType = "b2b" | "b2c";
export type TeamChoice = "cto_friend" | "senior" | "offshore" | "solo";
export type OfficeChoice = "apartment" | "wework" | "real_office" | "bangalore";
export type B2CGrowth = "organic" | "paid_ads" | "influencer" | "pr_stunt";
export type B2BGrowth = "cold_email" | "sales_rep" | "content" | "network";
export type GrowthChoice = B2CGrowth | B2BGrowth;
export type TemptationId = "lisbon" | "rebrand" | "sxsw" | "merch";
export type CurveballId = "cto_equity" | "aws_bill" | "refund" | "competitor" | "pivot";

export interface MonthEvent {
  month: number;
  text: string;
  mrrDelta?: number;
  mauDelta?: number;
  cashDelta?: number;
}

export interface GameState {
  screen: number;
  cash: number;
  monthlyBurn: number;
  monthsTotal: number;
  runwayMonths: number;
  businessType: BusinessType | null;
  teamChoice: TeamChoice | null;
  officeChoice: OfficeChoice | null;
  growthChoice: GrowthChoice | null;
  temptationsAccepted: TemptationId[];
  curveballId: CurveballId | null;
  curveballResolution: "fix" | "ignore" | null;
  mrr: number;
  arr: number;
  mau: number;
  customers: number;
  momGrowth: number;
  retention: number;
  monthEvents: MonthEvent[];
  outcome: "raised" | "died" | null;
  easterEgg: string | null;
}

export type GameAction =
  | { type: "SET_TYPE"; payload: BusinessType }
  | { type: "SET_TEAM"; payload: TeamChoice }
  | { type: "SET_OFFICE"; payload: OfficeChoice }
  | { type: "SET_GROWTH"; payload: GrowthChoice }
  | { type: "ACCEPT_TEMPTATION"; payload: TemptationId }
  | { type: "SKIP_TEMPTATION"; payload: TemptationId }
  | { type: "RESOLVE_CURVEBALL"; payload: { id: CurveballId; choice: "fix" | "ignore" } }
  | { type: "RUN_SIMULATION" }
  | { type: "NEXT_SCREEN" }
  | { type: "RESTART" };
