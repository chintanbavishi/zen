import { motion } from "framer-motion";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function NavButtons({ onNext, onBack, nextLabel = "continue", nextDisabled = false, showBack = true }: Props) {
  return (
    <div className="flex items-center justify-between w-full mt-8 mb-4">
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="text-sm text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          ← back
        </button>
      ) : <div />}

      {onNext && (
        <motion.button
          whileHover={!nextDisabled ? { scale: 1.02 } : {}}
          whileTap={!nextDisabled ? { scale: 0.98 } : {}}
          onClick={nextDisabled ? undefined : onNext}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 ${
            nextDisabled
              ? "bg-surface text-text-tertiary cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/90"
          }`}
        >
          {nextLabel}
        </motion.button>
      )}
    </div>
  );
}
