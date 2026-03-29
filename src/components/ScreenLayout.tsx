import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  screenKey: number;
  children: ReactNode;
  hasHeader?: boolean;
}

export function ScreenLayout({ screenKey, children, hasHeader = true }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`min-h-dvh flex flex-col items-center px-5 pb-8 ${hasHeader ? "pt-20" : "pt-0"}`}
      >
        <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
