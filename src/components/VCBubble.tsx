import { motion } from "framer-motion";

interface Props {
  text: string;
  variant: "good" | "mid" | "bad";
  delay: number;
}

const colors = {
  good: "bg-traction/20 text-traction",
  mid: "bg-warning/20 text-warning",
  bad: "bg-burn/20 text-burn",
};

export function VCBubble({ text, variant, delay }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[280px] ${colors[variant]}`}
    >
      {text}
    </motion.div>
  );
}
