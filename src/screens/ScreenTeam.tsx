import { useState } from "react";
import { motion } from "framer-motion";
import type { GameState, GameAction, TeamMember } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

function TeamCard({
  member,
  dispatch,
  b2bAvailable,
  index,
}: {
  member: TeamMember;
  dispatch: React.Dispatch<GameAction>;
  b2bAvailable: boolean;
  index: number;
}) {
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(member.salary));

  const isDisabled = member.b2bOnly && !b2bAvailable;
  const total = member.count * member.salary;

  function handleSalaryBlur() {
    const parsed = parseInt(salaryInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      dispatch({ type: "SET_TEAM_SALARY", payload: { id: member.id, salary: parsed } });
    } else {
      setSalaryInput(String(member.salary));
    }
    setEditingSalary(false);
  }

  function handleSalaryKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSalaryBlur();
    if (e.key === "Escape") {
      setSalaryInput(String(member.salary));
      setEditingSalary(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`bg-surface rounded-2xl p-4 shadow-sm transition-all duration-200 ${
        isDisabled ? "opacity-40 pointer-events-none" : ""
      } ${member.count > 0 ? "border-l-4 border-accent-violet" : "border-l-4 border-transparent"}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl mt-0.5">{member.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-heading text-sm lowercase leading-tight">
            {member.role}
          </div>
          <p className="text-muted text-xs lowercase leading-snug mt-0.5">{member.description}</p>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-3">
        {/* Salary */}
        <div className="flex items-center gap-1.5">
          {editingSalary ? (
            <input
              type="number"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              onBlur={handleSalaryBlur}
              onKeyDown={handleSalaryKeyDown}
              autoFocus
              className="w-24 text-xs font-mono font-bold text-heading bg-bg border border-accent-violet rounded-lg px-2 py-1 outline-none"
            />
          ) : (
            <button
              onClick={() => { setEditingSalary(true); setSalaryInput(String(member.salary)); }}
              className="text-xs font-mono font-bold text-heading cursor-pointer hover:text-accent-violet transition-colors flex items-center gap-1"
            >
              ${member.salary.toLocaleString()}/mo
              <span className="text-muted text-xs">✏️</span>
            </button>
          )}
        </div>

        {/* Count controls */}
        <div className="flex items-center gap-2">
          {member.count > 0 && (
            <span className="text-xs font-mono text-money-green font-bold">
              ${total.toLocaleString()}/mo
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch({ type: "SET_TEAM_COUNT", payload: { id: member.id, count: member.count - 1 } })}
              disabled={member.count === 0}
              className="w-8 h-8 rounded-full bg-bg border border-black/10 font-bold text-heading text-lg cursor-pointer hover:bg-card-lavender hover:border-accent-violet transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              −
            </button>
            <span className="w-5 text-center font-mono font-bold text-heading text-sm">
              {member.count}
            </span>
            <button
              onClick={() => dispatch({ type: "SET_TEAM_COUNT", payload: { id: member.id, count: member.count + 1 } })}
              disabled={member.count >= 5}
              className="w-8 h-8 rounded-full bg-bg border border-black/10 font-bold text-heading text-lg cursor-pointer hover:bg-card-lavender hover:border-accent-violet transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ScreenTeam({ state, dispatch, onNext, onBack }: Props) {
  const b2bAvailable = state.markets.includes("b2b");
  const totalPeople = state.team.reduce((sum, t) => sum + t.count, 0);
  const totalBurn = state.team.reduce((sum, t) => sum + t.salary * t.count, 0);

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-heading lowercase mb-2">
          who's building this thing?
        </h1>
        <p className="text-muted text-sm lowercase">adjust headcount and salaries. try not to cry.</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {state.team.map((member, i) => (
          <TeamCard
            key={member.id}
            member={member}
            dispatch={dispatch}
            b2bAvailable={b2bAvailable}
            index={i}
          />
        ))}
      </div>

      {/* Summary */}
      {totalPeople > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 rounded-2xl bg-card-lavender text-sm font-sans lowercase"
        >
          <span className="font-bold text-heading">team: </span>
          <span className="font-mono font-bold text-heading">{totalPeople}</span>
          <span className="text-body"> {totalPeople === 1 ? "person" : "people"} · </span>
          <span className="font-mono font-bold text-money-amber">${totalBurn.toLocaleString()}/mo</span>
        </motion.div>
      )}

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={false}
      />
    </div>
  );
}
