import { motion } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

export function ScreenOffice({ state, dispatch, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">where do you work?</h1>
        <p className="text-sm text-text-tertiary">select all that apply</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {state.offices.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => dispatch({ type: "TOGGLE_OFFICE", payload: o.id })}
            className={`w-full text-left rounded-xl p-4 cursor-pointer transition-all duration-150 border flex items-center gap-4 ${
              o.selected
                ? "bg-accent-dim border-accent/30"
                : "bg-surface border-border hover:bg-surface-hover hover:border-border-hover"
            }`}
          >
            <span className="text-lg">{o.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">{o.name}</div>
              <div className="text-xs text-text-tertiary truncate">{o.description}</div>
            </div>
            <div className="shrink-0 text-right">
              {o.monthlyCost === 0 ? (
                <span className="text-xs font-mono text-green">$0</span>
              ) : (
                <span className="text-xs font-mono text-text-secondary">
                  ${o.monthlyCost.toLocaleString()}/mo
                  {o.perPerson && <span className="text-text-tertiary"> × hd</span>}
                </span>
              )}
              {o.selected && <div className="text-accent text-[10px] mt-0.5">●</div>}
            </div>
          </motion.button>
        ))}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
