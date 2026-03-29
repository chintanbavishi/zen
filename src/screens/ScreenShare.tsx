import { useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn } from "../engine/gameReducer";
import { STARTING_CASH } from "../engine/constants";

interface Props {
  state: GameState;
  onRestart: () => void;
}

const ShareCardFull = forwardRef<HTMLDivElement, { state: GameState }>(({ state }, ref) => {
  const raised = state.outcome === "raised";
  const burn = getMonthlyBurn(state);
  const months = state.diedAtMonth ?? 18;

  return (
    <div ref={ref} style={{
      width: 1080, height: 1080, background: "#09090B", padding: 80,
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column",
      justifyContent: "space-between", boxSizing: "border-box", color: "white",
    }}>
      <div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 40 }}>BURN.MONEY</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
          {raised ? `survived ${months} months` : `burned $${(STARTING_CASH/1000).toFixed(0)}K in ${months}mo`}
        </div>
        <div style={{ display: "inline-block", background: raised ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: raised ? "#22C55E" : "#EF4444", padding: "8px 20px", borderRadius: 8, fontSize: 20, fontWeight: 600 }}>
          {raised ? "SERIES A" : "DEAD"}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>BURN RATE</div>
        <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", color: "#EF4444" }}>${burn.toLocaleString()}/mo</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>can you do better?</div>
        <div style={{ background: "#7C3AED", padding: "12px 28px", borderRadius: 8, fontSize: 18, fontWeight: 600 }}>burn.money →</div>
      </div>
    </div>
  );
});
ShareCardFull.displayName = "ShareCardFull";

export function ScreenShare({ state, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const raised = state.outcome === "raised";
  const burn = getMonthlyBurn(state);
  const months = state.diedAtMonth ?? 18;
  const tweetText = raised
    ? `i survived 18 months on $250K and raised a Series A. can you do better?`
    : `i burned $250K in ${months} months. rip. can you do better?`;

  async function download() {
    if (!cardRef.current) return;
    const { toPng } = await import("html-to-image");
    const url = await toPng(cardRef.current, { pixelRatio: 1 });
    const a = document.createElement("a"); a.href = url; a.download = "burn-money.png"; a.click();
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-5 pb-8 pt-12">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">your results</h1>
          <p className="text-sm text-text-tertiary">share with the world</p>
        </div>

        {/* Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="mx-auto mb-8 rounded-xl overflow-hidden border border-border" style={{ width: 320, height: 320 }}>
          <div style={{ width: 1080, height: 1080, transform: `scale(${320/1080})`, transformOrigin: "top left", pointerEvents: "none" }}>
            <ShareCardFull state={state} />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { label: "burn", value: `$${burn.toLocaleString()}/mo` },
            { label: "outcome", value: raised ? "raised" : "died" },
            { label: "months", value: String(months) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface p-3 text-center">
              <div className="text-[10px] font-mono text-text-tertiary uppercase">{s.label}</div>
              <div className="text-sm font-mono font-medium text-text-primary">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <button onClick={download} className="w-full py-3 rounded-lg border border-border bg-surface hover:bg-surface-hover text-sm font-medium text-text-primary transition-all cursor-pointer">
            download card
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank")} className="w-full py-3 rounded-lg border border-border bg-surface hover:bg-surface-hover text-sm font-medium text-text-primary transition-all cursor-pointer">
            share on twitter
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} className="w-full py-3 rounded-lg border border-border bg-surface hover:bg-surface-hover text-sm font-medium text-text-primary transition-all cursor-pointer">
            copy link
          </button>
        </div>

        <div className="text-center mt-auto">
          <button onClick={onRestart} className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer hover:bg-accent/90 transition-all">
            try again
          </button>
        </div>
      </div>

      <div style={{ position: "fixed", left: -9999, top: -9999, width: 1080, height: 1080 }} aria-hidden>
        <ShareCardFull ref={cardRef} state={state} />
      </div>
    </div>
  );
}
