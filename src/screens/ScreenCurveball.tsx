import { motion, AnimatePresence } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";
import { useSound } from "../hooks/useSound";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

export function ScreenCurveball({ state, dispatch, onNext, onBack }: Props) {
  const { play } = useSound("whoosh");
  const allAnswered = state.curveballs.length > 0 && state.curveballs.every((cb) => state.curveballResponses.some((r) => r.id === cb.id));

  function choose(id: string, choice: "a" | "b") {
    play();
    dispatch({ type: "RESPOND_CURVEBALL", payload: { id, choice } });
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-8">
        <p className="text-xs font-mono text-text-tertiary tracking-wider mb-2">MONTH 8</p>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">life happens.</h1>
        <p className="text-sm text-text-tertiary">deal with it.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {state.curveballs.map((cb, idx) => {
          const response = state.curveballResponses.find((r) => r.id === cb.id);
          const answered = Boolean(response);

          return (
            <motion.div
              key={cb.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`rounded-xl border overflow-hidden transition-all ${answered ? "border-border opacity-60" : "border-border-hover"}`}
            >
              <div className="p-5 border-b border-border">
                <span className="text-2xl mr-3">{cb.emoji}</span>
                <span className="text-sm font-medium text-text-primary">{cb.text}</span>
              </div>

              <AnimatePresence mode="wait">
                {!answered ? (
                  <motion.div key="choices" exit={{ opacity: 0 }} className="grid grid-cols-2 divide-x divide-border">
                    <button onClick={() => choose(cb.id, "a")} className="p-4 text-left hover:bg-surface-hover transition-all cursor-pointer">
                      <div className="text-xs font-medium text-text-primary mb-1">{cb.optionA.label}</div>
                      {cb.optionA.cost !== 0 && (
                        <div className={`text-xs font-mono ${cb.optionA.cost > 0 ? "text-red" : "text-green"}`}>
                          {cb.optionA.cost > 0 ? `−$${cb.optionA.cost.toLocaleString()}` : `+$${Math.abs(cb.optionA.cost).toLocaleString()}`}
                        </div>
                      )}
                    </button>
                    <button onClick={() => choose(cb.id, "b")} className="p-4 text-left hover:bg-surface-hover transition-all cursor-pointer">
                      <div className="text-xs font-medium text-text-primary mb-1">{cb.optionB.label}</div>
                      {cb.optionB.cost !== 0 ? (
                        <div className={`text-xs font-mono ${cb.optionB.cost > 0 ? "text-red" : "text-green"}`}>
                          {cb.optionB.cost > 0 ? `−$${cb.optionB.cost.toLocaleString()}` : `+$${Math.abs(cb.optionB.cost).toLocaleString()}`}
                        </div>
                      ) : (
                        <div className="text-xs font-mono text-green">free</div>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                    <span className="text-xs text-text-tertiary">{response!.choice === "a" ? cb.optionA.effect : cb.optionB.effect}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <NavButtons onNext={allAnswered ? onNext : undefined} onBack={onBack} nextLabel="fast forward →" />
    </div>
  );
}
