import { motion } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";
import { useSound } from "../hooks/useSound";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

export function ScreenLifestyle({ state, dispatch, onNext, onBack }: Props) {
  const { play } = useSound("pop");
  const selected = state.lifestyle.filter((l) => l.selected);

  function toggle(id: string) {
    play();
    dispatch({ type: "TOGGLE_LIFESTYLE", payload: id });
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">founder expenses</h1>
        <p className="text-sm text-text-tertiary">the things you tell yourself are "necessary"</p>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin">
        {state.lifestyle.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => toggle(item.id)}
            className={`w-full text-left rounded-xl p-4 cursor-pointer transition-all duration-150 border flex items-center gap-3 ${
              item.selected
                ? "bg-accent-dim border-accent/30"
                : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover"
            }`}
          >
            <span className="text-base shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">{item.name}</div>
              <div className="text-xs text-text-tertiary truncate">{item.description}</div>
            </div>
            <div className="shrink-0 text-right">
              {item.oneTimeCost > 0 && <div className="text-xs font-mono text-text-secondary">${item.oneTimeCost.toLocaleString()}</div>}
              {item.monthlyCost > 0 && <div className="text-xs font-mono text-text-secondary">${item.monthlyCost.toLocaleString()}/mo</div>}
              {item.selected && <div className="text-accent text-[10px] mt-0.5">●</div>}
            </div>
          </motion.button>
        ))}
      </div>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextLabel={selected.length > 0 ? `continue (${selected.length})` : "skip"}
      />
    </div>
  );
}
