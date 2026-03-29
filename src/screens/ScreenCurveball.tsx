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
  const { play: playPop } = useSound("pop");
  const { play: playWhoosh } = useSound("whoosh");

  const allAnswered = state.curveballs.length > 0 &&
    state.curveballs.every((cb) =>
      state.curveballResponses.some((r) => r.id === cb.id)
    );

  function getResponse(id: string) {
    return state.curveballResponses.find((r) => r.id === id);
  }

  function handleChoose(id: string, choice: "a" | "b") {
    playWhoosh();
    setTimeout(() => playPop(), 300);
    dispatch({ type: "RESPOND_CURVEBALL", payload: { id, choice } });
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
          <p className="text-muted text-sm font-mono mb-1 lowercase">month 8.</p>
          <h1 className="font-display text-3xl font-bold text-heading mb-2">
            life happens.
          </h1>
          <p className="text-muted text-sm lowercase">
            handle these or die. no pressure.
          </p>
        </motion.div>

        {/* Curveball cards */}
        <div className="flex flex-col gap-6 mb-4">
          {state.curveballs.map((cb, idx) => {
            const response = getResponse(cb.id);
            const isAnswered = Boolean(response);

            return (
              <motion.div
                key={cb.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.35 }}
              >
                <div className={`rounded-3xl border-2 overflow-hidden transition-all duration-500 ${
                  isAnswered ? "border-black/5 opacity-80" : "border-black/10 shadow-lg"
                }`}>
                  {/* Event header */}
                  <div className="bg-gradient-to-br from-card-lavender to-card-peach p-6">
                    <div className="text-5xl mb-3">{cb.emoji}</div>
                    <p className="font-display text-xl font-bold text-heading leading-tight">
                      {cb.text}
                    </p>
                  </div>

                  {/* Choices / Result */}
                  <AnimatePresence mode="wait">
                    {!isAnswered ? (
                      <motion.div
                        key="choices"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-surface grid grid-cols-2 gap-3"
                      >
                        {/* Option A */}
                        <button
                          onClick={() => handleChoose(cb.id, "a")}
                          className="bg-card-peach rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-black/5"
                        >
                          <p className="font-semibold text-heading text-sm mb-1">{cb.optionA.label}</p>
                          {cb.optionA.cost !== 0 && (
                            <p className={`font-mono text-xs ${cb.optionA.cost > 0 ? "text-money-red" : "text-money-green"}`}>
                              {cb.optionA.cost > 0 ? `-$${cb.optionA.cost.toLocaleString()}` : `+$${Math.abs(cb.optionA.cost).toLocaleString()}`}
                            </p>
                          )}
                        </button>

                        {/* Option B */}
                        <button
                          onClick={() => handleChoose(cb.id, "b")}
                          className="bg-card-mint rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-black/5"
                        >
                          <p className="font-semibold text-heading text-sm mb-1">{cb.optionB.label}</p>
                          {cb.optionB.cost !== 0 && (
                            <p className={`font-mono text-xs ${cb.optionB.cost > 0 ? "text-money-red" : "text-money-green"}`}>
                              {cb.optionB.cost > 0 ? `-$${cb.optionB.cost.toLocaleString()}` : `+$${Math.abs(cb.optionB.cost).toLocaleString()}`}
                            </p>
                          )}
                          {cb.optionB.cost === 0 && (
                            <p className="font-mono text-xs text-money-green">free</p>
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-4 bg-surface"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{response!.choice === "a" ? "🅰️" : "🅱️"}</span>
                          <div>
                            <p className="font-semibold text-heading text-sm">
                              {response!.choice === "a" ? cb.optionA.label : cb.optionB.label}
                            </p>
                            <p className="text-muted text-xs mt-1">
                              {response!.choice === "a" ? cb.optionA.effect : cb.optionB.effect}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!allAnswered && state.curveballs.length > 0 && (
          <p className="text-center text-muted text-xs mb-4">
            handle all {state.curveballs.length} situations to continue
          </p>
        )}

        <NavButtons
          onNext={allAnswered ? onNext : undefined}
          onBack={onBack}
          nextLabel="see what happens →"
          nextDisabled={!allAnswered}
        />
      </div>
    </div>
  );
}
