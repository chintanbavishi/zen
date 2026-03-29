import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn } from "../engine/gameReducer";
import { useSound } from "../hooks/useSound";

interface Props {
  state: GameState;
  onContinue: () => void;
}

export function ScreenVerdict({ state, onContinue }: Props) {
  const { play: playCrowd } = useSound("crowd");
  const { play: playSad } = useSound("sadtrombone");
  const firedRef = useRef(false);
  const raised = state.outcome === "raised";

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (raised) {
      playCrowd();
      import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 }, colors: ["#7C3AED", "#22C55E", "#6366F1", "#F59E0B"] });
      });
    } else {
      playSad();
    }
  }, [raised, playCrowd, playSad]);

  const burn = getMonthlyBurn(state);
  const headcount = state.team.reduce((s, t) => s + t.count, 0);
  const lifestyleSpend = state.lifestyle.filter((l) => l.selected).reduce((s, l) => s + l.oneTimeCost + l.monthlyCost * 18, 0);

  const stats = [
    { label: "team", value: `${headcount}` },
    { label: "burn", value: `$${burn.toLocaleString()}/mo` },
    { label: "lifestyle", value: `$${lifestyleSpend.toLocaleString()}` },
    { label: "type", value: state.founderType ?? "—" },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 pb-8">
      <div className="w-full max-w-lg mx-auto text-center">
        {raised ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="text-3xl font-bold text-green mb-3">$4M Series A</h1>
            <p className="text-sm text-text-secondary mb-1">your investor said: "we love the capital efficiency."</p>
            <p className="text-xs text-text-tertiary italic">(translation: "we're shocked you didn't die")</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-5xl mb-4">💀</div>
            <h1 className="text-3xl font-bold text-red mb-3">month {state.diedAtMonth ?? "?"}. it's over.</h1>
            <p className="text-sm text-text-secondary mb-1">you sent the shutting-down blog post.</p>
            <p className="text-xs text-text-tertiary">4 people read it. 2 were bots.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-10 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded-xl border border-border bg-surface p-4 text-left"
            >
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-sm font-medium text-text-primary">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer hover:bg-accent/90 transition-all"
        >
          see results →
        </motion.button>
      </div>
    </div>
  );
}
