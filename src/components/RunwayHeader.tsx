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

  // Squid Game style: money ticks down constantly when there's burn
  const displayedCash = useBurnTick(remaining, burn);

  const isDanger = months < 6;
  const isWarning = months >= 6 && months <= 12;
  const moneyColor = isDanger ? "text-money-red" : isWarning ? "text-money-amber" : "text-money-green";
  const glowColor = isDanger ? "shadow-money-red/30" : isWarning ? "shadow-money-amber/20" : "";

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-black/5 ${isDanger ? "animate-pulse-subtle" : ""}`}>
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
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 pb-3 text-sm">
        <div className={`flex items-center gap-1.5 ${glowColor ? `shadow-lg ${glowColor} rounded-lg px-2 py-0.5` : ""}`}>
          <span className={`${isDanger ? "animate-bounce" : ""}`}>💰</span>
          <span className={`font-mono font-bold tabular-nums ${moneyColor} ${burn > 0 ? "transition-none" : ""}`}>
            ${displayedCash.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <span>🗓️</span>
          <span className="font-mono">{months.toFixed(1)}mo</span>
        </div>
        {burn > 0 && (
          <motion.div
            className="flex items-center gap-1.5 text-money-red"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          >
            <span>🔥</span>
            <span className="font-mono font-bold">-${burn.toLocaleString()}/mo</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
