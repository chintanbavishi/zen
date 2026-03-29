import type { GameState, MonthEvent } from "./gameState";
import {
  TOTAL_MONTHS,
  SERIES_A_THRESHOLD_B2B_ARR,
  SERIES_A_THRESHOLD_B2C_MAU,
  SERIES_A_THRESHOLD_GROWTH,
} from "./constants";

export interface SimResult {
  monthEvents: MonthEvent[];
  finalMrr: number;
  finalArr: number;
  finalMau: number;
  finalCustomers: number;
  finalCash: number;
  momGrowth: number;
  retention: number;
  outcome: "raised" | "died";
  easterEgg: string | null;
}

// Simple seeded pseudo-random number generator (mulberry32)
function makePrng(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function choiceToSeed(state: GameState): number {
  const parts = [
    state.businessType ?? "none",
    state.teamChoice ?? "none",
    state.officeChoice ?? "none",
    state.growthChoice ?? "none",
    state.curveballId ?? "none",
    state.curveballResolution ?? "none",
    ...state.temptationsAccepted,
  ];
  let hash = 0;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

const TEAM_MULTIPLIERS: Record<string, number> = {
  senior: 1.5,
  offshore: 1.2,
  cto_friend: 1.0,
  solo: 0.6,
};

const GROWTH_MULTIPLIERS: Record<string, number> = {
  paid_ads: 1.8,
  influencer: 2.0,
  sales_rep: 1.6,
  cold_email: 1.2,
  content: 1.0,
  pr_stunt: 1.4,
  organic: 0.8,
  network: 1.1,
};

const SPECIAL_EVENTS_B2C = [
  { text: "You got featured on Hacker News. 5,000 signups overnight.", mauDelta: 5000 },
  { text: "A tweet went viral. The internet giveth.", mauDelta: 8000 },
  { text: "TechCrunch mentioned you in passing. Still counts.", mauDelta: 3000 },
  { text: "Product Hunt #1 of the day. Your mom is proud.", mauDelta: 6000 },
  { text: "Reddit thread about your product. Mixed reviews. Still traffic.", mauDelta: 4000 },
];

const SPECIAL_EVENTS_B2B = [
  { text: "Closed a whale customer. $25K MRR from one deal.", mrrDelta: 25_000 },
  { text: "Got a case study published. 3 inbound leads.", mrrDelta: 8_000 },
  { text: "A Fortune 500 wants a pilot. No commitment yet, but exciting.", mrrDelta: 0 },
  { text: "LinkedIn post went viral. VCs are sliding into your DMs.", mrrDelta: 12_000 },
  { text: "Conference talk landed two enterprise deals.", mrrDelta: 18_000 },
];

const BAD_EVENTS = [
  { text: "Your top engineer quit. Productivity down 30% this month.", mrrDelta: -0.1 },
  { text: "A bug took down the app for 6 hours. Churn spiked.", mrrDelta: -0.05 },
  { text: "Key customer churned. It happens.", mrrDelta: -0.08 },
];

export function simulateGame(state: GameState): SimResult {
  const rng = makePrng(choiceToSeed(state));

  const teamMult = TEAM_MULTIPLIERS[state.teamChoice ?? "solo"] ?? 1.0;
  const growthMult = GROWTH_MULTIPLIERS[state.growthChoice ?? "organic"] ?? 1.0;

  const isB2B = state.businessType === "b2b";

  // Base growth rates per month
  const baseMonthlyGrowthRate = isB2B ? 0.12 : 0.08;
  const effectiveGrowthRate = baseMonthlyGrowthRate * teamMult * growthMult;

  // Starting metrics
  let mrr = isB2B ? 5_000 : 500;
  let mau = isB2B ? 50 : 1_000;
  let customers = isB2B ? 3 : 0;
  let cash = state.cash;
  const monthlyBurn = state.monthlyBurn;

  const monthEvents: MonthEvent[] = [];
  let prevMrr = mrr;

  for (let month = 1; month <= TOTAL_MONTHS; month++) {
    // Burn cash
    cash -= monthlyBurn;

    // Grow metrics
    const growthRoll = effectiveGrowthRate + (rng() - 0.5) * 0.05;
    if (isB2B) {
      const newCustomers = Math.floor(rng() * teamMult * growthMult * 2) + 1;
      customers += newCustomers;
      const revenuePerCustomer = 800 + Math.floor(rng() * 1200);
      mrr += newCustomers * revenuePerCustomer;
    } else {
      const mauGrowth = Math.floor(mau * growthRoll);
      mau += mauGrowth;
      // B2C: small % converts to paid
      const conversionRate = 0.02 + rng() * 0.01;
      mrr = Math.floor(mau * conversionRate * 10);
    }

    // Apply retention decay
    const retentionRate = 0.92 + rng() * 0.06;
    mrr = Math.floor(mrr * retentionRate);
    if (!isB2B) {
      mau = Math.floor(mau * (0.85 + rng() * 0.1));
    }

    // Curveball fallout at month 8 if ignored
    if (month === 8 && state.curveballId && state.curveballResolution === "ignore") {
      mrr = Math.floor(mrr * 0.8);
      monthEvents.push({
        month,
        text: `The ${state.curveballId.replace(/_/g, " ")} situation you ignored came back to bite you. -20% MRR.`,
        mrrDelta: -Math.floor(mrr * 0.2),
      });
    }

    // Special events ~15% chance
    const eventRoll = rng();
    if (eventRoll < 0.08) {
      // Good event
      if (isB2B) {
        const evt = SPECIAL_EVENTS_B2B[Math.floor(rng() * SPECIAL_EVENTS_B2B.length)];
        if (evt.mrrDelta > 0) {
          mrr += evt.mrrDelta;
          customers += Math.floor(evt.mrrDelta / 1200);
        }
        monthEvents.push({ month, text: evt.text, mrrDelta: evt.mrrDelta });
      } else {
        const evt = SPECIAL_EVENTS_B2C[Math.floor(rng() * SPECIAL_EVENTS_B2C.length)];
        mau += evt.mauDelta;
        monthEvents.push({ month, text: evt.text, mauDelta: evt.mauDelta });
      }
    } else if (eventRoll < 0.12) {
      // Bad event
      const evt = BAD_EVENTS[Math.floor(rng() * BAD_EVENTS.length)];
      if (evt.mrrDelta < 0) {
        const mrrLoss = Math.floor(mrr * Math.abs(evt.mrrDelta));
        mrr -= mrrLoss;
        monthEvents.push({ month, text: evt.text, mrrDelta: -mrrLoss });
      }
    }

    // Check death condition
    if (cash <= 0) {
      monthEvents.push({ month, text: `You ran out of money in month ${month}. The dream is over.`, cashDelta: cash });
      // Determine easter egg
      let easterEgg: string | null = null;
      if (state.temptationsAccepted.length === 4) {
        easterEgg = "Impressive. You burned through $26K on vibes before the product even worked. Respect.";
      }
      return {
        monthEvents,
        finalMrr: mrr,
        finalArr: mrr * 12,
        finalMau: mau,
        finalCustomers: customers,
        finalCash: cash,
        momGrowth: prevMrr > 0 ? Math.round(((mrr - prevMrr) / prevMrr) * 100) : 0,
        retention: Math.round(retentionRate * 100),
        outcome: "died",
        easterEgg,
      };
    }

    // Track MoM for last month
    if (month === TOTAL_MONTHS - 1) {
      prevMrr = mrr;
    }
  }

  // Post-simulation outcome determination
  const arr = mrr * 12;
  const finalMomGrowth = prevMrr > 0 ? Math.round(((mrr - prevMrr) / prevMrr) * 100) : 0;
  const meetsGrowth = finalMomGrowth >= SERIES_A_THRESHOLD_GROWTH;

  let raised = false;
  if (isB2B && arr >= SERIES_A_THRESHOLD_B2B_ARR && meetsGrowth) {
    raised = true;
  } else if (!isB2B && mau >= SERIES_A_THRESHOLD_B2C_MAU && meetsGrowth) {
    raised = true;
  } else {
    // Luck factor: small chance to raise even below threshold
    const luckRoll = rng();
    if (luckRoll > 0.85 && cash > 50_000) {
      raised = true;
    }
  }

  // Easter eggs
  let easterEgg: string | null = null;
  if (state.monthlyBurn === 0 && state.temptationsAccepted.length === 0) {
    easterEgg = "You still have runway. In fact, you'll outlast most Series A companies.";
  } else if (state.temptationsAccepted.length === 4 && !raised) {
    easterEgg = "Impressive. You burned through $26K on vibes before the product even worked. Respect.";
  }

  return {
    monthEvents,
    finalMrr: mrr,
    finalArr: arr,
    finalMau: mau,
    finalCustomers: customers,
    finalCash: cash,
    momGrowth: finalMomGrowth,
    retention: 92,
    outcome: raised ? "raised" : "died",
    easterEgg,
  };
}
