import { useState, useEffect, useRef } from "react";

export function useCountUp(target: number, duration = 2000): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = value;
    startTime.current = null;
    function animate(time: number) {
      if (startTime.current === null) startTime.current = time;
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(startValue.current + (target - startValue.current) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}
