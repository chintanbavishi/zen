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

const monthLabels: Record<number, string> = {
  1: "1mo — a trial run",
  2: "2mo — barely enough to onboard",
  3: "3mo — the classic probation",
  6: "6mo — half your runway",
  9: "9mo — committed but cautious",
  12: "12mo — in it for the long haul",
  18: "18mo — till death do us part",
};

const monthOptions = [1, 2, 3, 6, 9, 12, 18];

function TeamRow({ member, dispatch, b2bAvailable, index }: {
  member: TeamMember;
  dispatch: React.Dispatch<GameAction>;
  b2bAvailable: boolean;
  index: number;
}) {
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(member.salary));
  const disabled = member.b2bOnly && !b2bAvailable;
  const totalCost = member.salary * member.count * member.months;
  const active = member.count > 0;

  function commitSalary() {
    const v = parseInt(salaryInput, 10);
    if (!isNaN(v) && v >= 0) dispatch({ type: "SET_TEAM_SALARY", payload: { id: member.id, salary: v } });
    else setSalaryInput(String(member.salary));
    setEditingSalary(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border transition-all duration-150 ${
        disabled ? "opacity-25 pointer-events-none border-border bg-transparent" :
        active ? "border-accent/20 bg-accent-dim" : "border-border bg-surface hover:bg-surface-hover"
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <span className="text-lg shrink-0">{member.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">{member.role}</div>
          <div className="text-xs text-text-tertiary truncate">{member.description}</div>
          <div className="mt-1">
            {editingSalary ? (
              <input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onBlur={commitSalary}
                onKeyDown={(e) => { if (e.key === "Enter") commitSalary(); if (e.key === "Escape") { setSalaryInput(String(member.salary)); setEditingSalary(false); } }}
                autoFocus
                className="w-24 text-xs font-mono bg-bg border border-accent/40 rounded px-2 py-1 text-text-primary outline-none"
              />
            ) : (
              <button onClick={() => { setEditingSalary(true); setSalaryInput(String(member.salary)); }} className="text-xs font-mono text-text-secondary hover:text-accent cursor-pointer transition-colors">
                ${member.salary.toLocaleString()}/mo
              </button>
            )}
          </div>
        </div>

        {/* Count controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => dispatch({ type: "SET_TEAM_COUNT", payload: { id: member.id, count: member.count - 1 } })}
            disabled={member.count === 0}
            className="w-7 h-7 rounded-md border border-border bg-surface text-text-secondary text-sm flex items-center justify-center cursor-pointer hover:bg-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >−</button>
          <span className="w-5 text-center font-mono text-sm text-text-primary">{member.count}</span>
          <button
            onClick={() => dispatch({ type: "SET_TEAM_COUNT", payload: { id: member.id, count: member.count + 1 } })}
            disabled={member.count >= 5}
            className="w-7 h-7 rounded-md border border-border bg-surface text-text-secondary text-sm flex items-center justify-center cursor-pointer hover:bg-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >+</button>
        </div>
      </div>

      {/* Months picker — only shows when count > 0 */}
      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/50 px-4 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-text-tertiary">how long are they staying?</span>
            <span className="text-xs font-mono text-accent">{member.months}mo</span>
          </div>

          {/* Month selector pills */}
          <div className="flex gap-1.5 flex-wrap">
            {monthOptions.map((m) => (
              <button
                key={m}
                onClick={() => dispatch({ type: "SET_TEAM_MONTHS", payload: { id: member.id, months: m } })}
                className={`px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-all duration-150 ${
                  member.months === m
                    ? "bg-accent text-white"
                    : "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active"
                }`}
              >
                {m}mo
              </button>
            ))}
          </div>

          {/* Snarky label + total cost */}
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[10px] text-text-tertiary italic">
              {monthLabels[member.months] ?? `${member.months}mo`}
            </span>
            <span className="text-xs font-mono text-green">
              ${totalCost.toLocaleString()} total
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ScreenTeam({ state, dispatch, onNext, onBack }: Props) {
  const b2b = state.markets.includes("b2b");
  const totalPeople = state.team.reduce((s, t) => s + t.count, 0);
  const monthlyBurn = state.team.reduce((s, t) => s + t.salary * t.count, 0);
  const totalCommitment = state.team.reduce((s, t) => s + t.salary * t.count * t.months, 0);

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">who's building this?</h1>
        <p className="text-sm text-text-tertiary">hire people. set their salary. decide when to fire them.</p>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin">
        {state.team.map((m, i) => (
          <TeamRow key={m.id} member={m} dispatch={dispatch} b2bAvailable={b2b} index={i} />
        ))}
      </div>

      {totalPeople > 0 && (
        <div className="mt-4 py-3 px-4 rounded-lg border border-border bg-surface text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">{totalPeople} {totalPeople === 1 ? "person" : "people"}</span>
            <span className="font-mono text-amber">${monthlyBurn.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-text-tertiary text-xs">total commitment</span>
            <span className="font-mono text-xs text-text-secondary">${totalCommitment.toLocaleString()}</span>
          </div>
        </div>
      )}

      <NavButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
