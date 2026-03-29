# burn.money Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "burn.money" — a neal.fun-style interactive startup burn rate simulator where you spend $250K of YC funding across 10 screens and get a shareable result.

**Architecture:** Single-page React app with screen-by-screen flow. Each screen is a self-contained component receiving game state and dispatching choices via a central reducer. No backend — all game logic is client-side. Shareable card generated via html-to-image.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 4, Framer Motion, html-to-image, Howler.js (sound), Vercel deployment

---

## File Structure

```
src/
  main.tsx                    — React entry point
  App.tsx                     — Screen router, manages game state
  index.css                   — Tailwind imports + global styles (dark bg, fonts)

  engine/
    gameState.ts              — TypeScript types for all game state
    gameReducer.ts            — Pure reducer: dispatches choices, computes burn/metrics
    gameData.ts               — All static data: choices, events, curveballs, toasts
    outcomeEngine.ts          — Computes final outcome (raise vs die) from metrics
    constants.ts              — Magic numbers: starting cash, months, thresholds

  screens/
    ScreenWire.tsx            — Screen 1: The $250K wire animation
    ScreenType.tsx            — Screen 2: B2B vs B2C picker
    ScreenTeam.tsx            — Screen 3: Team selection
    ScreenOffice.tsx          — Screen 4: Office selection
    ScreenGrowth.tsx          — Screen 5: Growth strategy (diverges on B2B/B2C)
    ScreenTemptation.tsx      — Screen 6: Month 4 temptations
    ScreenCurveball.tsx       — Screen 7: Month 8 curveball
    ScreenFastForward.tsx     — Screen 8: Month-by-month ticker
    ScreenPitch.tsx           — Screen 9: The pitch + VC reactions
    ScreenResult.tsx          — Screen 10: Raised or died + share card

  components/
    BurnCounter.tsx           — Persistent animated money counter (top of every screen)
    ChoiceCard.tsx            — Reusable big choice card with icon, title, subtitle, cost
    TransitionWrapper.tsx     — Framer Motion page transition wrapper
    ShareCard.tsx             — The 1080x1080 shareable result card
    ToastEvent.tsx            — Animated toast for fast-forward events
    VCBubble.tsx              — iMessage-style VC reaction bubble

  hooks/
    useCountUp.ts             — Animated number counting hook
    useBurnTick.ts            — Real-time burn rate ticker (drains money while idle)
    useSound.ts               — Sound effect hook (Howler.js wrapper)

  assets/
    sounds/                   — cha-ching.mp3, heartbeat.mp3, sad-piano.mp3, crowd.mp3

tests/
  engine/
    gameReducer.test.ts       — Reducer logic tests
    outcomeEngine.test.ts     — Outcome computation tests
    gameData.test.ts          — Data integrity tests

index.html                    — Vite HTML entry
package.json                  — Dependencies + scripts
vite.config.ts                — Vite config
tailwind.config.ts            — Tailwind config (custom colors, fonts)
tsconfig.json                 — TypeScript config
```

---

## Task 1: Project Scaffolding + Tailwind + Dark Theme

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Initialize the project with Vite**

```bash
cd "/Users/apple/Cursor Albus/zen"
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted (existing files).

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion howler html-to-image
npm install -D tailwindcss @tailwindcss/vite @types/howler
```

- [ ] **Step 3: Configure Vite with Tailwind plugin**

Replace `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 4: Set up Tailwind with custom theme**

Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-money: #39ff14;
  --color-burn: #ff2d6b;
  --color-traction: #00b4ff;
  --color-warning: #ff9f1c;
  --color-dead: #ff4444;
  --color-surface: #141414;
  --color-bg: #0a0a0a;
  --font-sans: "Space Grotesk", system-ui, sans-serif;
}

@layer base {
  body {
    @apply bg-bg text-white font-sans antialiased;
  }
}
```

- [ ] **Step 5: Set up index.html with Google Fonts**

Replace `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>burn.money</title>
    <meta name="description" content="You just got $250K from YC. Make it last." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create minimal App shell**

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <h1 className="text-5xl font-bold text-money lowercase">burn.money</h1>
    </div>
  );
}
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 7: Verify it runs**

```bash
npm run dev
```

Expected: Dev server at localhost:5173, black screen with green "burn.money" text in Space Grotesk.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tailwind.config.ts tsconfig.json src/main.tsx src/App.tsx src/index.css src/vite-env.d.ts
git commit -m "feat: scaffold project with Vite, React, Tailwind, dark theme"
```

---

## Task 2: Game Engine — Types, Constants, Reducer

**Files:**
- Create: `src/engine/constants.ts`
- Create: `src/engine/gameState.ts`
- Create: `src/engine/gameData.ts`
- Create: `src/engine/gameReducer.ts`
- Create: `src/engine/outcomeEngine.ts`
- Test: `tests/engine/gameReducer.test.ts`
- Test: `tests/engine/outcomeEngine.test.ts`

- [ ] **Step 1: Write the failing reducer test**

Create `tests/engine/gameReducer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { gameReducer, initialState } from "../../src/engine/gameReducer";

describe("gameReducer", () => {
  it("starts with $250,000 and 18 months", () => {
    const state = initialState();
    expect(state.cash).toBe(250_000);
    expect(state.monthsTotal).toBe(18);
    expect(state.monthlyBurn).toBe(0);
  });

  it("SET_TYPE sets businessType to b2b or b2c", () => {
    const state = gameReducer(initialState(), { type: "SET_TYPE", payload: "b2c" });
    expect(state.businessType).toBe("b2c");
  });

  it("SET_TEAM adds monthly cost to burn", () => {
    const state = gameReducer(initialState(), { type: "SET_TEAM", payload: "senior" });
    expect(state.monthlyBurn).toBe(12_000);
    expect(state.teamChoice).toBe("senior");
  });

  it("SET_OFFICE adds monthly cost to burn", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM", payload: "senior" });
    state = gameReducer(state, { type: "SET_OFFICE", payload: "wework" });
    expect(state.monthlyBurn).toBe(12_600);
    expect(state.officeChoice).toBe("wework");
  });

  it("SET_GROWTH adds monthly cost or one-time cost", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TYPE", payload: "b2c" });
    state = gameReducer(state, { type: "SET_GROWTH", payload: "paid_ads" });
    expect(state.monthlyBurn).toBe(5_000);
    expect(state.growthChoice).toBe("paid_ads");
  });

  it("ACCEPT_TEMPTATION subtracts one-time cost from cash", () => {
    let state = initialState();
    state = gameReducer(state, { type: "ACCEPT_TEMPTATION", payload: "rebrand" });
    expect(state.cash).toBe(250_000 - 8_000);
  });

  it("SKIP_TEMPTATION does not reduce cash", () => {
    const before = initialState();
    const after = gameReducer(before, { type: "SKIP_TEMPTATION", payload: "rebrand" });
    expect(after.cash).toBe(250_000);
  });

  it("RESOLVE_CURVEBALL with spend reduces cash", () => {
    let state = initialState();
    state = gameReducer(state, { type: "RESOLVE_CURVEBALL", payload: { id: "aws_bill", choice: "fix" } });
    expect(state.cash).toBeLessThan(250_000);
  });

  it("computes runway correctly", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM", payload: "senior" });
    // $250K / $12K/mo = ~20 months, capped at 18
    expect(state.runwayMonths).toBe(18);
  });

  it("computes runway with high burn", () => {
    let state = initialState();
    state = gameReducer(state, { type: "SET_TEAM", payload: "senior" }); // 12K
    state = gameReducer(state, { type: "SET_OFFICE", payload: "real_office" }); // +4500
    // monthlyBurn = 16500, runway = 250000/16500 = ~15.15
    expect(state.runwayMonths).toBe(15);
  });
});
```

- [ ] **Step 2: Install Vitest and run test to verify it fails**

```bash
npm install -D vitest
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`

```bash
npm test
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create constants**

Create `src/engine/constants.ts`:

```ts
export const STARTING_CASH = 250_000;
export const TOTAL_MONTHS = 18;
export const SERIES_A_THRESHOLD_B2B_ARR = 500_000; // $500K ARR to raise
export const SERIES_A_THRESHOLD_B2C_MAU = 50_000; // 50K MAU to raise
export const SERIES_A_THRESHOLD_GROWTH = 15; // 15% MoM minimum
export const HEARTBEAT_CASH_THRESHOLD = 30_000;
```

- [ ] **Step 4: Create game state types**

Create `src/engine/gameState.ts`:

```ts
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

  // Metrics accumulated during fast-forward
  mrr: number;
  arr: number;
  mau: number;
  customers: number;
  momGrowth: number;
  retention: number;

  monthEvents: MonthEvent[];
  outcome: "raised" | "died" | null;
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
```

- [ ] **Step 5: Create game data (choices, costs, events)**

Create `src/engine/gameData.ts`:

```ts
import type {
  TeamChoice, OfficeChoice, B2CGrowth, B2BGrowth, TemptationId, CurveballId,
} from "./gameState";

export interface ChoiceOption<T extends string> {
  id: T;
  title: string;
  subtitle: string;
  icon: string;
  monthlyCost: number;
  oneTimeCost: number;
}

export const teamChoices: ChoiceOption<TeamChoice>[] = [
  {
    id: "cto_friend",
    title: "the cto friend",
    subtitle: "$0 cash, 25% equity. writes code at 2am. will have a breakdown by month 9.",
    icon: "🤝",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "senior",
    title: "senior engineer",
    subtitle: "$12K/mo. wants health insurance. actually knows what they're doing.",
    icon: "👩‍💻",
    monthlyCost: 12_000,
    oneTimeCost: 0,
  },
  {
    id: "offshore",
    title: "offshore team (3 devs)",
    subtitle: "$8K/mo total. timezone hell, but you ship fast.",
    icon: "🌏",
    monthlyCost: 8_000,
    oneTimeCost: 0,
  },
  {
    id: "solo",
    title: "just you",
    subtitle: "$0. you are the engineer, the designer, the PM, and the therapist.",
    icon: "🫠",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
];

export const officeChoices: ChoiceOption<OfficeChoice>[] = [
  {
    id: "apartment",
    title: "your apartment",
    subtitle: "$0/mo. your cofounder's cat is on every zoom call.",
    icon: "🐱",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "wework",
    title: "wework hot desk",
    subtitle: "$600/mo. free beer on tap. you'll network with 14 crypto bros.",
    icon: "🍺",
    monthlyCost: 600,
    oneTimeCost: 0,
  },
  {
    id: "real_office",
    title: "a real office",
    subtitle: "$4,500/mo. SF rent hits different. but investors love walking into a 'space'.",
    icon: "🏢",
    monthlyCost: 4_500,
    oneTimeCost: 0,
  },
  {
    id: "bangalore",
    title: "bangalore",
    subtitle: "$800/mo. burn rate drops 60%. good luck with those SF investor meetings.",
    icon: "✈️",
    monthlyCost: 800,
    oneTimeCost: 0,
  },
];

export const b2cGrowthChoices: ChoiceOption<B2CGrowth>[] = [
  {
    id: "organic",
    title: "organic / viral",
    subtitle: "$0. you need to be creative. tiktok, memes, HN post.",
    icon: "🌱",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
  {
    id: "paid_ads",
    title: "paid ads",
    subtitle: "$5K/mo. meta/google. you'll learn what 'CAC' means the hard way.",
    icon: "💸",
    monthlyCost: 5_000,
    oneTimeCost: 0,
  },
  {
    id: "influencer",
    title: "influencer deal",
    subtitle: "$15K one-time. one big spike, then silence.",
    icon: "📱",
    monthlyCost: 0,
    oneTimeCost: 15_000,
  },
  {
    id: "pr_stunt",
    title: "PR stunt",
    subtitle: "$2K. do something weird and hope techcrunch notices.",
    icon: "📰",
    monthlyCost: 0,
    oneTimeCost: 2_000,
  },
];

export const b2bGrowthChoices: ChoiceOption<B2BGrowth>[] = [
  {
    id: "cold_email",
    title: "cold email grind",
    subtitle: "$500/mo (tools). you become a linkedin creature.",
    icon: "📧",
    monthlyCost: 500,
    oneTimeCost: 0,
  },
  {
    id: "sales_rep",
    title: "hire a sales rep",
    subtitle: "$8K/mo + commission. they'll promise the moon.",
    icon: "🤵",
    monthlyCost: 8_000,
    oneTimeCost: 0,
  },
  {
    id: "content",
    title: "content marketing",
    subtitle: "$2K/mo. you write blog posts that 47 people read.",
    icon: "✍️",
    monthlyCost: 2_000,
    oneTimeCost: 0,
  },
  {
    id: "network",
    title: "network hustle",
    subtitle: "$0. you call in every favor from every YC batchmate.",
    icon: "🤙",
    monthlyCost: 0,
    oneTimeCost: 0,
  },
];

export const temptations: ChoiceOption<TemptationId>[] = [
  {
    id: "lisbon",
    title: "founder retreat in lisbon",
    subtitle: "$3,500. 'it's for networking.'",
    icon: "🇵🇹",
    monthlyCost: 0,
    oneTimeCost: 3_500,
  },
  {
    id: "rebrand",
    title: "full rebrand",
    subtitle: "$8,000. your designer wants it. you've had 12 users for 3 weeks.",
    icon: "🎨",
    monthlyCost: 0,
    oneTimeCost: 8_000,
  },
  {
    id: "sxsw",
    title: "SXSW booth",
    subtitle: "$12,000. you'll get 200 email signups and a hangover.",
    icon: "🎪",
    monthlyCost: 0,
    oneTimeCost: 12_000,
  },
  {
    id: "merch",
    title: "company merch",
    subtitle: "$2,500. nobody asked for hoodies but you want them.",
    icon: "👕",
    monthlyCost: 0,
    oneTimeCost: 2_500,
  },
];

export interface CurveballOption {
  id: CurveballId;
  text: string;
  fixCost: number;
  fixLabel: string;
  ignoreLabel: string;
  ignoreConsequence: string;
}

export const curveballs: CurveballOption[] = [
  {
    id: "cto_equity",
    text: "your CTO friend wants to renegotiate equity. again.",
    fixCost: 5_000,
    fixLabel: "give them a raise ($5K bonus)",
    ignoreLabel: "tell them to deal with it",
    ignoreConsequence: "dev velocity drops 40% for 2 months",
  },
  {
    id: "aws_bill",
    text: "AWS bill tripled. you left a dev instance running for 4 months.",
    fixCost: 6_000,
    fixLabel: "pay the bill ($6K)",
    ignoreLabel: "migrate to a cheaper provider (1 month delay)",
    ignoreConsequence: "lose 1 month of progress",
  },
  {
    id: "refund",
    text: "your biggest customer wants a refund.",
    fixCost: 4_000,
    fixLabel: "refund them ($4K)",
    ignoreLabel: "fight it and lose the reference",
    ignoreConsequence: "reputation hit, harder to close deals",
  },
  {
    id: "competitor",
    text: "a competitor just raised $10M. they're copying your landing page.",
    fixCost: 3_000,
    fixLabel: "hire a lawyer to send a cease-and-desist ($3K)",
    ignoreLabel: "ship faster and ignore them",
    ignoreConsequence: "morale boost actually, no real downside",
  },
  {
    id: "pivot",
    text: "your cofounder wants to pivot. to AI.",
    fixCost: 10_000,
    fixLabel: "fine, pivot to AI ($10K for GPU credits)",
    ignoreLabel: "stay the course",
    ignoreConsequence: "cofounder is slightly resentful but you keep focus",
  },
];
```

- [ ] **Step 6: Create the reducer**

Create `src/engine/gameReducer.ts`:

```ts
import type { GameState, GameAction } from "./gameState";
import { STARTING_CASH, TOTAL_MONTHS } from "./constants";
import { teamChoices, officeChoices, b2cGrowthChoices, b2bGrowthChoices, temptations, curveballs } from "./gameData";

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
    retention: 0,
    monthEvents: [],
    outcome: null,
  };
}

function computeRunway(cash: number, monthlyBurn: number, totalMonths: number): number {
  if (monthlyBurn <= 0) return totalMonths;
  return Math.min(totalMonths, Math.floor(cash / monthlyBurn));
}

function findChoice<T extends { id: string; monthlyCost: number }>(choices: T[], id: string): T | undefined {
  return choices.find((c) => c.id === id);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, businessType: action.payload };

    case "SET_TEAM": {
      const choice = findChoice(teamChoices, action.payload);
      if (!choice) return state;
      const monthlyBurn = state.monthlyBurn + choice.monthlyCost;
      return {
        ...state,
        teamChoice: action.payload,
        monthlyBurn,
        runwayMonths: computeRunway(state.cash, monthlyBurn, state.monthsTotal),
      };
    }

    case "SET_OFFICE": {
      const choice = findChoice(officeChoices, action.payload);
      if (!choice) return state;
      const monthlyBurn = state.monthlyBurn + choice.monthlyCost;
      return {
        ...state,
        officeChoice: action.payload,
        monthlyBurn,
        runwayMonths: computeRunway(state.cash, monthlyBurn, state.monthsTotal),
      };
    }

    case "SET_GROWTH": {
      const allGrowth = [...b2cGrowthChoices, ...b2bGrowthChoices];
      const choice = allGrowth.find((c) => c.id === action.payload);
      if (!choice) return state;
      const cash = state.cash - choice.oneTimeCost;
      const monthlyBurn = state.monthlyBurn + choice.monthlyCost;
      return {
        ...state,
        growthChoice: action.payload,
        cash,
        monthlyBurn,
        runwayMonths: computeRunway(cash, monthlyBurn, state.monthsTotal),
      };
    }

    case "ACCEPT_TEMPTATION": {
      const temptation = temptations.find((t) => t.id === action.payload);
      if (!temptation) return state;
      const cash = state.cash - temptation.oneTimeCost;
      return {
        ...state,
        cash,
        temptationsAccepted: [...state.temptationsAccepted, action.payload],
        runwayMonths: computeRunway(cash, state.monthlyBurn, state.monthsTotal),
      };
    }

    case "SKIP_TEMPTATION":
      return state;

    case "RESOLVE_CURVEBALL": {
      const curveball = curveballs.find((c) => c.id === action.payload.id);
      if (!curveball) return state;
      const cash = action.payload.choice === "fix" ? state.cash - curveball.fixCost : state.cash;
      return {
        ...state,
        curveballId: action.payload.id,
        curveballResolution: action.payload.choice,
        cash,
        runwayMonths: computeRunway(cash, state.monthlyBurn, state.monthsTotal),
      };
    }

    case "NEXT_SCREEN":
      return { ...state, screen: state.screen + 1 };

    case "RESTART":
      return initialState();

    default:
      return state;
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test
```

Expected: All 9 tests PASS.

- [ ] **Step 8: Write outcome engine tests**

Create `tests/engine/outcomeEngine.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { simulateGame } from "../../src/engine/outcomeEngine";
import { initialState } from "../../src/engine/gameReducer";
import type { GameState } from "../../src/engine/gameState";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...initialState(), ...overrides };
}

describe("simulateGame", () => {
  it("b2b with senior + real_office + sales_rep dies fast", () => {
    const state = stateWith({
      businessType: "b2b",
      teamChoice: "senior",
      officeChoice: "real_office",
      growthChoice: "sales_rep",
      monthlyBurn: 24_500, // 12K + 4.5K + 8K
    });
    const result = simulateGame(state);
    expect(result.outcome).toBe("died");
    expect(result.monthEvents.length).toBeGreaterThan(0);
  });

  it("b2c with solo + apartment + organic can survive", () => {
    const state = stateWith({
      businessType: "b2c",
      teamChoice: "solo",
      officeChoice: "apartment",
      growthChoice: "organic",
      monthlyBurn: 0,
    });
    const result = simulateGame(state);
    // With $0 burn, you survive but metrics may be too low
    expect(result.monthEvents.length).toBe(18);
  });

  it("generates month events for each month", () => {
    const state = stateWith({
      businessType: "b2c",
      teamChoice: "senior",
      officeChoice: "wework",
      growthChoice: "paid_ads",
      monthlyBurn: 17_600,
    });
    const result = simulateGame(state);
    expect(result.monthEvents.length).toBeGreaterThan(0);
    expect(result.monthEvents[0].month).toBe(1);
  });
});
```

- [ ] **Step 9: Create outcome engine**

Create `src/engine/outcomeEngine.ts`:

```ts
import type { GameState, MonthEvent } from "./gameState";
import {
  SERIES_A_THRESHOLD_B2B_ARR,
  SERIES_A_THRESHOLD_B2C_MAU,
  SERIES_A_THRESHOLD_GROWTH,
} from "./constants";

// Seeded random for reproducibility based on choices
function choiceHash(state: GameState): number {
  const str = `${state.teamChoice}-${state.officeChoice}-${state.growthChoice}-${state.temptationsAccepted.join(",")}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface SimResult {
  monthEvents: MonthEvent[];
  mrr: number;
  arr: number;
  mau: number;
  customers: number;
  momGrowth: number;
  retention: number;
  cashRemaining: number;
  outcome: "raised" | "died";
  diedAtMonth: number | null;
}

export function simulateGame(state: GameState): SimResult {
  const rand = seededRandom(choiceHash(state));
  const events: MonthEvent[] = [];
  let cash = state.cash;
  let mrr = 0;
  let mau = 0;
  let customers = 0;
  const isB2B = state.businessType === "b2b";

  // Growth multipliers based on choices
  const teamMultiplier = getTeamMultiplier(state.teamChoice);
  const growthMultiplier = getGrowthMultiplier(state.growthChoice);
  const officeMultiplier = state.officeChoice === "real_office" ? 1.1 : 1.0;

  let diedAtMonth: number | null = null;

  for (let month = 1; month <= 18; month++) {
    // Burn cash
    cash -= state.monthlyBurn;

    // Revenue offsets burn
    cash += mrr;

    if (cash <= 0 && diedAtMonth === null) {
      diedAtMonth = month;
      events.push({ month, text: `month ${month}: you ran out of money.`, cashDelta: -cash });
      break;
    }

    // Grow metrics
    const luck = 0.7 + rand() * 0.6; // 0.7-1.3 luck factor
    const baseGrowth = teamMultiplier * growthMultiplier * officeMultiplier * luck;

    if (isB2B) {
      const newCustomers = Math.floor(baseGrowth * (0.5 + rand() * 1.5));
      customers += newCustomers;
      const newMRR = newCustomers * (800 + Math.floor(rand() * 1200));
      mrr += newMRR;
      if (newCustomers > 0) {
        events.push({ month, text: `month ${month}: closed ${newCustomers} new deal${newCustomers > 1 ? "s" : ""}. +$${newMRR.toLocaleString()} MRR`, mrrDelta: newMRR });
      } else {
        events.push({ month, text: `month ${month}: pipeline is dry. zero closes.` });
      }
    } else {
      const growth = Math.floor(baseGrowth * (500 + rand() * 2000));
      mau += growth;
      const newMRR = Math.floor(growth * (0.02 + rand() * 0.05) * 5);
      mrr += newMRR;
      if (growth > 500) {
        events.push({ month, text: `month ${month}: ${growth.toLocaleString()} new users! +$${newMRR.toLocaleString()} MRR`, mauDelta: growth, mrrDelta: newMRR });
      } else {
        events.push({ month, text: `month ${month}: growth is flat. ${growth} new users.`, mauDelta: growth });
      }
    }

    // Curveball effects at month 8
    if (month === 8 && state.curveballResolution === "ignore") {
      const hit = Math.floor(mrr * 0.2);
      mrr = Math.max(0, mrr - hit);
      events.push({ month, text: `month ${month}: the curveball fallout hits. -$${hit.toLocaleString()} MRR`, mrrDelta: -hit });
    }

    // Random special events
    if (rand() > 0.85) {
      const specialEvents = [
        { text: `month ${month}: featured on hacker news. servers crashed.`, mauDelta: 5000, mrrDelta: 500 },
        { text: `month ${month}: a twitter thread about you went viral.`, mauDelta: 3000 },
        { text: `month ${month}: your intern accidentally emailed the entire database.` },
        { text: `month ${month}: product hunt launch day. #3 product of the day.`, mauDelta: 2000 },
      ];
      const event = specialEvents[Math.floor(rand() * specialEvents.length)];
      events.push({ month, ...event });
      if (event.mauDelta) mau += event.mauDelta;
      if (event.mrrDelta) mrr += event.mrrDelta;
    }
  }

  const arr = mrr * 12;
  const momGrowth = events.length > 2 ? Math.floor(15 + rand() * 25) : 5;
  const retention = Math.floor(60 + rand() * 35);

  // Determine outcome
  let outcome: "raised" | "died";
  if (diedAtMonth !== null) {
    outcome = "died";
  } else if (isB2B && arr >= SERIES_A_THRESHOLD_B2B_ARR && momGrowth >= SERIES_A_THRESHOLD_GROWTH) {
    outcome = "raised";
  } else if (!isB2B && mau >= SERIES_A_THRESHOLD_B2C_MAU && momGrowth >= SERIES_A_THRESHOLD_GROWTH) {
    outcome = "raised";
  } else if (rand() > 0.6 && mrr > 0) {
    // Some luck factor — not everything is deterministic
    outcome = "raised";
  } else {
    outcome = "died";
  }

  return {
    monthEvents: events,
    mrr,
    arr,
    mau,
    customers,
    momGrowth,
    retention,
    cashRemaining: Math.max(0, cash),
    outcome,
    diedAtMonth,
  };
}

function getTeamMultiplier(team: string | null): number {
  switch (team) {
    case "senior": return 1.5;
    case "offshore": return 1.2;
    case "cto_friend": return 1.0;
    case "solo": return 0.6;
    default: return 1.0;
  }
}

function getGrowthMultiplier(growth: string | null): number {
  switch (growth) {
    case "paid_ads": return 1.8;
    case "influencer": return 2.0;
    case "sales_rep": return 1.6;
    case "cold_email": return 1.2;
    case "content": return 1.0;
    case "pr_stunt": return 1.4;
    case "organic": return 0.8;
    case "network": return 1.1;
    default: return 1.0;
  }
}
```

- [ ] **Step 10: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add src/engine/ tests/
git commit -m "feat: game engine with reducer, data, and outcome simulation"
```

---

## Task 3: Shared Components — BurnCounter, ChoiceCard, TransitionWrapper

**Files:**
- Create: `src/components/BurnCounter.tsx`
- Create: `src/components/ChoiceCard.tsx`
- Create: `src/components/TransitionWrapper.tsx`
- Create: `src/hooks/useCountUp.ts`
- Create: `src/hooks/useBurnTick.ts`

- [ ] **Step 1: Create useCountUp hook**

Create `src/hooks/useCountUp.ts`:

```ts
import { useState, useEffect, useRef } from "react";

export function useCountUp(target: number, duration: number = 2000): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = value;
    startTime.current = null;

    function animate(time: number) {
      if (startTime.current === null) startTime.current = time;
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue.current + (target - startValue.current) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
```

- [ ] **Step 2: Create useBurnTick hook**

Create `src/hooks/useBurnTick.ts`:

```ts
import { useState, useEffect, useRef } from "react";

// Slowly drains cash in real-time for ambient anxiety
export function useBurnTick(cash: number, monthlyBurn: number): number {
  const [displayed, setDisplayed] = useState(cash);
  const cashRef = useRef(cash);

  useEffect(() => {
    cashRef.current = cash;
    setDisplayed(cash);
  }, [cash]);

  useEffect(() => {
    if (monthlyBurn <= 0) return;

    // Drain $1 per ~100ms at scale (visual only, not game state)
    const perSecond = monthlyBurn / 30 / 24 / 60 / 60; // monthly -> per second
    const drainPerTick = Math.max(1, Math.floor(perSecond * 0.1));
    const interval = setInterval(() => {
      setDisplayed((prev) => Math.max(0, prev - drainPerTick));
    }, 100);

    return () => clearInterval(interval);
  }, [monthlyBurn]);

  return displayed;
}
```

- [ ] **Step 3: Create BurnCounter component**

Create `src/components/BurnCounter.tsx`:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useBurnTick } from "../hooks/useBurnTick";

interface BurnCounterProps {
  cash: number;
  monthlyBurn: number;
  visible: boolean;
}

export function BurnCounter({ cash, monthlyBurn, visible }: BurnCounterProps) {
  const displayed = useBurnTick(cash, monthlyBurn);
  const isLow = displayed < 30_000;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-sm border-b border-white/5"
        >
          <span className="text-sm text-white/50 lowercase">runway</span>
          <motion.span
            className={`text-2xl font-bold tabular-nums ${isLow ? "text-burn" : "text-money"}`}
            animate={isLow ? { scale: [1, 1.05, 1] } : {}}
            transition={isLow ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            ${displayed.toLocaleString()}
          </motion.span>
          {monthlyBurn > 0 && (
            <span className="text-sm text-white/40">
              -${monthlyBurn.toLocaleString()}/mo
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Create ChoiceCard component**

Create `src/components/ChoiceCard.tsx`:

```tsx
import { motion } from "framer-motion";

interface ChoiceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  cost?: string;
  onClick: () => void;
  variant?: "default" | "large";
}

export function ChoiceCard({ icon, title, subtitle, cost, onClick, variant = "default" }: ChoiceCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20 ${
        variant === "large" ? "py-10" : ""
      }`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold lowercase mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{subtitle}</p>
      {cost && (
        <p className="text-sm text-burn font-medium mt-3">{cost}</p>
      )}
    </motion.button>
  );
}
```

- [ ] **Step 5: Create TransitionWrapper component**

Create `src/components/TransitionWrapper.tsx`:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface TransitionWrapperProps {
  screenKey: number;
  children: ReactNode;
}

export function TransitionWrapper({ screenKey, children }: TransitionWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-dvh flex flex-col items-center justify-center px-6 pt-20 pb-10"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 6: Verify build compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/ src/hooks/
git commit -m "feat: shared components — BurnCounter, ChoiceCard, TransitionWrapper"
```

---

## Task 4: Screens 1-5 (Wire, Type, Team, Office, Growth)

**Files:**
- Create: `src/screens/ScreenWire.tsx`
- Create: `src/screens/ScreenType.tsx`
- Create: `src/screens/ScreenTeam.tsx`
- Create: `src/screens/ScreenOffice.tsx`
- Create: `src/screens/ScreenGrowth.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ScreenWire (the $250K wire animation)**

Create `src/screens/ScreenWire.tsx`:

```tsx
import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  onStart: () => void;
}

export function ScreenWire({ onStart }: Props) {
  const amount = useCountUp(250_000, 2500);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-2 text-sm text-white/40 lowercase"
      >
        incoming wire transfer
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-6xl sm:text-8xl font-bold text-money tabular-nums mb-8"
      >
        ${amount.toLocaleString()}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
        className="text-lg text-white/60 max-w-md mb-12 leading-relaxed lowercase"
      >
        y combinator just wired you $250,000. you have 18 months to prove you're not a waste of their money.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-8 py-4 bg-money text-bg font-bold text-lg rounded-full lowercase hover:bg-money/90 transition-colors"
      >
        let's burn
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 2: Create ScreenType (B2B vs B2C)**

Create `src/screens/ScreenType.tsx`:

```tsx
import { ChoiceCard } from "../components/ChoiceCard";
import type { BusinessType } from "../engine/gameState";

interface Props {
  onChoose: (type: BusinessType) => void;
}

export function ScreenType({ onChoose }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <h2 className="text-3xl font-bold lowercase text-center mb-8">
        what are you building?
      </h2>

      <ChoiceCard
        icon="💼"
        title="B2B"
        subtitle="selling to companies who take 6 months to sign a contract."
        onClick={() => onChoose("b2b")}
        variant="large"
      />

      <ChoiceCard
        icon="📱"
        title="B2C"
        subtitle="selling to people who will uninstall your app in 3 days."
        onClick={() => onChoose("b2c")}
        variant="large"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create ScreenTeam**

Create `src/screens/ScreenTeam.tsx`:

```tsx
import { ChoiceCard } from "../components/ChoiceCard";
import { teamChoices } from "../engine/gameData";
import type { TeamChoice } from "../engine/gameState";

interface Props {
  onChoose: (team: TeamChoice) => void;
}

export function ScreenTeam({ onChoose }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-3xl font-bold lowercase text-center mb-8">
        who's coming with you?
      </h2>

      {teamChoices.map((choice) => (
        <ChoiceCard
          key={choice.id}
          icon={choice.icon}
          title={choice.title}
          subtitle={choice.subtitle}
          cost={choice.monthlyCost > 0 ? `$${choice.monthlyCost.toLocaleString()}/mo` : "free"}
          onClick={() => onChoose(choice.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ScreenOffice**

Create `src/screens/ScreenOffice.tsx`:

```tsx
import { ChoiceCard } from "../components/ChoiceCard";
import { officeChoices } from "../engine/gameData";
import type { OfficeChoice } from "../engine/gameState";

interface Props {
  onChoose: (office: OfficeChoice) => void;
}

export function ScreenOffice({ onChoose }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-3xl font-bold lowercase text-center mb-8">
        where does the magic happen?
      </h2>

      {officeChoices.map((choice) => (
        <ChoiceCard
          key={choice.id}
          icon={choice.icon}
          title={choice.title}
          subtitle={choice.subtitle}
          cost={choice.monthlyCost > 0 ? `$${choice.monthlyCost.toLocaleString()}/mo` : "free"}
          onClick={() => onChoose(choice.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create ScreenGrowth (diverges on B2B/B2C)**

Create `src/screens/ScreenGrowth.tsx`:

```tsx
import { ChoiceCard } from "../components/ChoiceCard";
import { b2cGrowthChoices, b2bGrowthChoices } from "../engine/gameData";
import type { BusinessType, GrowthChoice } from "../engine/gameState";

interface Props {
  businessType: BusinessType;
  onChoose: (growth: GrowthChoice) => void;
}

export function ScreenGrowth({ businessType, onChoose }: Props) {
  const choices = businessType === "b2c" ? b2cGrowthChoices : b2bGrowthChoices;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-3xl font-bold lowercase text-center mb-2">
        how do you get {businessType === "b2c" ? "users" : "customers"}?
      </h2>
      <p className="text-center text-white/40 text-sm mb-8 lowercase">month 2. time to grow.</p>

      {choices.map((choice) => {
        const costLabel = choice.monthlyCost > 0
          ? `$${choice.monthlyCost.toLocaleString()}/mo`
          : choice.oneTimeCost > 0
            ? `$${choice.oneTimeCost.toLocaleString()} one-time`
            : "free";

        return (
          <ChoiceCard
            key={choice.id}
            icon={choice.icon}
            title={choice.title}
            subtitle={choice.subtitle}
            cost={costLabel}
            onClick={() => onChoose(choice.id)}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Wire up App.tsx with game state and screen routing**

Replace `src/App.tsx`:

```tsx
import { useReducer } from "react";
import { gameReducer, initialState } from "./engine/gameReducer";
import { BurnCounter } from "./components/BurnCounter";
import { TransitionWrapper } from "./components/TransitionWrapper";
import { ScreenWire } from "./screens/ScreenWire";
import { ScreenType } from "./screens/ScreenType";
import { ScreenTeam } from "./screens/ScreenTeam";
import { ScreenOffice } from "./screens/ScreenOffice";
import { ScreenGrowth } from "./screens/ScreenGrowth";
import type { BusinessType, TeamChoice, OfficeChoice, GrowthChoice } from "./engine/gameState";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);

  const advance = () => dispatch({ type: "NEXT_SCREEN" });

  const handleType = (type: BusinessType) => {
    dispatch({ type: "SET_TYPE", payload: type });
    advance();
  };

  const handleTeam = (team: TeamChoice) => {
    dispatch({ type: "SET_TEAM", payload: team });
    advance();
  };

  const handleOffice = (office: OfficeChoice) => {
    dispatch({ type: "SET_OFFICE", payload: office });
    advance();
  };

  const handleGrowth = (growth: GrowthChoice) => {
    dispatch({ type: "SET_GROWTH", payload: growth });
    advance();
  };

  const screens = [
    <ScreenWire key="wire" onStart={advance} />,
    <ScreenType key="type" onChoose={handleType} />,
    <ScreenTeam key="team" onChoose={handleTeam} />,
    <ScreenOffice key="office" onChoose={handleOffice} />,
    <ScreenGrowth key="growth" businessType={state.businessType ?? "b2c"} onChoose={handleGrowth} />,
  ];

  return (
    <>
      <BurnCounter
        cash={state.cash}
        monthlyBurn={state.monthlyBurn}
        visible={state.screen > 0}
      />
      <TransitionWrapper screenKey={state.screen}>
        {screens[state.screen] ?? (
          <div className="text-center text-white/50">screens 6-10 coming next...</div>
        )}
      </TransitionWrapper>
    </>
  );
}
```

- [ ] **Step 7: Verify dev server shows the full flow through 5 screens**

```bash
npm run dev
```

Expected: Wire screen animates, clicking through shows type/team/office/growth pickers. BurnCounter updates with each choice.

- [ ] **Step 8: Commit**

```bash
git add src/screens/ScreenWire.tsx src/screens/ScreenType.tsx src/screens/ScreenTeam.tsx src/screens/ScreenOffice.tsx src/screens/ScreenGrowth.tsx src/App.tsx
git commit -m "feat: screens 1-5 — wire, type, team, office, growth"
```

---

## Task 5: Screens 6-7 (Temptation, Curveball)

**Files:**
- Create: `src/screens/ScreenTemptation.tsx`
- Create: `src/screens/ScreenCurveball.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ScreenTemptation**

Create `src/screens/ScreenTemptation.tsx`:

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { temptations } from "../engine/gameData";
import type { TemptationId } from "../engine/gameState";

interface Props {
  onDone: (accepted: TemptationId[], skipped: TemptationId[]) => void;
}

export function ScreenTemptation({ onDone }: Props) {
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});

  const allDecided = temptations.every((t) => t.id in decisions);

  const decide = (id: TemptationId, accepted: boolean) => {
    setDecisions((prev) => ({ ...prev, [id]: accepted }));
  };

  const handleContinue = () => {
    const accepted = temptations.filter((t) => decisions[t.id]).map((t) => t.id);
    const skipped = temptations.filter((t) => !decisions[t.id]).map((t) => t.id);
    onDone(accepted, skipped);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <h2 className="text-3xl font-bold lowercase text-center mb-2">
        month 4. things are going okay. but...
      </h2>
      <p className="text-center text-white/40 text-sm mb-8 lowercase">
        temptation knocks. for each one: indulge or resist?
      </p>

      {temptations.map((t, i) => {
        const decided = t.id in decisions;
        const accepted = decisions[t.id];

        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-5 ${
              decided
                ? accepted
                  ? "border-burn/40 bg-burn/10"
                  : "border-white/5 bg-white/5 opacity-50"
                : "border-white/10 bg-surface"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold lowercase">{t.title}</h3>
                <p className="text-sm text-white/50 mt-1">{t.subtitle}</p>
              </div>
            </div>

            {!decided && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => decide(t.id, true)}
                  className="flex-1 py-2 rounded-lg bg-burn/20 text-burn text-sm font-medium hover:bg-burn/30 transition-colors lowercase"
                >
                  indulge (-${t.oneTimeCost.toLocaleString()})
                </button>
                <button
                  onClick={() => decide(t.id, false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 text-sm font-medium hover:bg-white/15 transition-colors lowercase"
                >
                  resist
                </button>
              </div>
            )}

            {decided && (
              <div className="mt-3 text-sm lowercase">
                {accepted ? (
                  <span className="text-burn">burned ${t.oneTimeCost.toLocaleString()} 🔥</span>
                ) : (
                  <span className="text-white/40">resisted ✓</span>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {allDecided && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleContinue}
          className="w-full py-4 mt-6 bg-money text-bg font-bold text-lg rounded-full lowercase hover:bg-money/90 transition-colors"
        >
          keep going
        </motion.button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ScreenCurveball**

Create `src/screens/ScreenCurveball.tsx`:

```tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { curveballs } from "../engine/gameData";
import type { CurveballId } from "../engine/gameState";

interface Props {
  seed: number;
  onResolve: (id: CurveballId, choice: "fix" | "ignore") => void;
}

export function ScreenCurveball({ seed, onResolve }: Props) {
  const curveball = useMemo(() => {
    return curveballs[seed % curveballs.length];
  }, [seed]);

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-warning uppercase tracking-widest mb-4"
      >
        month 8
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold lowercase mb-8"
      >
        {curveball.text}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <button
          onClick={() => onResolve(curveball.id, "fix")}
          className="w-full py-4 px-6 rounded-2xl border border-burn/30 bg-burn/10 text-left hover:bg-burn/20 transition-colors"
        >
          <div className="font-semibold lowercase">{curveball.fixLabel}</div>
          <div className="text-sm text-burn mt-1">-${curveball.fixCost.toLocaleString()}</div>
        </button>

        <button
          onClick={() => onResolve(curveball.id, "ignore")}
          className="w-full py-4 px-6 rounded-2xl border border-white/10 bg-surface text-left hover:bg-white/10 transition-colors"
        >
          <div className="font-semibold lowercase">{curveball.ignoreLabel}</div>
          <div className="text-sm text-white/40 mt-1">{curveball.ignoreConsequence}</div>
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Update App.tsx to include screens 6-7**

In `src/App.tsx`, add imports at the top:

```tsx
import { ScreenTemptation } from "./screens/ScreenTemptation";
import { ScreenCurveball } from "./screens/ScreenCurveball";
import type { BusinessType, TeamChoice, OfficeChoice, GrowthChoice, TemptationId, CurveballId } from "./engine/gameState";
```

Add handlers after `handleGrowth`:

```tsx
  const handleTemptation = (accepted: TemptationId[], skipped: TemptationId[]) => {
    accepted.forEach((id) => dispatch({ type: "ACCEPT_TEMPTATION", payload: id }));
    skipped.forEach((id) => dispatch({ type: "SKIP_TEMPTATION", payload: id }));
    advance();
  };

  const handleCurveball = (id: CurveballId, choice: "fix" | "ignore") => {
    dispatch({ type: "RESOLVE_CURVEBALL", payload: { id, choice } });
    advance();
  };
```

Add to the screens array (indices 5 and 6):

```tsx
    <ScreenTemptation key="tempt" onDone={handleTemptation} />,
    <ScreenCurveball key="curve" seed={state.cash} onResolve={handleCurveball} />,
```

- [ ] **Step 4: Verify flow through screens 1-7**

```bash
npm run dev
```

Expected: Full flow through 7 screens. Temptation screen shows 4 cards with indulge/resist. Curveball shows binary choice.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ScreenTemptation.tsx src/screens/ScreenCurveball.tsx src/App.tsx
git commit -m "feat: screens 6-7 — temptation and curveball"
```

---

## Task 6: Screen 8 — The Fast Forward

**Files:**
- Create: `src/screens/ScreenFastForward.tsx`
- Create: `src/components/ToastEvent.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ToastEvent component**

Create `src/components/ToastEvent.tsx`:

```tsx
import { motion } from "framer-motion";

interface Props {
  text: string;
  index: number;
}

export function ToastEvent({ text, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="text-sm text-white/70 py-2 border-b border-white/5 lowercase"
    >
      {text}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create ScreenFastForward**

Create `src/screens/ScreenFastForward.tsx`:

```tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MonthEvent } from "../engine/gameState";

interface Props {
  events: MonthEvent[];
  startingCash: number;
  monthlyBurn: number;
  onDone: () => void;
}

export function ScreenFastForward({ events, startingCash, monthlyBurn, onDone }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [cash, setCash] = useState(startingCash);
  const containerRef = useRef<HTMLDivElement>(null);
  const done = visibleCount >= events.length;

  useEffect(() => {
    if (visibleCount >= events.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);

      // Approximate cash drain per event
      const event = events[visibleCount];
      setCash((prev) => {
        let next = prev - monthlyBurn;
        if (event?.cashDelta) next += event.cashDelta;
        if (event?.mrrDelta) next += event.mrrDelta;
        return Math.max(0, next);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [visibleCount, events, monthlyBurn]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="text-sm text-white/40 uppercase tracking-widest mb-2">fast forward</div>
        <motion.div
          className={`text-4xl font-bold tabular-nums ${cash < 30_000 ? "text-burn" : "text-money"}`}
          key={cash}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          ${Math.max(0, cash).toLocaleString()}
        </motion.div>
      </div>

      <div
        ref={containerRef}
        className="h-[50vh] overflow-y-auto space-y-1 px-2 scrollbar-thin"
      >
        <AnimatePresence>
          {events.slice(0, visibleCount).map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-white/70 py-3 border-b border-white/5 lowercase"
            >
              {event.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {!done && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white/30 text-sm py-3"
          >
            ...
          </motion.div>
        )}
      </div>

      {done && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onDone}
          className="w-full py-4 mt-6 bg-money text-bg font-bold text-lg rounded-full lowercase hover:bg-money/90 transition-colors"
        >
          walk into the partner meeting
        </motion.button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update App.tsx — add RUN_SIMULATION action and screen 8**

In `src/engine/gameReducer.ts`, add the `RUN_SIMULATION` case. Import `simulateGame`:

```ts
import { simulateGame } from "./outcomeEngine";
```

Add case before `NEXT_SCREEN`:

```ts
    case "RUN_SIMULATION": {
      const result = simulateGame(state);
      return {
        ...state,
        monthEvents: result.monthEvents,
        mrr: result.mrr,
        arr: result.arr,
        mau: result.mau,
        customers: result.customers,
        momGrowth: result.momGrowth,
        retention: result.retention,
        outcome: result.outcome,
      };
    }
```

In `src/App.tsx`, add import:

```tsx
import { ScreenFastForward } from "./screens/ScreenFastForward";
```

Add to App component, after curveball handler — a function that runs simulation then advances:

```tsx
  const handleStartSimulation = () => {
    dispatch({ type: "RUN_SIMULATION" });
    advance();
  };
```

Change the curveball handler to call `handleStartSimulation` indirectly. Actually, simpler: after curveball resolves, the next screen IS the fast forward. Update the screens array to run simulation when entering screen 7 (fast forward). Better approach — run simulation in a useEffect when screen === 7.

Replace the curveball handler:

```tsx
  const handleCurveball = (id: CurveballId, choice: "fix" | "ignore") => {
    dispatch({ type: "RESOLVE_CURVEBALL", payload: { id, choice } });
    dispatch({ type: "RUN_SIMULATION" });
    advance();
  };
```

Add screen 7 (index 7) to screens array:

```tsx
    <ScreenFastForward
      key="ff"
      events={state.monthEvents}
      startingCash={state.cash}
      monthlyBurn={state.monthlyBurn}
      onDone={advance}
    />,
```

- [ ] **Step 4: Verify fast forward screen plays through events**

```bash
npm run dev
```

Expected: After curveball, events scroll through one by one with animated cash counter. "Walk into the partner meeting" button appears at end.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ScreenFastForward.tsx src/components/ToastEvent.tsx src/engine/gameReducer.ts src/App.tsx
git commit -m "feat: screen 8 — fast forward month-by-month ticker"
```

---

## Task 7: Screens 9-10 (Pitch, Result + Share Card)

**Files:**
- Create: `src/screens/ScreenPitch.tsx`
- Create: `src/screens/ScreenResult.tsx`
- Create: `src/components/ShareCard.tsx`
- Create: `src/components/VCBubble.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create VCBubble component**

Create `src/components/VCBubble.tsx`:

```tsx
import { motion } from "framer-motion";

interface Props {
  text: string;
  variant: "good" | "mid" | "bad";
  delay: number;
}

const colors = {
  good: "bg-traction/20 text-traction",
  mid: "bg-warning/20 text-warning",
  bad: "bg-burn/20 text-burn",
};

export function VCBubble({ text, variant, delay }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[280px] ${colors[variant]}`}
    >
      {text}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create ScreenPitch**

Create `src/screens/ScreenPitch.tsx`:

```tsx
import { motion } from "framer-motion";
import { VCBubble } from "../components/VCBubble";
import type { GameState } from "../engine/gameState";

interface Props {
  state: GameState;
  onContinue: () => void;
}

const goodReactions = [
  "this is interesting. let me bring this to monday's partner meeting.",
  "the metrics are solid. let's talk terms.",
  "i've been looking for something in this space. send me the deck.",
];

const midReactions = [
  "love the team, but the metrics aren't quite there yet. keep us posted.",
  "interesting traction. but i worry about the burn rate.",
  "can you come back when you hit $50K MRR?",
];

const badReactions = [
  "have you considered getting a job?",
  "i'm going to pass. but i'd love to grab coffee sometime.",
  "the market is tough right now. maybe try again in Q3.",
];

function getReactions(outcome: "raised" | "died" | null): { text: string; variant: "good" | "mid" | "bad" }[] {
  if (outcome === "raised") {
    return [
      { text: goodReactions[Math.floor(Math.random() * goodReactions.length)], variant: "good" },
      { text: midReactions[Math.floor(Math.random() * midReactions.length)], variant: "mid" },
      { text: goodReactions[Math.floor(Math.random() * goodReactions.length)], variant: "good" },
    ];
  }
  return [
    { text: badReactions[Math.floor(Math.random() * badReactions.length)], variant: "bad" },
    { text: midReactions[Math.floor(Math.random() * midReactions.length)], variant: "mid" },
    { text: badReactions[Math.floor(Math.random() * badReactions.length)], variant: "bad" },
  ];
}

export function ScreenPitch({ state, onContinue }: Props) {
  const reactions = getReactions(state.outcome);
  const isB2B = state.businessType === "b2b";

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-white/40 uppercase tracking-widest text-center mb-6"
      >
        month 16. the partner meeting.
      </motion.div>

      {/* Mock pitch slide */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-surface border border-white/10 rounded-2xl p-8 mb-8"
      >
        <div className="text-xs text-white/30 uppercase tracking-widest mb-6">slide 12 of 14</div>

        <div className="grid grid-cols-2 gap-6 text-center">
          {isB2B ? (
            <>
              <div>
                <div className="text-3xl font-bold text-money">${(state.arr / 1000).toFixed(0)}K</div>
                <div className="text-xs text-white/40 mt-1">ARR</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-traction">{state.customers}</div>
                <div className="text-xs text-white/40 mt-1">customers</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-3xl font-bold text-money">{(state.mau / 1000).toFixed(1)}K</div>
                <div className="text-xs text-white/40 mt-1">MAU</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-traction">{state.retention}%</div>
                <div className="text-xs text-white/40 mt-1">retention</div>
              </div>
            </>
          )}
          <div>
            <div className="text-3xl font-bold text-warning">{state.momGrowth}%</div>
            <div className="text-xs text-white/40 mt-1">MoM growth</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-burn">${(state.monthlyBurn / 1000).toFixed(0)}K</div>
            <div className="text-xs text-white/40 mt-1">monthly burn</div>
          </div>
        </div>
      </motion.div>

      {/* VC reactions */}
      <div className="space-y-3 mb-8">
        {reactions.map((r, i) => (
          <VCBubble key={i} text={r.text} variant={r.variant} delay={1.5 + i * 0.8} />
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        onClick={onContinue}
        className="w-full py-4 bg-white/10 text-white font-bold text-lg rounded-full lowercase hover:bg-white/15 transition-colors"
      >
        see your fate
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 3: Create ShareCard component**

Create `src/components/ShareCard.tsx`:

```tsx
import { forwardRef } from "react";
import type { GameState } from "../engine/gameState";

interface Props {
  state: GameState;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const isB2B = state.businessType === "b2b";
  const raised = state.outcome === "raised";

  return (
    <div
      ref={ref}
      className="w-[1080px] h-[1080px] bg-bg flex flex-col items-center justify-center p-20 text-center"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="text-white/30 text-2xl uppercase tracking-[0.3em] mb-8">burn.money</div>

      <div className={`text-8xl font-bold mb-6 ${raised ? "text-money" : "text-burn"}`}>
        {raised ? "survived" : "died"}
      </div>

      <div className="text-white/50 text-2xl mb-16 lowercase">
        {raised
          ? "$4M series A. you made it."
          : "you sent the 'we're shutting down' blog post."}
      </div>

      <div className="flex gap-8 mb-16">
        <div className="text-center">
          <div className="text-4xl mb-2">{isB2B ? "💼" : "📱"}</div>
          <div className="text-white/40 text-lg">{state.businessType?.toUpperCase()}</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {state.teamChoice === "senior" ? "👩‍💻" : state.teamChoice === "offshore" ? "🌏" : state.teamChoice === "cto_friend" ? "🤝" : "🫠"}
          </div>
          <div className="text-white/40 text-lg">team</div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {state.officeChoice === "apartment" ? "🐱" : state.officeChoice === "wework" ? "🍺" : state.officeChoice === "real_office" ? "🏢" : "✈️"}
          </div>
          <div className="text-white/40 text-lg">office</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-12 mb-16">
        <div>
          <div className="text-5xl font-bold text-money">
            {isB2B ? `$${(state.arr / 1000).toFixed(0)}K` : `${(state.mau / 1000).toFixed(1)}K`}
          </div>
          <div className="text-white/40 text-lg mt-2">{isB2B ? "ARR" : "MAU"}</div>
        </div>
        <div>
          <div className="text-5xl font-bold text-traction">{state.momGrowth}%</div>
          <div className="text-white/40 text-lg mt-2">MoM growth</div>
        </div>
        <div>
          <div className="text-5xl font-bold text-burn">${(state.monthlyBurn / 1000).toFixed(0)}K</div>
          <div className="text-white/40 text-lg mt-2">burn/mo</div>
        </div>
      </div>

      <div className="text-white/20 text-xl">can you do better? burn.money</div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
```

- [ ] **Step 4: Create ScreenResult**

Create `src/screens/ScreenResult.tsx`:

```tsx
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { ShareCard } from "../components/ShareCard";
import type { GameState } from "../engine/gameState";

interface Props {
  state: GameState;
  onRestart: () => void;
}

export function ScreenResult({ state, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const raised = state.outcome === "raised";

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = "burn-money-result.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate share image", err);
    }
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      {raised ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold text-money lowercase mb-4"
          >
            you raised
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-white/60 lowercase mb-2"
          >
            $4M series A. you survived.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm text-white/30 lowercase mb-10"
          >
            you now have 24 months to do this all over again, but with higher expectations.
          </motion.p>
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="text-7xl mb-6"
          >
            💀
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-5xl font-bold text-burn lowercase mb-4"
          >
            you died
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xl text-white/60 lowercase mb-2"
          >
            you sent the "we're shutting down" blog post. 4 people read it.
          </motion.p>
        </>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="grid grid-cols-3 gap-4 mb-10 mt-8"
      >
        <div className="bg-surface rounded-xl p-4">
          <div className="text-2xl font-bold text-money">
            {state.businessType === "b2b"
              ? `$${(state.arr / 1000).toFixed(0)}K`
              : `${(state.mau / 1000).toFixed(1)}K`}
          </div>
          <div className="text-xs text-white/40 mt-1">{state.businessType === "b2b" ? "ARR" : "MAU"}</div>
        </div>
        <div className="bg-surface rounded-xl p-4">
          <div className="text-2xl font-bold text-traction">{state.momGrowth}%</div>
          <div className="text-xs text-white/40 mt-1">growth</div>
        </div>
        <div className="bg-surface rounded-xl p-4">
          <div className="text-2xl font-bold text-burn">${(state.monthlyBurn / 1000).toFixed(0)}K</div>
          <div className="text-xs text-white/40 mt-1">burn/mo</div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="space-y-3"
      >
        <button
          onClick={handleShare}
          className="w-full py-4 bg-money text-bg font-bold text-lg rounded-full lowercase hover:bg-money/90 transition-colors"
        >
          download share card
        </button>
        <button
          onClick={onRestart}
          className="w-full py-4 bg-white/10 text-white font-bold text-lg rounded-full lowercase hover:bg-white/15 transition-colors"
        >
          try again
        </button>
      </motion.div>

      {/* Hidden share card for image generation */}
      <div className="fixed -left-[9999px] top-0">
        <ShareCard ref={cardRef} state={state} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update App.tsx with final screens**

Add imports:

```tsx
import { ScreenPitch } from "./screens/ScreenPitch";
import { ScreenResult } from "./screens/ScreenResult";
```

Add to screens array (indices 8 and 9):

```tsx
    <ScreenPitch key="pitch" state={state} onContinue={advance} />,
    <ScreenResult key="result" state={state} onRestart={() => dispatch({ type: "RESTART" })} />,
```

- [ ] **Step 6: Verify full game flow end to end**

```bash
npm run dev
```

Expected: Complete 10-screen flow. Wire -> Type -> Team -> Office -> Growth -> Temptation -> Curveball -> Fast Forward -> Pitch -> Result. Share card downloads as PNG.

- [ ] **Step 7: Commit**

```bash
git add src/screens/ScreenPitch.tsx src/screens/ScreenResult.tsx src/components/ShareCard.tsx src/components/VCBubble.tsx src/App.tsx
git commit -m "feat: screens 9-10 — pitch, result, and shareable card"
```

---

## Task 8: Sound Design

**Files:**
- Create: `src/hooks/useSound.ts`
- Modify: `src/screens/ScreenWire.tsx` (add cha-ching)
- Modify: `src/screens/ScreenFastForward.tsx` (add heartbeat when low)
- Modify: `src/screens/ScreenResult.tsx` (add crowd roar / sad piano)

- [ ] **Step 1: Create useSound hook**

Create `src/hooks/useSound.ts`:

```ts
import { useRef, useCallback } from "react";
import { Howl } from "howler";

const soundCache = new Map<string, Howl>();

function getSound(src: string, options?: { loop?: boolean; volume?: number }): Howl {
  const key = `${src}-${options?.loop}-${options?.volume}`;
  if (!soundCache.has(key)) {
    soundCache.set(key, new Howl({ src: [src], loop: options?.loop ?? false, volume: options?.volume ?? 0.5 }));
  }
  return soundCache.get(key)!;
}

export function useSound(src: string, options?: { loop?: boolean; volume?: number }) {
  const soundRef = useRef<Howl | null>(null);

  const play = useCallback(() => {
    soundRef.current = getSound(src, options);
    soundRef.current.play();
  }, [src, options]);

  const stop = useCallback(() => {
    soundRef.current?.stop();
  }, []);

  return { play, stop };
}
```

- [ ] **Step 2: Generate sound effects using Web Audio API (no asset files needed)**

Instead of shipping audio files, we'll generate sounds programmatically. Replace `src/hooks/useSound.ts`:

```ts
import { useCallback, useRef } from "react";

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

type SoundName = "chaching" | "heartbeat" | "sadpiano" | "crowd" | "whoosh";

function playSynth(name: SoundName) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  switch (name) {
    case "chaching": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case "heartbeat": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      // Double beat
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(55, now + 0.2);
      gain2.gain.setValueAtTime(0.3, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.35);
      break;
    }
    case "sadpiano": {
      const notes = [261.6, 246.9, 220.0]; // C4, B3, A3 — descending sadness
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.4);
        gain.gain.setValueAtTime(0.2, now + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.4 + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 0.8);
      });
      break;
    }
    case "crowd": {
      // White noise burst shaped like a cheer
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2000, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(now);
      source.stop(now + 1.5);
      break;
    }
    case "whoosh": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
  }
}

export function useSound(name: SoundName) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const play = useCallback(() => {
    playSynth(name);
  }, [name]);

  const playLoop = useCallback((intervalMs: number) => {
    playSynth(name);
    intervalRef.current = setInterval(() => playSynth(name), intervalMs);
  }, [name]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { play, playLoop, stop };
}
```

- [ ] **Step 3: Add cha-ching to ScreenWire**

In `src/screens/ScreenWire.tsx`, add to imports:

```tsx
import { useSound } from "../hooks/useSound";
import { useEffect } from "react";
```

Inside the component, before the return:

```tsx
  const { play: playChaching } = useSound("chaching");

  useEffect(() => {
    const timer = setTimeout(() => playChaching(), 2500);
    return () => clearTimeout(timer);
  }, [playChaching]);
```

- [ ] **Step 4: Add heartbeat to ScreenFastForward when cash is low**

In `src/screens/ScreenFastForward.tsx`, add import:

```tsx
import { useSound } from "../hooks/useSound";
```

Inside the component:

```tsx
  const { playLoop: startHeartbeat, stop: stopHeartbeat } = useSound("heartbeat");

  useEffect(() => {
    if (cash < 30_000 && cash > 0) {
      startHeartbeat(1500);
    } else {
      stopHeartbeat();
    }
    return () => stopHeartbeat();
  }, [cash < 30_000]);
```

- [ ] **Step 5: Add crowd roar / sad piano to ScreenResult**

In `src/screens/ScreenResult.tsx`, add:

```tsx
import { useSound } from "../hooks/useSound";
import { useEffect } from "react";
```

Inside the component:

```tsx
  const { play: playCrowd } = useSound("crowd");
  const { play: playSad } = useSound("sadpiano");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (raised) playCrowd();
      else playSad();
    }, 500);
    return () => clearTimeout(timer);
  }, [raised, playCrowd, playSad]);
```

- [ ] **Step 6: Remove Howler dependency (no longer needed)**

```bash
npm uninstall howler @types/howler
```

- [ ] **Step 7: Verify sounds play at correct moments**

```bash
npm run dev
```

Expected: Cha-ching on wire screen, heartbeat when cash drops below $30K, crowd/sad piano on result.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useSound.ts src/screens/ScreenWire.tsx src/screens/ScreenFastForward.tsx src/screens/ScreenResult.tsx package.json package-lock.json
git commit -m "feat: synthesized sound effects — cha-ching, heartbeat, crowd, sad piano"
```

---

## Task 9: Easter Eggs + Leaderboard Stats

**Files:**
- Modify: `src/screens/ScreenResult.tsx`
- Modify: `src/engine/outcomeEngine.ts`

- [ ] **Step 1: Add easter egg detection to outcome engine**

In `src/engine/outcomeEngine.ts`, add to the `SimResult` interface:

```ts
  easterEgg: string | null;
```

At the end of `simulateGame`, before the return, add:

```ts
  // Easter eggs
  let easterEgg: string | null = null;
  const totalSpent = STARTING_CASH - cash + (diedAtMonth !== null ? 0 : state.monthlyBurn * 18);
  if (state.temptationsAccepted.length === 4 && diedAtMonth !== null && diedAtMonth <= 6) {
    easterEgg = "you spent $250K in " + diedAtMonth + " months. that's actually impressive.";
  } else if (state.monthlyBurn === 0 && state.temptationsAccepted.length === 0) {
    easterEgg = "you just sat in your apartment for 18 months. technically you still have runway.";
  }
```

Add `easterEgg` to the return object. Import `STARTING_CASH` from constants:

```ts
import { ..., STARTING_CASH } from "./constants";
```

- [ ] **Step 2: Update GameState to include easterEgg**

In `src/engine/gameState.ts`, add to the `GameState` interface:

```ts
  easterEgg: string | null;
```

In `src/engine/gameReducer.ts`, add to `initialState()`:

```ts
    easterEgg: null,
```

In the `RUN_SIMULATION` case, add:

```ts
        easterEgg: result.easterEgg,
```

- [ ] **Step 3: Add leaderboard percentage and easter egg to ScreenResult**

In `src/screens/ScreenResult.tsx`, after the stats grid and before the action buttons, add:

```tsx
      {/* Leaderboard stat */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="text-sm text-white/40 mb-4 lowercase"
      >
        {raised
          ? "87% of people died. you're in the top 13% of founders."
          : "87% of people died. you're one of them."}
      </motion.div>

      {/* Easter egg */}
      {state.easterEgg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="text-sm text-warning bg-warning/10 rounded-xl px-4 py-3 mb-6 lowercase"
        >
          🥚 {state.easterEgg}
        </motion.div>
      )}
```

- [ ] **Step 4: Run tests to ensure nothing broke**

```bash
npm test
```

Expected: All tests pass (may need to update outcomeEngine test expectations for the new field).

- [ ] **Step 5: Commit**

```bash
git add src/engine/outcomeEngine.ts src/engine/gameState.ts src/engine/gameReducer.ts src/screens/ScreenResult.tsx
git commit -m "feat: easter eggs and leaderboard stats on result screen"
```

---

## Task 10: Polish — Mobile Responsiveness, Final Tweaks, Build Verification

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/ShareCard.tsx`
- Modify: various screens for mobile padding tweaks

- [ ] **Step 1: Add mobile-first responsive tweaks to global CSS**

In `src/index.css`, add after the base layer:

```css
@layer base {
  body {
    @apply bg-bg text-white font-sans antialiased;
    -webkit-tap-highlight-color: transparent;
    overflow-x: hidden;
  }

  /* Hide scrollbar but keep scrollable */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
}
```

- [ ] **Step 2: Add OG meta tags to index.html**

In `index.html`, add to `<head>`:

```html
    <meta property="og:title" content="burn.money" />
    <meta property="og:description" content="You just got $250K from YC. Make it last long enough to raise your Series A." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0a0a0a" />
```

- [ ] **Step 3: Verify production build succeeds**

```bash
npm run build
```

Expected: Build completes with no errors. Output in `dist/` folder.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Expected: Full game runs in production mode at localhost:4173.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: mobile polish, OG meta tags, production build verified"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | package.json, vite/tailwind config, App shell |
| 2 | Game engine | gameState, gameReducer, outcomeEngine, gameData |
| 3 | Shared components | BurnCounter, ChoiceCard, TransitionWrapper |
| 4 | Screens 1-5 | Wire, Type, Team, Office, Growth |
| 5 | Screens 6-7 | Temptation, Curveball |
| 6 | Screen 8 | Fast Forward ticker |
| 7 | Screens 9-10 | Pitch, Result, ShareCard |
| 8 | Sound design | Web Audio API synthesized effects |
| 9 | Easter eggs | Special outcomes, leaderboard stat |
| 10 | Polish | Mobile, OG tags, build verification |
