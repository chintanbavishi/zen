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
    cash -= monthlyBurn;

    if (cash <= 0 && diedAtMonth === null) {
      diedAtMonth = month;
      events.push({ month, text: "you ran out of money.", emoji: "💀", moneyDelta: 0 });
      break;
    }

    // Check for choice-based events first
    const choiceEvent = choiceEvents.find((e) => e.month === month);
    if (choiceEvent) {
      events.push({ month, text: choiceEvent.text, emoji: choiceEvent.emoji, moneyDelta: -monthlyBurn });
    } else {
      // Generic event based on progression
      const idx = Math.min(month - 1, genericEvents.length - 1);
      const evt = rand() > 0.4 ? genericEvents[idx] : genericEvents[Math.floor(rand() * genericEvents.length)];
      events.push({ month, text: evt.text, emoji: evt.emoji, moneyDelta: -monthlyBurn });
    }
  }

  // Determine outcome
  let outcome: "raised" | "died";
  if (diedAtMonth !== null) {
    outcome = "died";
  } else if (!hasGrowth) {
    outcome = "died"; // No traction = no raise
    if (diedAtMonth === null) diedAtMonth = TOTAL_MONTHS;
  } else if (lifestyleRatio > MAX_LIFESTYLE_RATIO) {
    outcome = "died"; // Spent too much on lifestyle
    if (diedAtMonth === null) diedAtMonth = TOTAL_MONTHS;
  } else if (!hasEngineers) {
    outcome = "died"; // Nothing got built
    if (diedAtMonth === null) diedAtMonth = TOTAL_MONTHS;
  } else if (cash > MIN_RUNWAY_TO_SURVIVE && hasGrowth && hasEngineers) {
    outcome = "raised";
  } else {
    outcome = rand() > 0.5 ? "raised" : "died";
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
