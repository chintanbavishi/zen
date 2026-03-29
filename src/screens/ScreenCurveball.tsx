import { useMemo } from "react";
import { motion } from "framer-motion";
import { curveballs } from "../engine/gameData";
import type { CurveballId } from "../engine/gameState";

interface Props {
  seed: number;
  onResolve: (id: CurveballId, choice: "fix" | "ignore") => void;
}

export function ScreenCurveball({ seed, onResolve }: Props) {
  const curveball = useMemo(
    () => curveballs[seed % curveballs.length],
    [seed]
  );

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6 py-12">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0 }}
        className="text-warning text-sm uppercase tracking-widest mb-6"
      >
        month 8
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-10"
      >
        <span className="text-4xl mb-4 block">{curveball.icon}</span>
        <h2 className="text-3xl font-bold lowercase">{curveball.title}</h2>
        <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
          {curveball.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <button
          onClick={() => onResolve(curveball.id, "fix")}
          className="rounded-2xl border border-burn/30 bg-burn/10 p-5 text-left hover:bg-burn/20 transition-colors"
        >
          <p className="font-semibold text-white">fix it</p>
          <p className="text-burn text-sm mt-1">
            -${curveball.fixCost.toLocaleString()}
          </p>
        </button>

        <button
          onClick={() => onResolve(curveball.id, "ignore")}
          className="rounded-2xl border border-white/10 bg-surface p-5 text-left hover:bg-white/5 transition-colors"
        >
          <p className="font-semibold text-white">ignore it</p>
          <p className="text-white/40 text-sm mt-1">{curveball.ignoreText}</p>
        </button>
      </motion.div>
    </div>
  );
}
