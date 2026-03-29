import { motion } from "framer-motion";
import type { GameState, GameAction, MarketType } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

const markets: { id: MarketType; emoji: string; name: string; subtitle: string; bgBase: string; bgSelected: string; ring: string }[] = [
  {
    id: "b2b",
    emoji: "🏢",
    name: "b2b",
    subtitle: "sell to businesses. long sales cycles, enterprise jargon, and someone always asking for a 'pilot'.",
    bgBase: "bg-card-lavender",
    bgSelected: "bg-violet-100",
    ring: "ring-accent-violet",
  },
  {
    id: "b2c",
    emoji: "👤",
    name: "b2c",
    subtitle: "sell to consumers. viral potential, high churn, and users who rate you 1-star if the app is slow.",
    bgBase: "bg-card-pink",
    bgSelected: "bg-pink-100",
    ring: "ring-accent-pink",
  },
];

export function ScreenMarket({ state, dispatch, onNext, onBack }: Props) {
  const canProceed = state.markets.length > 0;

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-display font-bold text-heading lowercase mb-2">
          what are you building?
        </h1>
        <p className="text-muted text-sm lowercase">pick one or both. no judgment.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {markets.map((market, i) => {
          const selected = state.markets.includes(market.id);
          return (
            <motion.button
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              onClick={() => dispatch({ type: "TOGGLE_MARKET", payload: market.id })}
              className={`w-full rounded-2xl p-6 text-left cursor-pointer transition-all duration-200 hover:scale-[1.03] shadow-sm ${
                selected
                  ? `${market.bgSelected} ring-2 ${market.ring}`
                  : market.bgBase
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{market.emoji}</span>
                <span className="font-display font-bold text-heading text-2xl lowercase">{market.name}</span>
                {selected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-lg"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
              <p className="text-body text-sm lowercase leading-relaxed">{market.subtitle}</p>
            </motion.button>
          );
        })}
      </div>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!canProceed}
      />
    </div>
  );
}
