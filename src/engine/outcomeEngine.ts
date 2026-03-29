import type { GameState, MonthEvent } from "./gameState";
import { getMonthlyBurn, getOneTimeCosts, getRemainingCash } from "./gameReducer";
import { TOTAL_MONTHS, MIN_RUNWAY_TO_SURVIVE, MAX_LIFESTYLE_RATIO } from "./constants";

interface SimResult {
  monthEvents: MonthEvent[];
  outcome: "raised" | "died";
  diedAtMonth: number | null;
  founderType: string;
  burnEfficiency: number;
}

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function choiceSeed(state: GameState): number {
  let hash = 0;
  const str = state.markets.join("") + state.team.map((t) => t.count).join("") + state.lifestyle.filter((l) => l.selected).map((l) => l.id).join("");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function simulateGame(state: GameState): SimResult {
  const rand = seededRandom(choiceSeed(state));
  const events: MonthEvent[] = [];
  const monthlyBurn = getMonthlyBurn(state);
  const oneTimeCosts = getOneTimeCosts(state);
  let cash = getRemainingCash(state);
  let diedAtMonth: number | null = null;
  const hasEngineers = state.team.some((t) => ["senior_eng", "junior_eng", "offshore", "cofounder"].includes(t.id) && t.count > 0);
  const hasGrowth = state.growth.some((g) => g.selected);
  const lifestyleSpend = state.lifestyle.filter((l) => l.selected).reduce((s, l) => s + l.oneTimeCost + l.monthlyCost * TOTAL_MONTHS, 0);
  const totalBudget = 250_000;
  const lifestyleRatio = lifestyleSpend / totalBudget;
  const headcount = state.team.reduce((s, t) => s + t.count, 0);

  // Revenue model
  const targetMRR = state.revenue.pricePerMonth * state.revenue.targetCustomers;
  const hasRevenue = targetMRR > 0;
  let currentMRR = 0;

  // Choice-based event generation
  const choiceEvents: { month: number; text: string; emoji: string }[] = [];

  if (state.team.find((t) => t.id === "sales" && t.count > 0)) {
    choiceEvents.push({ month: 4, text: "your sales rep booked 3 demos. 2 were the wrong ICP.", emoji: "🤝" });
  }
  if (state.growth.find((g) => g.id === "tiktok" && g.selected)) {
    choiceEvents.push({ month: 5, text: "your tiktok went viral. 200K views. 3 signups.", emoji: "🎬" });
  }
  if (state.lifestyle.find((l) => l.id === "vests" && l.selected)) {
    choiceEvents.push({ month: 2, text: "team photo in matching vests. 47 LinkedIn likes.", emoji: "🧥" });
  }
  if (state.lifestyle.find((l) => l.id === "offsite" && l.selected)) {
    choiceEvents.push({ month: 9, text: "team offsite in goa. someone cried. someone quit.", emoji: "🏖️" });
  }
  if (state.lifestyle.filter((l) => l.selected).length === 0 && headcount <= 1) {
    choiceEvents.push({ month: 6, text: "you haven't left your apartment in 3 weeks. your posture is concerning.", emoji: "🏠" });
  }
  if (state.growth.find((g) => g.id === "producthunt" && g.selected)) {
    choiceEvents.push({ month: 3, text: "Product Hunt launch! #4 product of the day. your mom upvoted.", emoji: "🚀" });
  }
  if (state.growth.find((g) => g.id === "meta_ads" && g.selected)) {
    choiceEvents.push({ month: 6, text: "your CAC is $47. your LTV is $12. this is fine.", emoji: "💸" });
  }
  if (state.lifestyle.find((l) => l.id === "branding" && l.selected)) {
    choiceEvents.push({ month: 3, text: "branding agency delivered. you picked the logo your mom liked.", emoji: "🎯" });
  }
  if (state.offices.find((o) => o.id === "garage" && o.selected)) {
    choiceEvents.push({ month: 1, text: "working from parents' garage. dad keeps asking 'so what does it DO?'", emoji: "🚗" });
  }
  if (hasRevenue && state.revenue.pricePerMonth > 0) {
    const isB2B = state.markets.includes("b2b");
    choiceEvents.push({ month: 2, text: isB2B ? "first demo booked. they asked for a discount before seeing the product." : "first paying user! they'll churn in 3 days but still.", emoji: "💰" });
    if (targetMRR > 20000) {
      choiceEvents.push({ month: 10, text: `MRR is climbing. $${Math.floor(targetMRR * 0.4).toLocaleString()}/mo. investors are 'intrigued'.`, emoji: "📈" });
    }
    if (targetMRR > 5000) {
      choiceEvents.push({ month: 14, text: "revenue is real. you can taste the series A.", emoji: "🎯" });
    }
  }

  // Simulate months
  const genericEvents = [
    { text: "first user signed up. it was your cofounder's mom.", emoji: "👋" },
    { text: "investor replied 'interesting, keep me posted.' (translation: no.)", emoji: "📧" },
    { text: "shipped v0.1. it crashed immediately.", emoji: "🚀" },
    { text: "got featured on Hacker News. servers died.", emoji: "🔥" },
    { text: "competitor copied your landing page word for word.", emoji: "😤" },
    { text: "had a 'strategy day'. nothing changed.", emoji: "📋" },
    { text: "hit $1K MRR. you cried a little.", emoji: "💰" },
    { text: "your intern shipped a feature that actually works.", emoji: "🎒" },
    { text: "eating ramen unironically.", emoji: "🍜" },
    { text: "someone on twitter called your product 'mid'.", emoji: "😐" },
    { text: "metrics actually looking good for once.", emoji: "📈" },
    { text: "the pitch meeting is tomorrow.", emoji: "😰" },
  ];

  for (let month = 1; month <= TOTAL_MONTHS; month++) {
    // Team burn is dynamic — only pay team members who are still on contract
    const teamBurnThisMonth = state.team.reduce((s, t) => s + (month <= t.months ? t.salary * t.count : 0), 0);
    const nonTeamBurn = monthlyBurn - state.team.reduce((s, t) => s + t.salary * t.count, 0);
    const burnThisMonth = teamBurnThisMonth + nonTeamBurn;

    // Revenue ramps up — you don't hit target MRR on day 1
    // Ramp: reach ~60% of target by month 9, ~90% by month 15, 100% by month 18
    if (hasRevenue && hasEngineers) {
      const rampFactor = Math.min(1, (month / TOTAL_MONTHS) * 1.2) * (0.5 + rand() * 0.5);
      const newCustomersThisMonth = Math.floor(state.revenue.targetCustomers * rampFactor / TOTAL_MONTHS);
      const revenueThisMonth = newCustomersThisMonth * state.revenue.pricePerMonth;
      currentMRR += revenueThisMonth;
      cash += currentMRR; // MRR offsets burn
    }

    cash -= burnThisMonth;

    if (cash <= 0 && diedAtMonth === null) {
      diedAtMonth = month;
      events.push({ month, text: "you ran out of money.", emoji: "💀", moneyDelta: 0 });
      break;
    }

    // Check if any team contracts just ended
    for (const t of state.team) {
      if (t.count > 0 && t.months === month) {
        choiceEvents.push({ month, text: `your ${t.role.toLowerCase()}'s ${t.months}-month contract just ended. bye.`, emoji: "👋" });
      }
    }

    // Check for choice-based events first
    const choiceEvent = choiceEvents.find((e) => e.month === month);
    if (choiceEvent) {
      events.push({ month, text: choiceEvent.text, emoji: choiceEvent.emoji, moneyDelta: -burnThisMonth });
    } else {
      // Generic event based on progression
      const idx = Math.min(month - 1, genericEvents.length - 1);
      const evt = rand() > 0.4 ? genericEvents[idx] : genericEvents[Math.floor(rand() * genericEvents.length)];
      events.push({ month, text: evt.text, emoji: evt.emoji, moneyDelta: -burnThisMonth });
    }
  }

  // Determine outcome — revenue model matters now
  let outcome: "raised" | "died";
  if (diedAtMonth !== null) {
    outcome = "died";
  } else if (!hasEngineers) {
    outcome = "died";
    diedAtMonth = TOTAL_MONTHS;
  } else if (lifestyleRatio > MAX_LIFESTYLE_RATIO) {
    outcome = "died";
    diedAtMonth = TOTAL_MONTHS;
  } else if (!hasGrowth && !hasRevenue) {
    outcome = "died"; // No traction AND no revenue model = no raise
    diedAtMonth = TOTAL_MONTHS;
  } else if (cash > MIN_RUNWAY_TO_SURVIVE && currentMRR > 5000) {
    outcome = "raised"; // Cash + real revenue = strong raise
  } else if (cash > MIN_RUNWAY_TO_SURVIVE && hasGrowth && hasRevenue) {
    outcome = "raised"; // Survived + growth + revenue plan
  } else if (currentMRR > 10000) {
    outcome = "raised"; // Revenue saves you even if cash is tight
  } else if (cash > 0 && (hasGrowth || hasRevenue)) {
    outcome = rand() > 0.4 ? "raised" : "died"; // coin flip with slight edge
  } else {
    outcome = "died";
    if (diedAtMonth === null) diedAtMonth = TOTAL_MONTHS;
  }

  // Categorize founder
  let founderType: string;
  if (lifestyleRatio > 0.4) {
    founderType = "The Lifestyle Founder";
  } else if (monthlyBurn === 0 && oneTimeCosts < 10000) {
    founderType = "The Ghost";
  } else if (monthlyBurn < 15000 && outcome === "raised") {
    founderType = "The Lean Machine";
  } else if (monthlyBurn > 40000) {
    founderType = "The Burner";
  } else {
    founderType = outcome === "raised" ? "The Scrappy Survivor" : "The Cautionary Tale";
  }

  // Burn efficiency (0-100)
  const burnEfficiency = Math.max(0, Math.min(100, Math.round(
    (cash > 0 ? 30 : 0) +
    (hasGrowth ? 25 : 0) +
    (hasEngineers ? 25 : 0) +
    (lifestyleRatio < 0.2 ? 20 : lifestyleRatio < 0.4 ? 10 : 0)
  )));

  return { monthEvents: events, outcome, diedAtMonth, founderType, burnEfficiency };
}
