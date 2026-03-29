import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { useSound } from "../hooks/useSound";
import { useCountUp } from "../hooks/useCountUp";
import { getRemainingCash, getMonthlyBurn } from "../engine/gameReducer";
import { STARTING_CASH } from "../engine/constants";

interface Props {
  state: GameState;
  onDone: () => void;
}

export function ScreenFastForward({ state, onDone }: Props) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play: playHeart } = useSound("heartbeat");
  const { play: playWhoosh } = useSound("whoosh");

  const events = state.monthEvents;
  const startCash = getRemainingCash(state);
  const baseBurn = getMonthlyBurn(state);
  const fullTeamBurn = state.team.reduce((s, t) => s + t.salary * t.count, 0);
  const nonTeamBurn = baseBurn - fullTeamBurn;

  // Compute cash at each month accounting for team contract durations
  const cashAt = (monthIdx: number) => {
    let cash = startCash;
    for (let m = 1; m <= monthIdx + 1; m++) {
      const teamBurn = state.team.reduce((s, t) => s + (m <= t.months ? t.salary * t.count : 0), 0);
      cash -= (teamBurn + nonTeamBurn);
    }
    return Math.max(0, cash);
  };
  const displayedCash = revealed > 0 ? cashAt(revealed - 1) : startCash;
  const animCash = useCountUp(displayedCash, 400);

  useEffect(() => {
    if (skipped || revealed >= events.length) {
      setDone(true);
      timerRef.current = setTimeout(() => setShowBtn(true), 1500);
      return;
    }
    timerRef.current = setTimeout(() => {
      const c = cashAt(revealed);
      if (c < 30_000) playHeart(); else playWhoosh();
      setRevealed((p) => p + 1);
    }, 1200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [revealed, events.length, skipped]);

  function skip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSkipped(true);
    setRevealed(events.length);
    setDone(true);
    setTimeout(() => setShowBtn(true), 300);
  }

  const low = animCash < 30_000;

  return (
    <div className="min-h-dvh flex flex-col px-5 pb-8 pt-8" onClick={!done ? skip : undefined}>
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        <div className="mb-6 text-center">
          <p className="text-xs font-mono text-text-tertiary tracking-wider mb-3">SIMULATING 18 MONTHS</p>
          <div className={`font-mono font-bold text-4xl tabular-nums transition-colors ${low ? "text-red" : "text-green"}`}>
            ${animCash.toLocaleString()}
          </div>
          <div className="mt-3 h-[2px] bg-border rounded-full overflow-hidden max-w-xs mx-auto">
            <motion.div className={`h-full rounded-full ${low ? "bg-red" : "bg-green"}`} style={{ width: `${Math.min(100, (animCash / STARTING_CASH) * 100)}%` }} />
          </div>
          {!done && <p className="text-[10px] text-text-tertiary mt-2">tap to skip</p>}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {events.slice(0, revealed).map((ev, i) => {
              const c = cashAt(i);
              return (
                <motion.div
                  key={`${ev.month}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-baseline gap-3 py-3 border-b border-border"
                >
                  <span className="font-mono text-xs text-text-tertiary w-12 shrink-0">M{ev.month}</span>
                  <span className="text-xs text-text-secondary flex-1">{ev.emoji} {ev.text}</span>
                  <span className={`font-mono text-xs shrink-0 ${c < 30_000 ? "text-red" : "text-text-tertiary"}`}>
                    ${c.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {showBtn && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-center">
            <button onClick={onDone} className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer hover:bg-accent/90 transition-all">
              see the verdict →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
