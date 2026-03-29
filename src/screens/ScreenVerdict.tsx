import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn } from "../engine/gameReducer";
import { useSound } from "../hooks/useSound";

interface Props {
  state: GameState;
  onContinue: () => void;
}

// Simple SVG pie chart
interface PieSlice {
  label: string;
  value: number;
  color: string;
}

function PieChart({ slices }: { slices: PieSlice[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  let cumAngle = -Math.PI / 2;
  const cx = 80;
  const cy = 80;
  const r = 70;

  const paths = slices.map((sl) => {
    const angle = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: sl.color,
      label: sl.label,
      pct: Math.round((sl.value / total) * 100),
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 justify-center">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-body">{p.label}</span>
            <span className="font-mono text-muted">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScreenVerdict({ state, onContinue }: Props) {
  const { play: playCrowd } = useSound("crowd");
  const { play: playSad } = useSound("sadtrombone");
  const firedRef = useRef(false);
  const raised = state.outcome === "raised";

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (raised) {
      playCrowd();
      // Dynamic import for canvas-confetti
      import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.4 },
          colors: ["#EC4899", "#F97316", "#8B5CF6", "#22C55E", "#F59E0B"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 70,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 70,
            origin: { x: 1 },
          });
        }, 600);
      });
    } else {
      playSad();
    }
  }, [raised, playCrowd, playSad]);

  const monthlyBurn = getMonthlyBurn(state);
  const headcount = state.team.reduce((s, t) => s + t.count, 0);
  const lifestyleSpend = state.lifestyle
    .filter((l) => l.selected)
    .reduce((s, l) => s + l.oneTimeCost + l.monthlyCost * 18, 0);

  const teamSpend = state.team.reduce((s, t) => s + t.salary * t.count * 18, 0);
  const officeSpend = state.offices
    .filter((o) => o.selected)
    .reduce((s, o) => s + (o.perPerson ? o.monthlyCost * Math.max(1, headcount) : o.monthlyCost) * 18, 0);
  const growthSpend = state.growth
    .filter((g) => g.selected)
    .reduce((s, g) => s + g.monthlyCost * 18 + g.oneTimeCost, 0);
  const curveballSpend = state.curveballResponses.reduce((sum, r) => {
    const cb = state.curveballs.find((c) => c.id === r.id);
    if (!cb) return sum;
    return sum + (r.choice === "a" ? cb.optionA.cost : cb.optionB.cost);
  }, 0);

  const pieSlices: PieSlice[] = [
    { label: "Team", value: teamSpend, color: "#8B5CF6" },
    { label: "Office", value: officeSpend, color: "#3B82F6" },
    { label: "Growth", value: growthSpend, color: "#22C55E" },
    { label: "Lifestyle", value: lifestyleSpend, color: "#EC4899" },
    { label: "Curveballs", value: Math.max(0, curveballSpend), color: "#F97316" },
  ].filter((s) => s.value > 0);

  const statCards = [
    { label: "team size", value: `${headcount} people`, color: "bg-card-lavender" },
    { label: "monthly burn", value: `$${monthlyBurn.toLocaleString()}/mo`, color: "bg-card-peach" },
    { label: "lifestyle spend", value: `$${lifestyleSpend.toLocaleString()}`, color: "bg-card-pink" },
    { label: "founder type", value: state.founderType ?? "??", color: "bg-card-mint" },
  ];

  if (raised) {
    const remainingCash = state.monthEvents.length > 0
      ? Math.max(0, state.monthEvents[state.monthEvents.length - 1].moneyDelta)
      : 0;
    statCards.push({ label: "cash remaining", value: `$${remainingCash.toLocaleString()}`, color: "bg-card-yellow" });
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center px-5 pb-8 pt-16"
      style={!raised ? { filter: "grayscale(0.3)" } : undefined}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {raised ? (
          <>
            {/* RAISED */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="font-display text-5xl font-bold text-money-green mb-3 leading-tight">
                $4M SERIES A
              </h1>
              <p className="text-body text-sm max-w-sm mx-auto">
                your investor said: "we love the capital efficiency."
              </p>
              <p className="text-muted text-xs mt-1 italic">
                (translation: "we're shocked you didn't die")
              </p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className={`${s.color} rounded-2xl p-4`}
                >
                  <p className="text-xs text-muted lowercase mb-1">{s.label}</p>
                  <p className="font-semibold text-heading text-sm leading-snug">{s.value}</p>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* DIED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4">💀</div>
              <h1 className="font-display text-4xl font-bold text-money-red mb-3 leading-tight">
                month {state.diedAtMonth ?? "?"}. it's over.
              </h1>
              <p className="text-body text-sm max-w-sm mx-auto">
                you sent the shutting-down blog post.
              </p>
              <p className="text-muted text-xs mt-1">
                4 people read it. 2 were bots.
              </p>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-surface rounded-3xl p-6 mb-6 border border-black/5 shadow-sm"
            >
              <p className="text-heading font-semibold text-sm mb-4 text-center">where did the money go?</p>
              <PieChart slices={pieSlices} />
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  className={`${s.color} rounded-2xl p-4`}
                >
                  <p className="text-xs text-muted lowercase mb-1">{s.label}</p>
                  <p className="font-semibold text-heading text-sm leading-snug">{s.value}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: raised ? 0.8 : 1.2, duration: 0.4 }}
          className="flex justify-end mt-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-8 py-3 rounded-full font-display font-semibold text-white text-lg cursor-pointer bg-gradient-to-r from-accent-orange to-accent-pink hover:shadow-lg hover:shadow-accent-pink/25 transition-all"
          >
            see your results →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
