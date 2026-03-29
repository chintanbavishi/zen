import { motion } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";
import { getMonthlyBurn } from "../engine/gameReducer";
import { useSound } from "../hooks/useSound";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

const CARD_COLORS = [
  "bg-card-mint",
  "bg-card-lavender",
  "bg-card-peach",
  "bg-card-blue",
  "bg-card-yellow",
  "bg-card-pink",
];

export function ScreenLifestyle({ state, dispatch, onNext, onBack }: Props) {
  const { play } = useSound("pop");
  const selectedCount = state.lifestyle.filter((l) => l.selected).length;
  const monthlyBurn = getMonthlyBurn(state);
  const lifestyleMonthly = state.lifestyle
    .filter((l) => l.selected)
    .reduce((s, l) => s + l.monthlyCost, 0);
  const lifestyleOnetime = state.lifestyle
    .filter((l) => l.selected)
    .reduce((s, l) => s + l.oneTimeCost, 0);

  function handleToggle(id: string) {
    play();
    dispatch({ type: "TOGGLE_LIFESTYLE", payload: id });
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-5 pb-8 pt-16">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-3xl font-bold text-heading mb-2">
            the stuff you tell yourself is "necessary"
          </h1>
          <p className="text-muted text-sm lowercase">
            founders call it culture. accountants call it burning money.
          </p>
        </motion.div>

        {/* Burn summary */}
        {(selectedCount > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 bg-card-peach rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-muted lowercase">lifestyle adds</p>
              {lifestyleMonthly > 0 && (
                <p className="font-mono font-bold text-money-red text-lg">+${lifestyleMonthly.toLocaleString()}/mo</p>
              )}
              {lifestyleOnetime > 0 && (
                <p className="font-mono text-sm text-accent-orange">${lifestyleOnetime.toLocaleString()} one-time</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted lowercase">total burn</p>
              <p className="font-mono font-bold text-heading text-lg">${monthlyBurn.toLocaleString()}/mo</p>
            </div>
          </motion.div>
        )}

        {/* Grid of lifestyle items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {state.lifestyle.map((item, idx) => {
            const isSelected = item.selected;
            const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
            const costLabel = item.oneTimeCost > 0
              ? `$${item.oneTimeCost.toLocaleString()} one-time`
              : item.monthlyCost > 0
              ? `$${item.monthlyCost.toLocaleString()}/mo`
              : "free (lol)";

            return (
              <motion.button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`
                  relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                  hover:shadow-md
                  ${isSelected
                    ? "ring-2 ring-accent-pink bg-pink-50 border-accent-pink scale-[1.01]"
                    : `${colorClass} border-black/5`
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-accent-pink text-xs font-bold">✓</span>
                )}
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="font-semibold text-heading text-sm leading-tight mb-1">{item.name}</p>
                <p className="text-xs text-muted mb-2 leading-snug">{item.description}</p>
                <p className={`text-xs font-mono font-semibold ${item.oneTimeCost === 0 && item.monthlyCost === 0 ? "text-money-green" : "text-accent-orange"}`}>
                  {costLabel}
                </p>
              </motion.button>
            );
          })}
        </div>

        {selectedCount === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted text-xs mb-4"
          >
            skipping all lifestyle? bold. suspicious, but bold.
          </motion.p>
        )}

        <NavButtons
          onNext={onNext}
          onBack={onBack}
          nextLabel={selectedCount > 0 ? `add ${selectedCount} item${selectedCount !== 1 ? "s" : ""} →` : "skip lifestyle →"}
        />
      </div>
    </div>
  );
}
