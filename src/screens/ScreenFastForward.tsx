import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MonthEvent } from "../engine/gameState";
import { useSound } from "../hooks/useSound";

interface Props {
  events: MonthEvent[];
  startingCash: number;
  monthlyBurn: number;
  onDone: () => void;
}

function formatCash(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export function ScreenFastForward({ events, startingCash, monthlyBurn, onDone }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [cash, setCash] = useState(startingCash);
  const [showButton, setShowButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allShown = visibleCount >= events.length;

  useEffect(() => {
    if (allShown) return;

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;

        // Update cash based on the newly revealed event
        const event = events[prev];
        if (event) {
          setCash((c) => {
            let updated = c - monthlyBurn;
            if (event.cashDelta) updated += event.cashDelta;
            if (event.mrrDelta && event.mrrDelta > 0) updated += event.mrrDelta;
            return updated;
          });
        }

        if (next >= events.length) {
          clearInterval(timer);
        }
        return next;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [allShown, events, monthlyBurn]);

  // Auto-scroll to bottom as new events appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  // Show button 1s after all events shown
  useEffect(() => {
    if (allShown) {
      const t = setTimeout(() => setShowButton(true), 1000);
      return () => clearTimeout(t);
    }
  }, [allShown]);

  const { playLoop: startHeartbeat, stop: stopHeartbeat } = useSound("heartbeat");
  useEffect(() => {
    if (cash < 30_000 && cash > 0) {
      startHeartbeat(1500);
    } else {
      stopHeartbeat();
    }
    return () => stopHeartbeat();
  }, [cash < 30_000]);

  const isLow = cash < 30_000;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10">
      <p className="text-white/40 uppercase tracking-widest text-xs mb-6">fast forward</p>

      {/* Cash counter */}
      <motion.div
        key={Math.round(cash / 1000)}
        className={`text-4xl font-bold tabular-nums mb-8 transition-colors duration-500 ${isLow ? "text-red-400" : "text-green-400"}`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
      >
        {formatCash(cash)}
      </motion.div>

      {/* Events list */}
      <div
        ref={scrollRef}
        className="w-full max-w-lg h-[50vh] overflow-y-auto"
      >
        <AnimatePresence initial={false}>
          {events.slice(0, visibleCount).map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-white/70 py-3 border-b border-white/5 lowercase"
            >
              <span className="text-white/30 mr-2">mo {event.month}</span>
              {event.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Animated dots while loading */}
        {!allShown && (
          <div className="py-3">
            <motion.span
              className="text-white/30 text-sm"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        )}
      </div>

      {/* Walk into partner meeting button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onDone}
            className="mt-10 px-8 py-3 bg-money text-bg rounded-full font-medium text-sm tracking-wide"
          >
            walk into the partner meeting
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
