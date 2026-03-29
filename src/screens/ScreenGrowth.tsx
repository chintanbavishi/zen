import { motion } from "framer-motion";
import type { GameState, GameAction, GrowthOption } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

const growthColors = [
  "bg-card-mint",
  "bg-card-lavender",
  "bg-card-peach",
  "bg-card-blue",
  "bg-card-yellow",
  "bg-card-pink",
];

function GrowthCard({
  option,
  dispatch,
  colorIndex,
  animIndex,
}: {
  option: GrowthOption;
  dispatch: React.Dispatch<GameAction>;
  colorIndex: number;
  animIndex: number;
}) {
  const selected = option.selected;
  const bgBase = growthColors[colorIndex % growthColors.length];

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animIndex * 0.06, duration: 0.3 }}
      onClick={() => dispatch({ type: "TOGGLE_GROWTH", payload: option.id })}
      className={`w-full rounded-2xl p-5 text-left cursor-pointer transition-all duration-200 hover:scale-[1.03] shadow-sm ${
        selected ? `ring-2 ring-accent-violet bg-violet-50` : bgBase
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{option.emoji}</span>
        <span className="font-display font-bold text-heading text-base lowercase flex-1">{option.name}</span>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent-violet font-bold">
            ✓
          </motion.span>
        )}
      </div>
      <p className="text-body text-sm lowercase leading-relaxed mb-2">{option.description}</p>
      <div className="flex gap-3 text-xs font-mono font-bold">
        {option.monthlyCost > 0 && (
          <span className="text-money-amber">${option.monthlyCost.toLocaleString()}/mo</span>
        )}
        {option.oneTimeCost > 0 && (
          <span className="text-money-red">${option.oneTimeCost.toLocaleString()} one-time</span>
        )}
        {option.monthlyCost === 0 && option.oneTimeCost === 0 && (
          <span className="text-money-green">free 🎉</span>
        )}
      </div>
    </motion.button>
  );
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

  const selectedCount = filtered.filter((g) => g.selected).length;

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-heading lowercase mb-2">
          how do people find out you exist?
        </h1>
        <p className="text-muted text-sm lowercase">
          pick your growth channels. or hope vibes go viral.
          {selectedCount > 0 && (
            <span className="ml-2 text-accent-violet font-bold">{selectedCount} selected</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {filtered.map((option, i) => (
          <GrowthCard
            key={option.id}
            option={option}
            dispatch={dispatch}
            colorIndex={i}
            animIndex={i}
          />
        ))}
      </div>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={false}
        nextLabel="let's go →"
      />
    </div>
  );
}
