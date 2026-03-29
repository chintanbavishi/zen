import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  onStart: () => void;
}

export function ScreenSplash({ onStart }: Props) {
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const count = useCountUp(250000, 2000);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 2500);
    const t2 = setTimeout(() => setShowButton(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <p className="text-lg text-muted font-sans lowercase tracking-wide">
          congratulations. you just raised
        </p>

        <div className="font-mono font-bold text-heading text-6xl sm:text-8xl tabular-nums">
          ${count.toLocaleString()}
        </div>

        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-2 max-w-xs"
          >
            <p className="text-body text-base lowercase">
              seed round. pre-product. pre-revenue.
            </p>
            <p className="text-muted text-sm lowercase">
              now comes the fun part — spending it.
            </p>
          </motion.div>
        )}

        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="mt-4 px-10 py-4 rounded-full font-display font-semibold text-white text-xl cursor-pointer transition-all duration-200 bg-gradient-to-r from-accent-orange to-accent-pink hover:shadow-lg hover:shadow-accent-pink/25 shadow-md"
          >
            let's burn 🔥
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
