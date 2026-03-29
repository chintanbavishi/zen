# burn.money

> You have $250,000 and 18 months. Don't waste it.

A startup burn-rate simulator that puts you in the founder's seat. Hire a team, pick an office, choose your growth tactics, set a revenue model, survive curveball events, and find out whether you raise a Series A — or send the shutting-down blog post.

---

## What It Is

burn.money is an interactive web game that teaches the real math behind startup spending. Every choice you make is tracked against a live runway counter. The simulation engine runs a deterministic 18-month playthrough based on your decisions and tells you exactly how you burned through investor money.

**Outcome:** either `SERIES A` or `DEAD`.

---

## Game Flow

The game runs across 11 screens in a linear progression:

| Screen | Name | What You Decide |
|--------|------|-----------------|
| 0 | Splash | Start |
| 1 | Market | B2B or B2C |
| 2 | Team | Hire engineers, designers, sales, and interns — set salary and contract length per role |
| 3 | Office | Apartment → garage → coworking → Bangalore hub → SF office |
| 4 | Growth | Channel strategy (filtered to your market) |
| 5 | Revenue | Price per month × target customer count |
| 6 | Lifestyle | Optional spend: offsites, Patagonia vests, pitch deck designers, SXSW booths |
| 7 | Curveballs | 3 seeded random events — AWS bill tripled, engineer poached, investor bridge round |
| 8 | Fast Forward | 18-month simulation plays out, month by month |
| 9 | Verdict | Raised or died, with founder archetype and burn efficiency score |
| 10 | Share | Downloadable 1080×1080 share card + Twitter/X intent |

A live **RunwayHeader** shows remaining runway and monthly burn throughout screens 1–7 so you always know the cost of your choices in real time.

---

## Architecture

### State Management

All game state lives in a single `GameState` object managed by a pure `useReducer`. There are no side effects in state transitions — every action type produces a new state object deterministically.

```
src/engine/
├── constants.ts       — STARTING_CASH, TOTAL_MONTHS, survival thresholds
├── gameState.ts       — TypeScript interfaces for all state shapes + action union
├── gameData.ts        — Static data: team roster, office options, growth channels, curveballs
├── gameReducer.ts     — Pure reducer + derived selectors (burn, runway, committed spend)
└── outcomeEngine.ts   — Deterministic 18-month simulation with seeded PRNG
```

### Simulation Engine

`simulateGame()` in `outcomeEngine.ts` runs a month-by-month cash flow model:

- **Seeded PRNG** — outcomes derive from a hash of your choices, so the same decisions always produce the same result. No luck.
- **Dynamic team burn** — team members only cost money for their contracted months; a 3-month contractor stops burning in month 4.
- **Revenue ramp** — MRR grows toward your target over 18 months with a ramp factor, not a step function.
- **Choice-reactive events** — specific hiring, office, or growth decisions inject narrative events at fixed months (e.g. TikTok viral at month 5, offsite drama at month 9).
- **Outcome rules** — survival requires cash remaining, at least one engineer, a growth channel or revenue model, and lifestyle spend under 50% of budget.

**Founder archetypes** are assigned at simulation end:

| Archetype | Condition |
|-----------|-----------|
| The Lifestyle Founder | >40% of budget on lifestyle |
| The Ghost | Zero burn, minimal spend |
| The Lean Machine | <$15K/mo burn, raised |
| The Burner | >$40K/mo burn |
| The Scrappy Survivor | Raised otherwise |
| The Cautionary Tale | Died otherwise |

### Key Derived Selectors

| Function | Description |
|----------|-------------|
| `getMonthlyBurn(state)` | Team + office + growth + lifestyle monthly costs |
| `getOneTimeCosts(state)` | One-time spend + curveball choices |
| `getTotalCommittedSpend(state)` | Full 18-month obligation (respects contract durations) |
| `getRunwayMonths(state)` | Month-by-month cash simulation accounting for variable team durations |

### Landing Page

The landing page (`src/landing/LandingPage.tsx`) is an interactive cinematic intro: a plane flies over a Golden Gate Bridge SVG as the user taps/scrolls/presses space. Each interaction advances through four narrative phases before routing to the game. All animations are CSS keyframes; no animation library on the landing page.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 | `useReducer` + hooks, no external state library needed |
| Language | TypeScript 5.9 | Strict types across all game state and actions |
| Build | Vite 5 | Fast HMR in dev, optimized ESM bundle in prod |
| Styling | Tailwind CSS v4 | Utility-first; dark design system via CSS variables |
| Animation | Framer Motion | Verdict and share screens; entrance animations on cards |
| Routing | React Router v7 | `/` (landing) and `/play` (game) |
| Confetti | canvas-confetti | Series A celebration |
| Share card | html-to-image | Renders a 1080×1080 off-screen DOM node to PNG for download |
| Testing | Vitest | Unit tests for reducer and simulation engine |

---

## Project Structure

```
src/
├── main.tsx                  — App entry, React Router provider
├── App.tsx                   — Screen router via useReducer state.screen
├── index.css                 — Tailwind base + design tokens (CSS variables)
├── landing/
│   └── LandingPage.tsx       — Cinematic intro, routes to /play
├── engine/
│   ├── constants.ts
│   ├── gameState.ts
│   ├── gameData.ts
│   ├── gameReducer.ts
│   └── outcomeEngine.ts
├── components/
│   ├── RunwayHeader.tsx       — Live burn + runway bar (screens 1–7)
│   ├── NavButtons.tsx         — Back / Next navigation
│   └── ScreenLayout.tsx       — Animated screen transition wrapper
├── screens/
│   ├── ScreenSplash.tsx
│   ├── ScreenMarket.tsx
│   ├── ScreenTeam.tsx
│   ├── ScreenOffice.tsx
│   ├── ScreenGrowth.tsx
│   ├── ScreenRevenue.tsx
│   ├── ScreenLifestyle.tsx
│   ├── ScreenCurveball.tsx
│   ├── ScreenFastForward.tsx
│   ├── ScreenVerdict.tsx
│   └── ScreenShare.tsx
└── hooks/
    ├── useBurnTick.ts         — Animated burn counter
    ├── useCountUp.ts          — Generic number count-up animation
    └── useSound.ts            — Sound effect playback

tests/
└── engine/
    ├── gameReducer.test.ts
    └── outcomeEngine.test.ts
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Type-check + build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Design Decisions

**Why a pure reducer with no external state library?**
The game has a finite, well-defined state machine with 14 action types. `useReducer` handles it cleanly with zero boilerplate and makes every state transition trivially testable.

**Why seeded randomness?**
Choices feel fair. If two players make identical decisions, they get identical outcomes. This also makes tests deterministic — no mocking required.

**Why variable contract durations for team members?**
Runway calculation has to reflect reality: a 3-month design sprint hire costs $27K total, not $162K. `getRunwayMonths` simulates month-by-month cash flow rather than dividing starting cash by a flat monthly burn to capture this correctly.

**Why html-to-image for the share card?**
The share card is a styled DOM node (1080×1080, positioned off-screen). html-to-image renders it to a PNG without requiring a canvas drawing API or server-side rendering. Zero infrastructure.

---

## Testing

Tests cover the game engine at the unit level. The reducer is a pure function — tests drive it with action sequences and assert on output state.

```bash
npm test
```

Key test coverage:
- Initial state ($250K cash, all counts at zero)
- Market single-select behaviour (toggle on, switch, toggle off)
- Team count, salary, and contract-month mutations with boundary clamping
- Monthly burn calculation
- Runway computation against known burn rates
- Office, growth, and lifestyle toggle mechanics
- Screen navigation (next/prev)
- Full restart behaviour

---

## License

MIT
