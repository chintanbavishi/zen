import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import type { GameState } from "../engine/gameState";
import { ShareCard } from "../components/ShareCard";

interface Props {
  state: GameState;
  onRestart: () => void;
}

export function ScreenResult({ state, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const survived = state.outcome === "raised";
  const isB2B = state.businessType === "b2b";

  const primaryLabel = isB2B ? "ARR" : "MAU";
  const primaryValue = isB2B
    ? `$${(state.arr / 1000).toFixed(0)}K`
    : `${(state.mau / 1000).toFixed(1)}K`;

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = "burn-money-result.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate share image", err);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      {/* Emoji */}
      {survived ? (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-7xl"
        >
          🎉
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="text-7xl"
        >
          💀
        </motion.div>
      )}

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={`text-5xl font-bold ${survived ? "text-money" : "text-burn"}`}
      >
        {survived ? "you raised" : "you died"}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-white/60 text-center text-lg"
      >
        {survived
          ? "$4M series A. you survived."
          : "you sent the 'we're shutting down' blog post. 4 people read it."}
      </motion.p>

      {/* Snarky follow-up */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="text-white/30 text-center text-sm"
      >
        {survived
          ? "enjoy the next 24 months of investor updates and board politics."
          : "at least you have a good story for your next company."}
      </motion.p>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="grid grid-cols-3 gap-4 w-full max-w-sm"
      >
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-1 items-center">
          <span className="text-2xl font-bold text-money">{primaryValue}</span>
          <span className="text-xs text-white/40">{primaryLabel}</span>
        </div>
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-1 items-center">
          <span className="text-2xl font-bold text-warning">{state.momGrowth.toFixed(1)}%</span>
          <span className="text-xs text-white/40">MoM growth</span>
        </div>
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-1 items-center">
          <span className="text-2xl font-bold text-burn">${(state.monthlyBurn / 1000).toFixed(0)}K</span>
          <span className="text-xs text-white/40">burn/mo</span>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={handleShare}
          className="bg-money text-black font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity"
        >
          download share card
        </button>
        <button
          onClick={onRestart}
          className="bg-white/10 text-white rounded-full py-3 text-sm hover:bg-white/20 transition-colors"
        >
          try again
        </button>
      </motion.div>

      {/* Hidden ShareCard for capture */}
      <div className="fixed -left-[9999px] top-0">
        <ShareCard ref={cardRef} state={state} />
      </div>
    </div>
  );
}
