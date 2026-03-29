import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { useSound } from "../hooks/useSound";

interface Props {
  onStart: () => void;
}

export function ScreenWire({ onStart }: Props) {
  const count = useCountUp(250000, 2500);
  const { play: playChaching } = useSound("chaching");
  useEffect(() => {
    const timer = setTimeout(() => playChaching(), 2500);
    return () => clearTimeout(timer);
  }, [playChaching]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-white/40 text-sm uppercase tracking-widest mb-6"
      >
        incoming wire transfer
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-6xl sm:text-8xl font-bold text-money tabular-nums mb-10"
      >
        ${count.toLocaleString()}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 2.8 }}
        className="text-white/60 text-center max-w-md text-base sm:text-lg leading-relaxed mb-8"
      >
        y combinator just wired you $250,000. you have 18 months to prove you&apos;re not a waste of their money.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 3.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="bg-money text-bg font-semibold px-8 py-3 rounded-full text-lg lowercase"
      >
        let&apos;s burn
      </motion.button>
    </div>
  );
}
