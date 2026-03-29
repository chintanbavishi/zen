import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

interface TransitionWrapperProps {
  screenKey: number;
  children: ReactNode;
}

export function TransitionWrapper({ screenKey, children }: TransitionWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-dvh flex flex-col items-center justify-center px-6 pt-20 pb-10"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
