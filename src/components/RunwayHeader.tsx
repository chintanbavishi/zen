import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn, getRunwayMonths, getRemainingCash } from "../engine/gameReducer";

interface Props {
  state: GameState;
  currentScreen: number;
  totalScreens: number;
}

export function RunwayHeader({ state, currentScreen, totalScreens }: Props) {
  const remaining = getRemainingCash(state);
  const months = getRunwayMonths(state);
  const burn = getMonthlyBurn(state);

  const moneyColor = months > 12 ? "text-money-green" : months > 6 ? "text-money-amber" : "text-money-red";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-black/5">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-3 pb-2">
        {Array.from({ length: totalScreens }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentScreen ? "w-6 bg-accent-violet" : i < currentScreen ? "w-1.5 bg-accent-violet/40" : "w-1.5 bg-black/10"
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 px-4 pb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span>💰</span>
          <motion.span
            key={remaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`font-mono font-bold ${moneyColor}`}
          >
            ${remaining.toLocaleString()}
          </motion.span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <span>🗓️</span>
          <span className="font-mono">{months.toFixed(1)} months</span>
        </div>
        {burn > 0 && (
          <div className="flex items-center gap-1.5 text-muted">
            <span>🔥</span>
            <span className="font-mono">${burn.toLocaleString()}/mo</span>
          </div>
        )}
      </div>
    </div>
  );
}
