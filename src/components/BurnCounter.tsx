import { motion, AnimatePresence } from "framer-motion";
import { useBurnTick } from "../hooks/useBurnTick";

interface BurnCounterProps {
  cash: number;
  monthlyBurn: number;
  visible: boolean;
}

export function BurnCounter({ cash, monthlyBurn, visible }: BurnCounterProps) {
  const displayed = useBurnTick(cash, monthlyBurn);
  const isLow = displayed < 30_000;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-bg/80 backdrop-blur-sm border-b border-white/5"
        >
          <span className="text-sm text-white/50 lowercase">runway</span>
          <motion.span
            className={`text-2xl font-bold tabular-nums ${isLow ? "text-burn" : "text-money"}`}
            animate={isLow ? { scale: [1, 1.05, 1] } : {}}
            transition={isLow ? { repeat: Infinity, duration: 1.5 } : {}}
          >
            ${displayed.toLocaleString()}
          </motion.span>
          {monthlyBurn > 0 && (
            <span className="text-sm text-white/40">
              -${monthlyBurn.toLocaleString()}/mo
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
