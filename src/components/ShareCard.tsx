import { forwardRef } from "react";
import type { GameState } from "../engine/gameState";

interface Props {
  state: GameState;
}

const choiceIcon: Record<string, string> = {
  b2b: "🏢",
  b2c: "📱",
  cto_friend: "👯",
  senior: "🧓",
  offshore: "🌏",
  solo: "🧑‍💻",
  apartment: "🏠",
  wework: "☕",
  real_office: "🏗️",
  bangalore: "✈️",
};

const choiceLabel: Record<string, string> = {
  b2b: "B2B",
  b2c: "B2C",
  cto_friend: "CTO friend",
  senior: "senior dev",
  offshore: "offshore team",
  solo: "solo founder",
  apartment: "apartment",
  wework: "WeWork",
  real_office: "real office",
  bangalore: "bangalore",
};

export const ShareCard = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const survived = state.outcome === "raised";
  const isB2B = state.businessType === "b2b";

  const primaryLabel = isB2B ? "ARR" : "MAU";
  const primaryValue = isB2B
    ? `$${(state.arr / 1000).toFixed(0)}K`
    : `${(state.mau / 1000).toFixed(1)}K`;

  const businessIcon = choiceIcon[state.businessType ?? "b2c"];
  const businessLbl = choiceLabel[state.businessType ?? "b2c"];
  const teamIcon = choiceIcon[state.teamChoice ?? "solo"];
  const teamLbl = choiceLabel[state.teamChoice ?? "solo"];
  const officeIcon = choiceIcon[state.officeChoice ?? "apartment"];
  const officeLbl = choiceLabel[state.officeChoice ?? "apartment"];

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        fontFamily: "system-ui, -apple-system, sans-serif",
        gap: 40,
      }}
    >
      {/* Header */}
      <p
        style={{
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          fontSize: 24,
          margin: 0,
        }}
      >
        burn.money
      </p>

      {/* Main outcome */}
      <p
        style={{
          fontSize: 128,
          fontWeight: 700,
          margin: 0,
          color: survived ? "#4ade80" : "#f87171",
          lineHeight: 1,
        }}
      >
        {survived ? "survived" : "died"}
      </p>

      {/* Tagline */}
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 32,
          margin: 0,
          textAlign: "center",
        }}
      >
        {survived
          ? "$4M series A. 18 months of runway starts now."
          : "sent the 'we're shutting down' blog post. 4 people read it."}
      </p>

      {/* Choice icons */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginTop: 20,
        }}
      >
        {[
          { icon: businessIcon, label: businessLbl },
          { icon: teamIcon, label: teamLbl },
          { icon: officeIcon, label: officeLbl },
        ].map(({ icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 48 }}>{icon}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 20,
        }}
      >
        {[
          { label: primaryLabel, value: primaryValue, color: "#4ade80" },
          { label: "MoM growth", value: `${state.momGrowth.toFixed(1)}%`, color: "#fbbf24" },
          { label: "burn/mo", value: `$${(state.monthlyBurn / 1000).toFixed(0)}K`, color: "#f87171" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: "24px 40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              minWidth: 200,
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p
        style={{
          color: "rgba(255,255,255,0.2)",
          fontSize: 20,
          margin: 0,
          marginTop: 20,
        }}
      >
        can you do better? burn.money
      </p>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
