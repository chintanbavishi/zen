import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  onStart: () => void;
}

export function ScreenSplash({ onStart }: Props) {
  const [phase, setPhase] = useState(0);
  const count = useCountUp(250000, 1200);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <p className="text-xs font-mono text-text-tertiary tracking-widest uppercase mb-6">
          incoming wire transfer
        </p>

        <div className="font-mono font-bold text-5xl sm:text-7xl tabular-nums text-text-primary mb-8">
          ${count.toLocaleString()}
        </div>

        {phase >= 1 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary text-sm max-w-sm leading-relaxed mb-10"
          >
            y combinator just wired you $250,000. you have 18 months to prove you deserve more.
          </motion.p>
        )}

        {phase >= 2 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="px-8 py-3 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer hover:bg-accent/90 transition-all"
          >
            let's burn →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
