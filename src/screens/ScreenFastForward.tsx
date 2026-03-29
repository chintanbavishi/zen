import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { useSound } from "../hooks/useSound";
import { useCountUp } from "../hooks/useCountUp";
import { STARTING_CASH } from "../engine/constants";

interface Props {
  state: GameState;
  onDone: () => void;
}

function cashColor(amount: number): string {
  if (amount > 100_000) return "text-money-green";
  if (amount > 30_000) return "text-money-amber";
  return "text-money-red";
}

function cashBarColor(amount: number): string {
  if (amount > 100_000) return "bg-money-green";
  if (amount > 30_000) return "bg-money-amber";
  return "bg-money-red";
}

export function ScreenFastForward({ state, onDone }: Props) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play: playHeartbeat } = useSound("heartbeat");
  const { play: playWhoosh } = useSound("whoosh");
  const { play: playCha } = useSound("chaching");

  const events = state.monthEvents;
  const finalCash = events.length > 0 ? Math.max(0, events[events.length - 1].moneyDelta) : STARTING_CASH;
  const displayedCash = revealedCount > 0
    ? Math.max(0, events[Math.min(revealedCount - 1, events.length - 1)].moneyDelta)
    : STARTING_CASH;

  const animatedCash = useCountUp(displayedCash, 600);

  useEffect(() => {
    if (skipped) return;
    if (revealedCount >= events.length) {
      setAllDone(true);
      timerRef.current = setTimeout(() => setShowButton(true), 2000);
      return;
    }
    timerRef.current = setTimeout(() => {
      const next = revealedCount + 1;
      const event = events[revealedCount];
      if (event) {
        const cash = Math.max(0, event.moneyDelta);
        if (cash < 30_000) playHeartbeat();
        else playWhoosh();
      }
      setRevealedCount(next);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [revealedCount, events, skipped, playHeartbeat, playWhoosh]);

  function handleSkip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSkipped(true);
    setRevealedCount(events.length);
    setAllDone(true);
    playCha();
    setTimeout(() => setShowButton(true), 500);
  }

  const isLow = animatedCash < 30_000;
  const containerClass = isLow
    ? "transition-all duration-1000"
    : "transition-all duration-500";

  return (
    <div
      className={`min-h-dvh flex flex-col items-center px-5 pb-8 pt-12 ${containerClass}`}
      style={{ filter: isLow ? "saturate(0.7)" : "saturate(1)" }}
      onClick={!allDone ? handleSkip : undefined}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <h1 className="font-display text-3xl font-bold text-heading mb-1">
            let's see how this plays out
          </h1>
          <p className="text-muted text-xs lowercase">
            {!allDone ? "tap to skip →" : "18 months later..."}
          </p>
        </motion.div>

        {/* Cash counter */}
        <motion.div
          className="mb-8 text-center"
          animate={{ scale: isLow ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: isLow ? Infinity : 0, duration: 1 }}
        >
          <p className="text-muted text-xs font-mono lowercase mb-1">remaining cash</p>
          <p className={`font-mono font-bold text-5xl tabular-nums ${cashColor(animatedCash)}`}>
            ${animatedCash.toLocaleString()}
          </p>
          {/* Cash bar */}
          <div className="mt-3 h-2 bg-black/5 rounded-full overflow-hidden max-w-xs mx-auto">
            <motion.div
              className={`h-full rounded-full transition-all duration-600 ${cashBarColor(animatedCash)}`}
              style={{ width: `${Math.min(100, (animatedCash / STARTING_CASH) * 100)}%` }}
            />
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative flex-1">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black/5 rounded-full" />

          <div className="flex flex-col gap-0">
            <AnimatePresence>
              {events.slice(0, revealedCount).map((event, idx) => {
                const cash = Math.max(0, event.moneyDelta);
                const isLastRevealed = idx === revealedCount - 1;
                return (
                  <motion.div
                    key={`${event.month}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`relative flex gap-4 pb-5 pl-10 ${isLastRevealed ? "opacity-100" : "opacity-70"}`}
                  >
                    {/* Dot */}
                    <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-surface ${cashBarColor(cash)}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <span className="font-display font-bold text-heading text-sm">
                          month {event.month}
                        </span>
                        <span className={`font-mono text-sm font-bold tabular-nums shrink-0 ${cashColor(cash)}`}>
                          ${cash.toLocaleString()}
                        </span>
                      </div>
                      {/* Progress bar for this month */}
                      <div className="h-1 bg-black/5 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${cashBarColor(cash)}`}
                          style={{ width: `${Math.min(100, (cash / STARTING_CASH) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-body leading-snug">
                        <span className="mr-1">{event.emoji}</span>
                        {event.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Loading dots when not done */}
            {!allDone && (
              <motion.div
                className="pl-10 flex gap-1 items-center"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Final outcome button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDone}
                className="px-8 py-3 rounded-full font-display font-semibold text-white text-lg cursor-pointer bg-gradient-to-r from-accent-orange to-accent-pink hover:shadow-lg hover:shadow-accent-pink/25 transition-all"
              >
                see what happens →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final cash summary */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-card-yellow rounded-xl text-center"
          >
            <p className="text-xs text-muted lowercase">ending cash</p>
            <p className={`font-mono font-bold text-2xl ${cashColor(finalCash)}`}>
              ${finalCash.toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
