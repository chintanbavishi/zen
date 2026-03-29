import { useState } from "react";
import { motion } from "framer-motion";
import type { GameState, GameAction } from "../engine/gameState";
import { NavButtons } from "../components/NavButtons";

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onNext: () => void;
  onBack: () => void;
}

function EditableNumber({ value, onChange, prefix = "$", suffix = "" }: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(value));

  function commit() {
    const v = parseInt(input, 10);
    if (!isNaN(v) && v >= 0) onChange(v);
    else setInput(String(value));
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type="number"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setInput(String(value)); setEditing(false); } }}
        autoFocus
        className="w-28 text-2xl font-mono font-bold bg-bg border border-accent/40 rounded-lg px-3 py-1 text-text-primary outline-none text-center"
      />
    );
  }

  return (
    <button
      onClick={() => { setEditing(true); setInput(String(value)); }}
      className="text-2xl font-mono font-bold text-text-primary hover:text-accent cursor-pointer transition-colors border-b border-dashed border-text-tertiary hover:border-accent pb-0.5"
    >
      {prefix}{value.toLocaleString()}{suffix}
    </button>
  );
}

export function ScreenRevenue({ state, dispatch, onNext, onBack }: Props) {
  const isB2B = state.markets.includes("b2b");
  const price = state.revenue.pricePerMonth;
  const customers = state.revenue.targetCustomers;
  const mrr = price * customers;
  const arr = mrr * 12;

  // Snarky reality check
  let realityCheck = "";
  if (mrr === 0) {
    realityCheck = "so... you're a nonprofit?";
  } else if (isB2B && price < 100) {
    realityCheck = "that's not B2B pricing, that's a tip jar.";
  } else if (!isB2B && price > 100) {
    realityCheck = "consumer app at $" + price + "/mo? bold. very bold.";
  } else if (isB2B && customers > 50) {
    realityCheck = "closing " + customers + " enterprise deals in 18 months? your sales rep just laughed.";
  } else if (!isB2B && customers < 100) {
    realityCheck = "less than 100 users? that's not a product, that's a group chat.";
  } else if (mrr > 50000) {
    realityCheck = "if you actually hit this, VCs will fight over you. big if.";
  } else if (mrr > 10000) {
    realityCheck = "solid target. now you just need to, you know, build the thing.";
  } else if (mrr > 0) {
    realityCheck = "it's a start. ramen-profitable is still profitable.";
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          {isB2B ? "your deal size" : "your pricing"}
        </h1>
        <p className="text-sm text-text-tertiary">
          {isB2B
            ? "how much will you charge per customer, and how many can you close?"
            : "what do you charge, and how many users will actually pay?"
          }
        </p>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* Price */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="text-xs font-mono text-text-tertiary uppercase tracking-wider mb-3">
            {isB2B ? "contract value" : "price per user"}
          </div>
          <div className="flex items-baseline gap-1">
            <EditableNumber
              value={price}
              onChange={(v) => dispatch({ type: "SET_REVENUE_PRICE", payload: v })}
            />
            <span className="text-sm text-text-tertiary">/mo</span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">
            {isB2B
              ? "per seat, per month. the bigger this number, the fewer deals you need."
              : "per user, per month. freemium doesn't count — this is what people actually pay."
            }
          </p>
        </motion.div>

        {/* Customers */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="text-xs font-mono text-text-tertiary uppercase tracking-wider mb-3">
            {isB2B ? "customers to close (18mo)" : "paying users (18mo target)"}
          </div>
          <div className="flex items-baseline gap-1">
            <EditableNumber
              value={customers}
              onChange={(v) => dispatch({ type: "SET_REVENUE_CUSTOMERS", payload: v })}
              prefix=""
            />
            <span className="text-sm text-text-tertiary">{isB2B ? "deals" : "users"}</span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">
            {isB2B
              ? "total closed over 18 months. be honest — your pipeline is a google sheet right now."
              : "total paying users by month 18. not signups. not MAU. people who pay."
            }
          </p>
        </motion.div>

        {/* Revenue projection */}
        {mrr > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-xl border border-accent/20 bg-accent-dim p-5"
          >
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">target MRR</span>
              <span className="text-xl font-mono font-bold text-green">${mrr.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">target ARR</span>
              <span className="text-sm font-mono text-text-secondary">${arr.toLocaleString()}/yr</span>
            </div>
            {realityCheck && (
              <p className="text-xs text-text-secondary italic">{realityCheck}</p>
            )}
          </motion.div>
        )}

        {mrr === 0 && price === 0 && customers === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-text-tertiary text-center italic"
          >
            tap the numbers to edit. investors like it when you have a revenue model.
          </motion.p>
        )}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} nextLabel="continue" />
    </div>
  );
}
