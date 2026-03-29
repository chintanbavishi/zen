import { useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import type { GameState } from "../engine/gameState";
import { getMonthlyBurn } from "../engine/gameReducer";
import { STARTING_CASH } from "../engine/constants";

interface Props {
  state: GameState;
  onRestart: () => void;
}

// Full-size capture card (1080x1080) with inline styles for html-to-image compatibility
export const ShareCardFull = forwardRef<HTMLDivElement, { state: GameState }>(
  ({ state }, ref) => {
    const raised = state.outcome === "raised";
    const monthlyBurn = getMonthlyBurn(state);
    const months = state.diedAtMonth ?? 18;
    const selectedLifestyle = state.lifestyle.filter((l) => l.selected).slice(0, 4);
    const founderType = state.founderType ?? "Founder";

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          background: "linear-gradient(135deg, #FFF8F0 0%, #FCE7F3 50%, #EDE9FE 100%)",
          padding: 80,
          fontFamily: "'Clash Display', 'system-ui', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blob decoration */}
        <div style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(236, 72, 153, 0.1)",
          pointerEvents: "none",
        }} />

        {/* Top: outcome badge + header */}
        <div>
          <div style={{
            display: "inline-block",
            background: raised ? "#22C55E" : "#EF4444",
            color: "white",
            padding: "12px 32px",
            borderRadius: 100,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.05em",
            marginBottom: 32,
          }}>
            {raised ? "SERIES A 🚀" : "DEAD 💀"}
          </div>

          <div style={{ fontSize: 64, fontWeight: 800, color: "#1A1A2E", lineHeight: 1.1, marginBottom: 16 }}>
            {raised
              ? `I survived ${months} months on $${(STARTING_CASH / 1000).toFixed(0)}K`
              : `I burned $${(STARTING_CASH / 1000).toFixed(0)}K in ${months} months`
            }
          </div>
          <div style={{ fontSize: 32, color: "#4A4A68", marginBottom: 8 }}>
            {founderType}
          </div>
        </div>

        {/* Middle: key choices */}
        <div>
          <div style={{ fontSize: 24, color: "#9CA3AF", marginBottom: 20, textTransform: "lowercase" }}>
            how i did it:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
            {state.team.filter((t) => t.count > 0).slice(0, 3).map((t) => (
              <div key={t.id} style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: 16,
                padding: "12px 20px",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span>{t.emoji}</span>
                <span style={{ color: "#1A1A2E", fontWeight: 600 }}>x{t.count}</span>
              </div>
            ))}
            {selectedLifestyle.map((l) => (
              <div key={l.id} style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: 16,
                padding: "12px 20px",
                fontSize: 24,
              }}>
                {l.emoji}
              </div>
            ))}
          </div>

          {/* Burn rate stat */}
          <div style={{
            background: "rgba(255,255,255,0.8)",
            borderRadius: 24,
            padding: "28px 40px",
            display: "inline-block",
          }}>
            <div style={{ fontSize: 22, color: "#9CA3AF", textTransform: "lowercase", marginBottom: 8 }}>
              monthly burn rate
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#EF4444", fontFamily: "monospace" }}>
              ${monthlyBurn.toLocaleString()}/mo
            </div>
          </div>
        </div>

        {/* Bottom: CTA */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 28, color: "#4A4A68" }}>
            can you do better?
          </div>
          <div style={{
            background: "linear-gradient(135deg, #F97316, #EC4899)",
            color: "white",
            padding: "16px 40px",
            borderRadius: 100,
            fontSize: 32,
            fontWeight: 700,
          }}>
            burn.money →
          </div>
        </div>
      </div>
    );
  }
);
ShareCardFull.displayName = "ShareCardFull";

export function ScreenShare({ state, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const raised = state.outcome === "raised";
  const monthlyBurn = getMonthlyBurn(state);
  const months = state.diedAtMonth ?? 18;

  const tweetText = raised
    ? `i survived 18 months on $${(STARTING_CASH / 1000).toFixed(0)}K of seed money and raised a Series A. can you do better? → burn.money`
    : `i burned $${(STARTING_CASH / 1000).toFixed(0)}K of seed money in ${months} months. rip. can you do better? → burn.money`;

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 1 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "burn-money-results.png";
      a.click();
    } catch (err) {
      console.error("Failed to capture card:", err);
    }
  }

  function handleTweet() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    } catch {
      alert("Could not copy link.");
    }
  }

  // Visible preview scale factor
  const PREVIEW_WIDTH = 320;
  const SCALE = PREVIEW_WIDTH / 1080;

  return (
    <div className="min-h-dvh flex flex-col items-center px-5 pb-8 pt-16">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-heading mb-2">
            your results
          </h1>
          <p className="text-muted text-sm lowercase">
            share your startup journey with the world
          </p>
        </motion.div>

        {/* Card preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl border-2 border-black/5"
          style={{ width: PREVIEW_WIDTH, height: PREVIEW_WIDTH }}
        >
          {/* Scaled preview using CSS transform */}
          <div style={{
            width: 1080,
            height: 1080,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}>
            <ShareCardFull state={state} />
          </div>
        </motion.div>

        {/* Quick stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 mb-8"
        >
          <div className="bg-card-peach rounded-xl p-3 text-center">
            <p className="text-xs text-muted lowercase">burn rate</p>
            <p className="font-mono font-bold text-heading text-sm">${monthlyBurn.toLocaleString()}/mo</p>
          </div>
          <div className={`${raised ? "bg-card-mint" : "bg-card-pink"} rounded-xl p-3 text-center`}>
            <p className="text-xs text-muted lowercase">outcome</p>
            <p className="font-bold text-heading text-sm">{raised ? "raised 🚀" : "died 💀"}</p>
          </div>
          <div className="bg-card-lavender rounded-xl p-3 text-center">
            <p className="text-xs text-muted lowercase">months</p>
            <p className="font-mono font-bold text-heading text-sm">{months}</p>
          </div>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex flex-col gap-3 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="w-full py-3.5 px-6 rounded-2xl bg-card-lavender font-semibold text-heading text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer border border-black/5"
          >
            <span>⬇️</span> Download Card
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTweet}
            className="w-full py-3.5 px-6 rounded-2xl bg-card-blue font-semibold text-heading text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer border border-black/5"
          >
            <span>𝕏</span> Share on X / Twitter
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className="w-full py-3.5 px-6 rounded-2xl bg-card-mint font-semibold text-heading text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer border border-black/5"
          >
            <span>🔗</span> Copy Link
          </motion.button>
        </motion.div>

        {/* Try again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="px-8 py-3 rounded-full font-display font-semibold text-white text-lg cursor-pointer bg-gradient-to-r from-accent-orange to-accent-pink hover:shadow-lg hover:shadow-accent-pink/25 transition-all"
          >
            try again 🔥
          </motion.button>
          <p className="text-muted text-xs mt-3 lowercase">
            maybe this time you won't buy matching patagonia vests
          </p>
        </motion.div>
      </div>

      {/* Hidden full-size card for image capture */}
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1080,
          height: 1080,
          overflow: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <ShareCardFull ref={cardRef} state={state} />
      </div>
    </div>
  );
}
