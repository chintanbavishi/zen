import { useState, useEffect } from "react";

export function useBurnTick(cash: number, monthlyBurn: number): number {
  const [displayed, setDisplayed] = useState(cash);

  useEffect(() => {
    setDisplayed(cash);
  }, [cash]);

  useEffect(() => {
    if (monthlyBurn <= 0) return;
    const drainPerTick = Math.max(1, Math.floor(monthlyBurn / 30 / 24 / 3600 * 0.1));
    const interval = setInterval(() => {
      setDisplayed((prev) => Math.max(0, prev - drainPerTick));
    }, 100);
    return () => clearInterval(interval);
  }, [monthlyBurn]);

  return displayed;
}
