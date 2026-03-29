import { motion } from "framer-motion";

interface ChoiceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  cost?: string;
  onClick: () => void;
  variant?: "default" | "large";
}

export function ChoiceCard({ icon, title, subtitle, cost, onClick, variant = "default" }: ChoiceCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20 ${
        variant === "large" ? "py-10" : ""
      }`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold lowercase mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{subtitle}</p>
      {cost && (
        <p className="text-sm text-burn font-medium mt-3">{cost}</p>
      )}
    </motion.button>
  );
}
