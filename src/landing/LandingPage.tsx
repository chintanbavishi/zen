import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        margin: 0,
        padding: 0,
        background: `linear-gradient(
          to bottom,
          #1a1a3e 0%,
          #2d2b55 25%,
          #5c4a6e 40%,
          #8b6a8a 55%,
          #e8a87c 68%,
          #f0c9a0 75%,
          #1a2a3a 85%,
          #0f1f2f 100%
        )`,
        fontFamily: "'Outfit', sans-serif",
        cursor: "default",
        userSelect: "none",
      }}
      className="landing-scene"
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Outfit:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Horizon glow */}
      <div
        style={{
          position: "absolute",
          bottom: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120%",
          height: "40%",
          background:
            "radial-gradient(ellipse at center, rgba(240,201,160,0.6) 0%, rgba(232,168,124,0.3) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Golden Gate Bridge SVG */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "65%",
          maxWidth: 900,
          pointerEvents: "none",
          filter: "blur(0.5px)",
          zIndex: 2,
        }}
      >
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="xMidYMax meet"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Deck */}
          <rect x="50" y="220" width="900" height="6" fill="#2a2a3a" />

          {/* Left tower */}
          <polygon
            points="280,40 290,40 294,220 276,220"
            fill="#2a2a3a"
          />
          <polygon
            points="300,40 310,40 314,220 296,220"
            fill="#2a2a3a"
          />
          <rect x="275" y="40" width="40" height="5" fill="#2a2a3a" />
          <rect x="275" y="100" width="40" height="4" fill="#2a2a3a" />
          <rect x="275" y="155" width="40" height="4" fill="#2a2a3a" />

          {/* Right tower */}
          <polygon
            points="690,40 700,40 704,220 686,220"
            fill="#2a2a3a"
          />
          <polygon
            points="710,40 720,40 724,220 706,220"
            fill="#2a2a3a"
          />
          <rect x="685" y="40" width="40" height="5" fill="#2a2a3a" />
          <rect x="685" y="100" width="40" height="4" fill="#2a2a3a" />
          <rect x="685" y="155" width="40" height="4" fill="#2a2a3a" />

          {/* Main cable - left side approach */}
          <path
            d="M50,120 Q165,180 295,42"
            stroke="#2a2a3a"
            strokeWidth="3"
            fill="none"
          />
          {/* Main cable - center span */}
          <path
            d="M295,42 Q500,200 705,42"
            stroke="#2a2a3a"
            strokeWidth="3"
            fill="none"
          />
          {/* Main cable - right side approach */}
          <path
            d="M705,42 Q835,180 950,120"
            stroke="#2a2a3a"
            strokeWidth="3"
            fill="none"
          />

          {/* Suspender cables - left approach */}
          {[120, 170, 220].map((x) => {
            const t = (x - 50) / (295 - 50);
            const adjustedCy = 120 * (1 - t) * (1 - t) + 180 * 2 * t * (1 - t) + 42 * t * t;
            return (
              <line
                key={`la${x}`}
                x1={x}
                y1={adjustedCy}
                x2={x}
                y2={220}
                stroke="#2a2a3a"
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}

          {/* Suspender cables - center span */}
          {[340, 380, 420, 460, 500, 540, 580, 620, 660].map((x) => {
            const t = (x - 295) / (705 - 295);
            const cy = 42 * (1 - t) * (1 - t) + 200 * 2 * t * (1 - t) + 42 * t * t;
            return (
              <line
                key={`cs${x}`}
                x1={x}
                y1={cy}
                x2={x}
                y2={220}
                stroke="#2a2a3a"
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}

          {/* Suspender cables - right approach */}
          {[780, 830, 880].map((x) => {
            const t = (x - 705) / (950 - 705);
            const adjustedCy = 42 * (1 - t) * (1 - t) + 180 * 2 * t * (1 - t) + 120 * t * t;
            return (
              <line
                key={`ra${x}`}
                x1={x}
                y1={adjustedCy}
                x2={x}
                y2={220}
                stroke="#2a2a3a"
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}
        </svg>
      </div>

      {/* Fog Layer 1 - lowest, heaviest */}
      <div
        className="fog-layer fog-1"
        style={{
          position: "absolute",
          bottom: "25%",
          left: 0,
          right: 0,
          height: "30%",
          background:
            "linear-gradient(to top, rgba(255,248,240,0.45), transparent)",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 3,
        }}
      />

      {/* Fog Layer 2 - mid */}
      <div
        className="fog-layer fog-2"
        style={{
          position: "absolute",
          bottom: "35%",
          left: 0,
          right: 0,
          height: "25%",
          background:
            "linear-gradient(to top, rgba(255,248,240,0.25), transparent)",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 3,
        }}
      />

      {/* Fog Layer 3 - upper wisps */}
      <div
        className="fog-layer fog-3"
        style={{
          position: "absolute",
          bottom: "45%",
          left: 0,
          right: 0,
          height: "20%",
          background:
            "linear-gradient(to top, rgba(200,185,210,0.2), transparent)",
          filter: "blur(20px)",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 3,
        }}
      />

      {/* Fog Layer 4 - top haze */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(to bottom, rgba(26,26,62,0.3), transparent)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Water */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "linear-gradient(to bottom, #1a2a3a, #0f1a2a)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {/* Water shimmer line */}
        <div
          className="water-shimmer"
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(240,201,160,0.3), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Grain overlay */}
      <div className="grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4 }} />

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "28vh",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {/* Subtitle */}
        <p
          className="entrance-subtitle"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
            color: "rgba(250,245,239,0.6)",
            letterSpacing: "0.05em",
            margin: "0 0 1.2rem 0",
            padding: "0 1rem",
            textAlign: "center",
          }}
        >
          y combinator just wired you $250,000
        </p>

        {/* Title */}
        <h1
          className="entrance-title"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: "clamp(2.2rem, 7vw, 5rem)",
            color: "#faf5ef",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textShadow: "0 0 60px rgba(232,168,124,0.3)",
            margin: 0,
            padding: "0 1rem",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          BURN.MONEY
        </h1>

        {/* CTA */}
        <button
          className="entrance-cta"
          onClick={() => navigate("/play")}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
            color: "#faf5ef",
            background: "transparent",
            border: "1px solid rgba(250,245,239,0.3)",
            borderRadius: 9999,
            padding: "0.75rem 2rem",
            cursor: "pointer",
            letterSpacing: "0.06em",
            marginTop: "2.5rem",
            pointerEvents: "auto",
            transition: "background 0.3s, border-color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,168,124,0.2)";
            e.currentTarget.style.borderColor = "rgba(250,245,239,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(250,245,239,0.3)";
          }}
        >
          find your runway
        </button>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fogDrift1 {
          0% { transform: translateX(-5%); }
          100% { transform: translateX(5%); }
        }
        @keyframes fogDrift2 {
          0% { transform: translateX(3%); }
          100% { transform: translateX(-3%); }
        }
        @keyframes fogDrift3 {
          0% { transform: translateX(-4%); opacity: 0.8; }
          100% { transform: translateX(4%); opacity: 1; }
        }
        @keyframes waterShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeInScene {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInTitle {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSubtitle {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInCta {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .landing-scene {
          animation: fadeInScene 1.5s ease-out both;
        }
        .fog-1 {
          animation: fogDrift1 80s ease-in-out infinite alternate;
        }
        .fog-2 {
          animation: fogDrift2 100s ease-in-out infinite alternate-reverse;
        }
        .fog-3 {
          animation: fogDrift3 120s ease-in-out infinite alternate;
        }
        .water-shimmer {
          animation: waterShimmer 4s ease-in-out infinite;
        }
        .entrance-title {
          opacity: 0;
          animation: fadeInTitle 1s ease-out 0.5s both;
        }
        .entrance-subtitle {
          opacity: 0;
          animation: fadeInSubtitle 1s ease-out 0.8s both;
        }
        .entrance-cta {
          opacity: 0;
          animation: fadeInCta 1s ease-out 1.2s both;
        }
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }

        @media (max-width: 640px) {
          .fog-3 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
