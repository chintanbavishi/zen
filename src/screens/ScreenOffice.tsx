import { motion } from "framer-motion";
import type { GameState, GameAction, OfficeOption } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

const officeColors: Record<string, string> = {
  apartment: "bg-card-yellow",
  coworking: "bg-card-mint",
  real_office: "bg-card-blue",
  bangalore: "bg-card-peach",
  garage: "bg-card-yellow",
};

const officeSelectedColors: Record<string, string> = {
  apartment: "bg-yellow-100",
  coworking: "bg-emerald-100",
  real_office: "bg-blue-100",
  bangalore: "bg-orange-100",
  garage: "bg-yellow-100",
};

function OfficeCard({ office, dispatch, index }: { office: OfficeOption; dispatch: React.Dispatch<GameAction>; index: number }) {
  const selected = office.selected;
  const bgBase = officeColors[office.id] ?? "bg-card-blue";
  const bgSel = officeSelectedColors[office.id] ?? "bg-blue-100";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      onClick={() => dispatch({ type: "TOGGLE_OFFICE", payload: office.id })}
      className={`w-full rounded-2xl p-5 text-left cursor-pointer transition-all duration-200 hover:scale-[1.03] shadow-sm ${
        selected ? `${bgSel} ring-2 ring-accent-violet` : bgBase
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{office.emoji}</span>
        <span className="font-display font-bold text-heading text-lg lowercase flex-1">{office.name}</span>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent-violet font-bold">
            ✓
          </motion.span>
        )}
      </div>
      <p className="text-body text-sm lowercase leading-relaxed mb-2">{office.description}</p>
      <div className="font-mono font-bold text-sm">
        {office.monthlyCost === 0 ? (
          <span className="text-money-green">free 🎉</span>
        ) : (
          <span className="text-money-amber">
            ${office.monthlyCost.toLocaleString()}/mo
            {office.perPerson && <span className="text-muted font-normal"> per person</span>}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function ScreenOffice({ state, dispatch, onNext, onBack }: Props) {
  const selectedCount = state.offices.filter((o) => o.selected).length;

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-heading lowercase mb-2">
          where does the magic happen?
        </h1>
        <p className="text-muted text-sm lowercase">
          pick your HQ. or don't. vibes are free.
          {selectedCount > 0 && (
            <span className="ml-2 text-accent-violet font-bold">{selectedCount} selected</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {state.offices.map((office, i) => (
          <OfficeCard key={office.id} office={office} dispatch={dispatch} index={i} />
        ))}
      </div>

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={false}
      />
    </div>
  );
}
