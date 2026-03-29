import { motion } from "framer-motion";
import type { GameState, GameAction, MarketType } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

const markets: { id: MarketType; label: string; desc: string }[] = [
  { id: "b2b", label: "B2B", desc: "enterprise sales. long cycles, big contracts, someone always asking for a 'pilot'." },
  { id: "b2c", label: "B2C", desc: "consumer. viral potential, brutal churn, users who leave 1-star reviews if the app loads in 2 seconds." },
];

export function ScreenMarket({ state, dispatch, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          what are you building?
        </h1>
        <p className="text-sm text-text-tertiary">pick one or both</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {markets.map((m, i) => {
          const selected = state.markets.includes(m.id);
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => dispatch({ type: "TOGGLE_MARKET", payload: m.id })}
              className={`w-full text-left rounded-xl p-5 cursor-pointer transition-all duration-150 border ${
                selected
                  ? "bg-accent-dim border-accent/30"
                  : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-text-primary">{m.label}</span>
                {selected && <span className="text-accent text-xs">●</span>}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{m.desc}</p>
            </motion.button>
          );
        })}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={state.markets.length === 0} />
    </div>
  );
}
