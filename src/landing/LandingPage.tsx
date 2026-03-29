import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";

/* ───── Dark Moody Landing: Night Flight Over SF ───── */

const PHASES = [
  { range: [0, 0.3], text: "every founder gets $250K" },
  { range: [0.3, 0.6], text: "most burn through it in 12 months" },
  { range: [0.6, 0.85], text: "some build empires. most crash and burn." },
  { range: [0.85, 1], text: "find your runway", showButton: true },
];

function getPhase(p: number) {
  for (const phase of PHASES) {
    if (p >= phase.range[0] && p < phase.range[1]) return phase;
  }
  return PHASES[PHASES.length - 1];
}

/* ───── Plane SVG ───── */
function PlaneSVG() {
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
      {/* body */}
      <ellipse cx="45" cy="20" rx="38" ry="9" fill="white" />
      {/* cockpit */}
      <path d="M80 20 Q88 16 92 20 Q88 24 80 20Z" fill="#B0C4DE" />
      {/* tail */}
      <path d="M8 20 L2 6 L18 16Z" fill="white" />
      <path d="M5 12 L2 6 L12 10Z" fill="#8B2232" />
      {/* wing */}
      <rect x="32" y="18" width="28" height="4" rx="2" fill="#E0E0E0" />
      {/* windows */}
      <circle cx="55" cy="17" r="2" fill="#7C3AED" opacity="0.7" />
      <circle cx="62" cy="17" r="2" fill="#7C3AED" opacity="0.7" />
      <circle cx="69" cy="17" r="2" fill="#7C3AED" opacity="0.7" />
      {/* propeller */}
      <g className="propeller" style={{ transformOrigin: "93px 20px" }}>
        <rect x="91" y="12" width="4" height="16" rx="2" fill="#CCC" />
      </g>
    </svg>
  );
}

/* ───── Bridge SVG ───── */
function BridgeSVG() {
  return (
    <svg
      width="100%"
      height="200"
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMax meet"
      style={{ display: "block" }}
    >
      {/* deck */}
      <rect x="0" y="140" width="1200" height="8" fill="#8B2232" rx="2" />
      {/* left tower */}
      <rect x="280" y="30" width="16" height="118" fill="#8B2232" rx="3" />
      <rect x="260" y="25" width="56" height="10" fill="#8B2232" rx="2" />
      {/* right tower */}
      <rect x="900" y="30" width="16" height="118" fill="#8B2232" rx="3" />
      <rect x="880" y="25" width="56" height="10" fill="#8B2232" rx="2" />
      {/* main cables */}
      <path
        d="M0 60 Q288 140 288 35 Q288 140 908 35 Q908 140 1200 60"
        stroke="#8B2232"
        strokeWidth="3"
        fill="none"
        opacity="0.8"
      />
      {/* suspender cables */}
      {[320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880].map(
        (x) => (
          <line
            key={x}
            x1={x}
            y1={35 + Math.abs(x - 596) * 0.12}
            x2={x}
            y2={140}
            stroke="#8B2232"
            strokeWidth="1"
            opacity="0.5"
          />
        )
      )}
      {/* road lines */}
      <line x1="100" y1="144" x2="1100" y2="144" stroke="#6B1A28" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ───── Stars ───── */
function Stars({ opacity }: { opacity: number }) {
  const starsRef = useRef<{ x: number; y: number; r: number; twinkle: number }[]>([]);
  if (starsRef.current.length === 0) {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      r: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() * 4 + 2,
    }));
  }
  return (
    <div style={{ position: "absolute", inset: 0, opacity, transition: "opacity 0.6s" }}>
      {starsRef.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: "50%",
            background: "white",
            animation: `twinkle ${s.twinkle}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ───── Money Trail ───── */
function MoneyTrail({ visible }: { visible: boolean }) {
  const items = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      x: 10 + i * 12,
      y: 30 + Math.sin(i) * 15,
      delay: i * 0.3,
      size: 14 + Math.random() * 8,
    }))
  );
  if (!visible) return null;
  return (
    <>
      {items.current.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${m.x}%`,
            top: `${m.y}%`,
            fontSize: m.size,
            color: "#22C55E",
            opacity: 0.6,
            fontWeight: 700,
            animation: `floatUp 3s ease-in-out infinite`,
            animationDelay: `${m.delay}s`,
            pointerEvents: "none",
          }}
        >
          $
        </div>
      ))}
    </>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [planeBounce, setPlaneBounce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(() => {
    setProgress((p) => {
      const next = Math.min(p + 0.2, 1);
      if (next >= 1) {
        setTimeout(() => navigate("/play"), 600);
      }
      return next;
    });
    setPlaneBounce(true);
    setTimeout(() => setPlaneBounce(false), 300);
  }, [navigate]);

  // Keyboard: spacebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance]);

  // Touch / click
  const handleTap = useCallback(() => advance(), [advance]);

  // Scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) advance();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [advance]);

  const phase = getPhase(progress);
  const planeX = 5 + progress * 70; // left 5% → 75%
  const planeY = progress < 0.5
    ? 55 - progress * 60 // descend from 55% to 25%
    : 25 + (progress - 0.5) * 50; // rise back down 25% → 50%
  const starOpacity = Math.min(1, progress * 1.5);
  const bridgeOpacity = progress < 0.15 ? 0.3 + progress * 3 : progress > 0.7 ? 0.4 : 0.7;
  const showMoney = progress >= 0.3 && progress < 0.6;

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none",
        background: `linear-gradient(180deg, #09090B 0%, #0F1A2E 40%, #1A2744 100%)`,
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes cloudDrift {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(110vw); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-18px); opacity: 0.9; }
        }
        @keyframes propSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .propeller {
          animation: propSpin 0.15s linear infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
      `}</style>

      {/* Stars */}
      <Stars opacity={starOpacity} />

      {/* Clouds */}
      {[
        { w: 350, h: 80, top: "8%", blur: 50, dur: 80, delay: 0, opac: 0.04 },
        { w: 500, h: 100, top: "18%", blur: 60, dur: 110, delay: -30, opac: 0.06 },
        { w: 280, h: 60, top: "30%", blur: 40, dur: 70, delay: -50, opac: 0.03 },
        { w: 420, h: 90, top: "45%", blur: 55, dur: 95, delay: -15, opac: 0.05 },
        { w: 600, h: 120, top: "60%", blur: 65, dur: 120, delay: -60, opac: 0.07 },
        { w: 320, h: 70, top: "72%", blur: 45, dur: 85, delay: -40, opac: 0.04 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            width: c.w,
            height: c.h,
            borderRadius: "50%",
            background: `rgba(255,255,255,${c.opac})`,
            filter: `blur(${c.blur}px)`,
            animation: `cloudDrift ${c.dur}s linear infinite`,
            animationDelay: `${c.delay}s`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Fog layer over bridge area */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(15,26,46,0.6) 40%, rgba(6,13,21,0.9) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Bridge */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: 0,
          right: 0,
          opacity: bridgeOpacity,
          filter: "blur(1px)",
          transition: "opacity 0.8s",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <BridgeSVG />
      </div>

      {/* Water */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "10%",
          background: "#060D15",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        {/* Water shimmer lines */}
        {[20, 35, 55, 70, 85].map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: "30%",
              width: 60 + Math.random() * 40,
              height: 1,
              background: "rgba(124,58,237,0.15)",
              animation: `shimmer ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Money trail */}
      <MoneyTrail visible={showMoney} />

      {/* Plane */}
      <div
        style={{
          position: "absolute",
          left: `${planeX}%`,
          top: `${planeY}%`,
          transform: `
            translateX(-50px)
            rotate(${planeBounce ? -12 : progress > 0.5 ? 5 : -3}deg)
            scale(${planeBounce ? 1.1 : 1})
          `,
          transition: "left 0.8s ease, top 0.8s ease, transform 0.3s ease",
          zIndex: 10,
          pointerEvents: "none",
          filter: "drop-shadow(0 0 20px rgba(124,58,237,0.3))",
        }}
      >
        <PlaneSVG />
      </div>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <h1
          key={phase.text}
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            fontWeight: 300,
            letterSpacing: "0.02em",
            lineHeight: 1.3,
            margin: 0,
            padding: "0 2rem",
            textShadow: "0 2px 40px rgba(0,0,0,0.8)",
            animation: "fadeInText 0.6s ease",
          }}
        >
          {phase.text}
        </h1>

        {phase.showButton && progress >= 0.85 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/play");
            }}
            style={{
              marginTop: 32,
              padding: "14px 48px",
              fontSize: "1.1rem",
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: "white",
              background: "#7C3AED",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              pointerEvents: "auto",
              boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 0 60px rgba(124,58,237,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = "scale(1)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 0 40px rgba(124,58,237,0.4)";
            }}
          >
            play the game
          </button>
        )}
      </div>

      {/* Hint text */}
      {progress < 0.2 && (
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.85rem",
              fontWeight: 400,
              letterSpacing: "0.05em",
              margin: 0,
              animation: "twinkle 3s ease-in-out infinite",
            }}
          >
            press space to fly
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress * 100}%`,
          height: 3,
          background: "linear-gradient(90deg, #7C3AED, #9F67FF)",
          transition: "width 0.6s ease",
          zIndex: 30,
          boxShadow: "0 0 12px rgba(124,58,237,0.6)",
        }}
      />

      {/* Fade-in keyframe (injected once) */}
      <style>{`
        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
