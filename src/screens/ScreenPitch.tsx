import { useMemo } from "react";
import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { VCBubble } from "../components/VCBubble";

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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ScreenPitch({ state, onContinue }: Props) {
  const bubbles = useMemo(() => {
    if (state.outcome === "raised") {
      return [
        { text: pickRandom(goodReactions), variant: "good" as const, delay: 1.5 },
        { text: pickRandom(goodReactions), variant: "good" as const, delay: 2.3 },
        { text: pickRandom(midReactions), variant: "mid" as const, delay: 3.1 },
      ];
    } else {
      return [
        { text: pickRandom(badReactions), variant: "bad" as const, delay: 1.5 },
        { text: pickRandom(badReactions), variant: "bad" as const, delay: 2.3 },
        { text: pickRandom(midReactions), variant: "mid" as const, delay: 3.1 },
      ];
    }
  }, [state.outcome]);

  const isB2B = state.businessType === "b2b";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <p className="text-white/40 uppercase tracking-widest text-xs">
        month 16. the partner meeting.
      </p>

      {/* Mock pitch deck slide */}
      <div className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <p className="text-xs text-white/30 mb-6">slide 12 of 14</p>
        <div className="grid grid-cols-2 gap-6">
          {/* Primary metric */}
          <div className="flex flex-col gap-1">
            <span className={`text-3xl font-bold ${isB2B ? "text-money" : "text-money"}`}>
              {isB2B
                ? `$${(state.arr / 1000).toFixed(0)}K`
                : `${(state.mau / 1000).toFixed(1)}K`}
            </span>
            <span className="text-xs text-white/40">{isB2B ? "ARR" : "MAU"}</span>
          </div>

          {/* Secondary metric */}
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-traction">
              {isB2B
                ? state.customers.toLocaleString()
                : `${state.retention.toFixed(0)}%`}
            </span>
            <span className="text-xs text-white/40">{isB2B ? "customers" : "retention"}</span>
          </div>

          {/* MoM growth */}
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-warning">
              {state.momGrowth.toFixed(1)}%
            </span>
            <span className="text-xs text-white/40">MoM growth</span>
          </div>

          {/* Monthly burn */}
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-burn">
              ${(state.monthlyBurn / 1000).toFixed(0)}K
            </span>
            <span className="text-xs text-white/40">monthly burn</span>
          </div>
        </div>
      </div>

      {/* VC reaction bubbles */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {bubbles.map((bubble, i) => (
          <VCBubble
            key={i}
            text={bubble.text}
            variant={bubble.variant}
            delay={bubble.delay}
          />
        ))}
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        onClick={onContinue}
        className="bg-white/10 text-white rounded-full px-8 py-3 text-sm hover:bg-white/20 transition-colors"
      >
        see your fate
      </motion.button>
    </div>
  );
}
