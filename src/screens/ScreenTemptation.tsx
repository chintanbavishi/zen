import { useState } from "react";
import { motion } from "framer-motion";
import { temptations } from "../engine/gameData";
import type { TemptationId } from "../engine/gameState";

interface Props {
  onDone: (accepted: TemptationId[], skipped: TemptationId[]) => void;
}

export function ScreenTemptation({ onDone }: Props) {
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});

  const allDecided = temptations.every((t) => decisions[t.id] !== undefined);

  const decide = (id: TemptationId, indulged: boolean) => {
    setDecisions((prev) => ({ ...prev, [id]: indulged }));
  };

  const handleKeepGoing = () => {
    const accepted = temptations
      .filter((t) => decisions[t.id] === true)
      .map((t) => t.id);
    const skipped = temptations
      .filter((t) => decisions[t.id] === false)
      .map((t) => t.id);
    onDone(accepted, skipped);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg text-white px-6 py-12">
      <p className="text-white/40 text-sm uppercase tracking-widest mb-3">
        month 4. things are going okay. but...
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold lowercase mb-3 text-center">
        temptation knocks.
      </h2>
      <p className="text-white/50 text-sm mb-10 text-center">
        for each one: indulge or resist?
      </p>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {temptations.map((t, i) => {
          const decided = decisions[t.id] !== undefined;
          const indulged = decisions[t.id] === true;
          const resisted = decisions[t.id] === false;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={[
                "rounded-2xl border p-5 flex items-start gap-4 transition-all duration-300",
                indulged
                  ? "border-burn/40 bg-burn/10"
                  : resisted
                  ? "border-white/5 bg-white/5 opacity-50"
                  : "border-white/10 bg-surface",
              ].join(" ")}
            >
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{t.title}</p>
                <p className="text-white/50 text-sm mt-1">{t.subtitle}</p>

                {decided ? (
                  <p
                    className={`mt-3 text-sm font-medium ${
                      indulged ? "text-burn" : "text-white/40"
                    }`}
                  >
                    {indulged ? `burned $${t.cost.toLocaleString()} 🔥` : "resisted ✓"}
                  </p>
                ) : (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => decide(t.id, true)}
                      className="rounded-lg px-4 py-2 text-sm font-medium bg-burn/20 text-burn border border-burn/30 hover:bg-burn/30 transition-colors"
                    >
                      indulge (-${t.cost.toLocaleString()})
                    </button>
                    <button
                      onClick={() => decide(t.id, false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      resist
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {allDecided && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleKeepGoing}
          className="mt-10 px-8 py-3 bg-money text-bg font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          keep going
        </motion.button>
      )}
    </div>
  );
}
