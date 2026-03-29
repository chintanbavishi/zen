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

function TeamRow({ member, dispatch, b2bAvailable, index }: { member: TeamMember; dispatch: React.Dispatch<GameAction>; b2bAvailable: boolean; index: number }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(member.salary));
  const disabled = member.b2bOnly && !b2bAvailable;

  function commitSalary() {
    const v = parseInt(input, 10);
    if (!isNaN(v) && v >= 0) dispatch({ type: "SET_TEAM_SALARY", payload: { id: member.id, salary: v } });
    else setInput(String(member.salary));
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${
        disabled ? "opacity-25 pointer-events-none border-border bg-transparent" :
        member.count > 0 ? "border-accent/20 bg-accent-dim" : "border-border bg-surface hover:bg-surface-hover"
      }`}
    >
      <span className="text-lg shrink-0">{member.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">{member.role}</div>
        <div className="text-xs text-text-tertiary truncate">{member.description}</div>
        <div className="mt-1">
          {editing ? (
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={commitSalary}
              onKeyDown={(e) => { if (e.key === "Enter") commitSalary(); if (e.key === "Escape") { setInput(String(member.salary)); setEditing(false); } }}
              autoFocus
              className="w-24 text-xs font-mono bg-bg border border-accent/40 rounded px-2 py-1 text-text-primary outline-none"
            />
          ) : (
            <button onClick={() => { setEditing(true); setInput(String(member.salary)); }} className="text-xs font-mono text-text-secondary hover:text-accent cursor-pointer transition-colors">
              ${member.salary.toLocaleString()}/mo
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {member.count > 0 && (
          <span className="text-xs font-mono text-green">${(member.count * member.salary).toLocaleString()}</span>
        )}
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
    </motion.div>
  );
}

export function ScreenTeam({ state, dispatch, onNext, onBack }: Props) {
  const b2b = state.markets.includes("b2b");
  const total = state.team.reduce((s, t) => s + t.count, 0);
  const burn = state.team.reduce((s, t) => s + t.salary * t.count, 0);

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">who's building this?</h1>
        <p className="text-sm text-text-tertiary">tap salaries to edit. max 5 per role.</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {state.team.map((m, i) => (
          <TeamRow key={m.id} member={m} dispatch={dispatch} b2bAvailable={b2b} index={i} />
        ))}
      </div>

      {total > 0 && (
        <div className="mt-4 py-3 px-4 rounded-lg border border-border bg-surface text-sm flex justify-between">
          <span className="text-text-secondary">{total} {total === 1 ? "person" : "people"}</span>
          <span className="font-mono text-amber">${burn.toLocaleString()}/mo</span>
        </div>
      )}

      <NavButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
