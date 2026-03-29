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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`min-h-dvh flex flex-col items-center px-5 pb-8 ${hasHeader ? "pt-24" : "pt-0"}`}
      >
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
