import { useState, useEffect, useRef } from "react";

/**
 * Fast drain that stops at (cash - monthlyBurn). No loop. Just drains once and holds.
 * Resets when cash changes (new selection made).
 */
export function useBurnTick(cash: number, monthlyBurn: number): number {
  const [displayed, setDisplayed] = useState(cash);
  const ref = useRef(cash);

  useEffect(() => {
    ref.current = cash;
    setDisplayed(cash);
  }, [cash]);

  useEffect(() => {
    if (monthlyBurn <= 0) return;

    const floor = Math.max(0, cash - monthlyBurn);
    const perFrame = Math.max(3, Math.round(monthlyBurn / 45));
    let rafId: number;

    function tick() {
      const next = ref.current - perFrame;
      if (next <= floor) {
        ref.current = floor;
        setDisplayed(floor);
        return; // done. stop.
      }
      ref.current = next;
      setDisplayed(next);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [monthlyBurn, cash]);

  return displayed;
}
