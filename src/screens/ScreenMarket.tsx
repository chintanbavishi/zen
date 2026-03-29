import { motion } from "framer-motion";
import type { GameState, GameAction, MarketType } from "../engine/gameState";

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

export function ScreenMarket({ state, dispatch, onNext }: Props) {
  function pick(id: MarketType) {
    // Clear any previous selection, set this one, advance
    if (state.markets.length > 0 && !state.markets.includes(id)) {
      dispatch({ type: "TOGGLE_MARKET", payload: state.markets[0] });
    }
    if (!state.markets.includes(id)) {
      dispatch({ type: "TOGGLE_MARKET", payload: id });
    }
    setTimeout(onNext, 200);
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          what are you building?
        </h1>
        <p className="text-sm text-text-tertiary">pick one</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {markets.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => pick(m.id)}
            className="w-full text-left rounded-xl p-5 cursor-pointer transition-all duration-150 border bg-surface border-border hover:bg-surface-hover hover:border-border-hover"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold text-text-primary">{m.label}</span>
              <span className="text-xs text-text-tertiary">→</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{m.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
