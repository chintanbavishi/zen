import { motion } from "framer-motion";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function NavButtons({ onNext, onBack, nextLabel = "next →", nextDisabled = false, showBack = true }: Props) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mt-8 mb-6">
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-heading transition-colors cursor-pointer"
        >
          ← back
        </button>
      ) : <div />}

      {onNext && (
        <motion.button
          whileHover={!nextDisabled ? { scale: 1.05 } : {}}
          whileTap={!nextDisabled ? { scale: 0.95 } : {}}
          onClick={nextDisabled ? undefined : onNext}
          className={`px-8 py-3 rounded-full font-display font-semibold text-white text-lg cursor-pointer transition-all duration-200 ${
            nextDisabled
              ? "bg-muted cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-accent-orange to-accent-pink hover:shadow-lg hover:shadow-accent-pink/25"
          }`}
        >
          {nextLabel}
        </motion.button>
      )}
    </div>
  );
}
