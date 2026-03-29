import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn, getRunwayMonths, getRemainingCash } from "../engine/gameReducer";
import { useBurnTick } from "../hooks/useBurnTick";

interface Props {
  state: GameState;
  currentScreen: number;
  totalScreens: number;
}

export function RunwayHeader({ state, currentScreen, totalScreens }: Props) {
  const remaining = getRemainingCash(state);
  const months = getRunwayMonths(state);
  const burn = getMonthlyBurn(state);
  const displayedCash = useBurnTick(remaining, burn);

  const isDanger = months < 6;
  const isWarning = months >= 6 && months <= 12;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      {/* Progress bar */}
      <div className="h-[2px] bg-border">
        <motion.div
          className="h-full bg-accent"
          initial={false}
          animate={{ width: `${((currentScreen) / (totalScreens - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-semibold tabular-nums ${
            isDanger ? "text-red" : isWarning ? "text-amber" : "text-green"
          }`}>
            ${displayedCash.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-tertiary font-mono">
          <span>{months.toFixed(1)}mo left</span>
          {burn > 0 && (
            <span className="text-red">
              −${burn.toLocaleString()}/mo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
