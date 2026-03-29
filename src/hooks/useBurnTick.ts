import { useState, useEffect, useRef } from "react";

/**
 * Makes the money counter drain in real-time like a Squid Game countdown.
 * Drains faster as burn rate increases. Purely visual — doesn't affect game state.
 */
export function useBurnTick(cash: number, monthlyBurn: number): number {
  const [displayed, setDisplayed] = useState(cash);
  const targetRef = useRef(cash);
  const displayedRef = useRef(cash);

  // When game state cash changes, snap to new value
  useEffect(() => {
    targetRef.current = cash;
    displayedRef.current = cash;
    setDisplayed(cash);
  }, [cash]);

  useEffect(() => {
    if (monthlyBurn <= 0) return;

    // Drain speed: convert monthly burn to per-frame drain
    // At $20K/mo burn, drain ~$7 per frame (60fps) = visible and anxiety-inducing
    const perSecond = monthlyBurn / 2.5; // Exaggerated for drama (like 2.5 second "months")
    const fps = 60;
    const perFrame = Math.max(1, Math.round(perSecond / fps));

    let rafId: number;
    let lastTime = performance.now();

    function tick(now: number) {
      const delta = now - lastTime;
      if (delta >= 1000 / fps) {
        lastTime = now;
        displayedRef.current = Math.max(0, displayedRef.current - perFrame);
        setDisplayed(displayedRef.current);
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [monthlyBurn]);

  return displayed;
}
