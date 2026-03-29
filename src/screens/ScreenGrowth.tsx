import { motion } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

export function ScreenGrowth({ state, dispatch, onNext, onBack }: Props) {
  const hasB2B = state.markets.includes("b2b");
  const hasB2C = state.markets.includes("b2c");
  const filtered = state.growth.filter((g) => {
    if (g.market === "both") return true;
    if (g.market === "b2b" && hasB2B) return true;
    if (g.market === "b2c" && hasB2C) return true;
    return false;
  });

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">growth channels</h1>
        <p className="text-sm text-text-tertiary">how do people find you?</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {filtered.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => dispatch({ type: "TOGGLE_GROWTH", payload: g.id })}
            className={`w-full text-left rounded-xl p-4 cursor-pointer transition-all duration-150 border flex items-center gap-4 ${
              g.selected
                ? "bg-accent-dim border-accent/30"
                : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover"
            }`}
          >
            <span className="text-lg">{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">{g.name}</div>
              <div className="text-xs text-text-tertiary truncate">{g.description}</div>
            </div>
            <div className="shrink-0 text-right">
              {g.monthlyCost > 0 && <div className="text-xs font-mono text-text-secondary">${g.monthlyCost.toLocaleString()}/mo</div>}
              {g.oneTimeCost > 0 && <div className="text-xs font-mono text-text-tertiary">${g.oneTimeCost.toLocaleString()}</div>}
              {g.monthlyCost === 0 && g.oneTimeCost === 0 && <div className="text-xs font-mono text-green">$0</div>}
              {g.selected && <div className="text-accent text-[10px] mt-0.5">●</div>}
            </div>
          </motion.button>
        ))}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
