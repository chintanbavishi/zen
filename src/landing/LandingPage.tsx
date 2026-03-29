import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   HORIZONTAL PARALLAX LANDING — SF skyline scrolls left as you
   press spacebar. Toy plane flies above. Dark moody overlay.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Plane SVG ─── */
function PlaneSVG() {
  return (
    <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
      <ellipse cx="54" cy="24" rx="42" ry="10" fill="white" />
      <path d="M92 24 Q102 19 106 24 Q102 29 92 24Z" fill="#B0C4DE" />
      <path d="M12 24 L4 8 L22 19Z" fill="white" />
      <path d="M7 14 L4 8 L16 13Z" fill="#C41E3A" />
      <rect x="38" y="22" width="30" height="4" rx="2" fill="#D0D0D0" />
      <circle cx="62" cy="21" r="2.5" fill="#7C3AED" opacity="0.8" />
      <circle cx="70" cy="21" r="2.5" fill="#7C3AED" opacity="0.8" />
      <circle cx="78" cy="21" r="2.5" fill="#7C3AED" opacity="0.8" />
      <g style={{ transformOrigin: "108px 24px", animation: "propSpin 0.12s linear infinite" }}>
        <rect x="106" y="14" width="4" height="20" rx="2" fill="#AAA" />
      </g>
      <text x="42" y="28" fontSize="5" fill="#333" fontFamily="Poppins, sans-serif" fontWeight="600" letterSpacing="0.5">BURN.MONEY</text>
    </svg>
  );
}

/* ─── The wide horizontal scene (drawn as one long SVG strip) ─── */
function SFScene() {
  return (
    <svg
      width="6000"
      height="100%"
      viewBox="0 0 6000 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      style={{ display: "block", position: "absolute", top: 0, left: 0, width: 6000, height: "100%" }}
    >
      {/* ── SKY GRADIENT ── */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#09090B" />
          <stop offset="15%" stopColor="#0C1445" />
          <stop offset="35%" stopColor="#1A2744" />
          <stop offset="50%" stopColor="#2D3A5C" />
          <stop offset="62%" stopColor="#4A5A7A" />
          <stop offset="72%" stopColor="#D4896A" />
          <stop offset="78%" stopColor="#E8A87C" />
          <stop offset="82%" stopColor="#1A2A3A" />
          <stop offset="100%" stopColor="#0A1520" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2A3A" />
          <stop offset="100%" stopColor="#0A1520" />
        </linearGradient>
        <radialGradient id="horizonGlow" cx="50%" cy="70%" r="35%">
          <stop offset="0%" stopColor="#F0C9A0" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#E8A87C" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* sky fill */}
      <rect width="6000" height="1000" fill="url(#sky)" />
      <rect width="6000" height="1000" fill="url(#horizonGlow)" />

      {/* ── STARS ── */}
      {Array.from({ length: 200 }).map((_, i) => (
        <circle
          key={`s${i}`}
          cx={Math.random() * 6000}
          cy={Math.random() * 500}
          r={Math.random() * 1.2 + 0.3}
          fill="white"
          opacity={Math.random() * 0.6 + 0.2}
        />
      ))}

      {/* ── MOON ── */}
      <circle cx="400" cy="150" r="30" fill="#E8E0D0" opacity="0.9" />
      <circle cx="412" cy="143" r="26" fill="#0C1445" />
      <circle cx="400" cy="150" r="80" fill="url(#moonGlow)" />

      {/* ── DISTANT HILLS (across full width) ── */}
      <path d="M0 680 Q300 620 600 660 Q900 610 1200 650 Q1500 600 1800 640 Q2100 590 2400 630 Q2700 600 3000 650 Q3300 620 3600 640 Q3900 600 4200 630 Q4500 610 4800 650 Q5100 630 5400 640 Q5700 610 6000 660 L6000 750 L0 750Z" fill="#1A2030" opacity="0.6" />

      {/* ── SF CITY SKYLINE (section 1: 600-2000) ── */}
      {[650,700,760,820,870,920,980,1040,1090,1150,1220,1280,1350,1420,1480,1550,1610,1680,1750,1820,1890,1960].map((x, i) => {
        const h = 50 + Math.sin(i * 1.7) * 40 + (i % 4) * 15;
        return <rect key={`bld${i}`} x={x} y={720 - h} width={20 + (i % 3) * 6} height={h} fill="#111822" rx="1" />;
      })}
      {Array.from({ length: 120 }).map((_, i) => (
        <rect key={`win${i}`} x={660 + Math.random() * 1300} y={640 + Math.random() * 70} width="3" height="3" fill="#F0C060" opacity={Math.random() * 0.7 + 0.2} rx="0.5" />
      ))}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── GOLDEN GATE BRIDGE — THE HERO (section 2: 2200-4200) ── */}
      {/* ══════════════════════════════════════════════════════════ */}

      {/* Approach road left */}
      <rect x="2100" y="700" width="200" height="8" fill="#6B1828" rx="1" opacity="0.5" />

      {/* Main deck */}
      <rect x="2300" y="695" width="1800" height="10" fill="#A52A3A" rx="2" />
      <rect x="2300" y="705" width="1800" height="5" fill="#7B1E2E" rx="1" />

      {/* Road surface detail */}
      <line x1="2300" y1="700" x2="4100" y2="700" stroke="#C43A4A" strokeWidth="1" opacity="0.3" />

      {/* Approach road right */}
      <rect x="4100" y="700" width="200" height="8" fill="#6B1828" rx="1" opacity="0.5" />

      {/* LEFT TOWER — detailed */}
      <rect x="2700" y="430" width="16" height="275" fill="#A52A3A" />
      <rect x="2724" y="430" width="16" height="275" fill="#A52A3A" />
      {/* Cross-braces */}
      {[470, 510, 550, 590, 630, 670].map(y => (
        <rect key={`lbr${y}`} x="2716" y={y} width="8" height="4" fill="#8B2232" rx="1" />
      ))}
      {/* Tower cap */}
      <rect x="2692" y="422" width="56" height="14" fill="#B83A4A" rx="3" />
      <rect x="2698" y="416" width="44" height="10" fill="#C44A5A" rx="2" />

      {/* RIGHT TOWER — detailed */}
      <rect x="3660" y="430" width="16" height="275" fill="#A52A3A" />
      <rect x="3684" y="430" width="16" height="275" fill="#A52A3A" />
      {[470, 510, 550, 590, 630, 670].map(y => (
        <rect key={`rbr${y}`} x="3676" y={y} width="8" height="4" fill="#8B2232" rx="1" />
      ))}
      <rect x="3652" y="422" width="56" height="14" fill="#B83A4A" rx="3" />
      <rect x="3658" y="416" width="44" height="10" fill="#C44A5A" rx="2" />

      {/* MAIN CABLES (thick) */}
      <path d="M2200 600 C2450 680 2680 435 2720 430" stroke="#A52A3A" strokeWidth="6" fill="none" />
      <path d="M2720 430 C2850 680 3530 680 3680 430" stroke="#A52A3A" strokeWidth="6" fill="none" />
      <path d="M3680 430 C3720 435 3950 680 4200 600" stroke="#A52A3A" strokeWidth="6" fill="none" />

      {/* SUSPENDER CABLES (many thin lines) */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = 2750 + i * 24;
        const t = (x - 2720) / (3680 - 2720);
        const cableY = 430 + Math.sin(t * Math.PI) * 250;
        return <line key={`sc${i}`} x1={x} y1={Math.min(cableY, 690)} x2={x} y2={695} stroke="#A52A3A" strokeWidth="1.5" opacity="0.4" />;
      })}

      {/* Tower top lights (red beacons) */}
      <circle cx="2720" cy="413" r="5" fill="#FF3333" opacity="1" />
      <circle cx="3680" cy="413" r="5" fill="#FF3333" opacity="1" />
      {/* Light glow */}
      <circle cx="2720" cy="413" r="20" fill="#FF3333" opacity="0.12" />
      <circle cx="3680" cy="413" r="20" fill="#FF3333" opacity="0.12" />
      <circle cx="2720" cy="413" r="40" fill="#FF3333" opacity="0.05" />
      <circle cx="3680" cy="413" r="40" fill="#FF3333" opacity="0.05" />

      {/* ── HILLS & TREES after bridge (section 3: 4400-6000) ── */}
      <path d="M4400 720 Q4600 670 4800 700 Q5000 660 5200 690 Q5400 650 5600 685 Q5800 665 6000 700 L6000 750 L4400 750Z" fill="#151C28" opacity="0.5" />
      {[4500,4700,4900,5100,5300,5500,5700,5850].map((x, i) => (
        <polygon key={`tree${i}`} points={`${x},720 ${x-12},720 ${x-6},${695 - i % 3 * 8}`} fill="#1A2530" opacity="0.4" />
      ))}

      {/* ── WATER ── */}
      <rect x="0" y="720" width="6000" height="280" fill="url(#water)" />

      {/* Water reflections */}
      {Array.from({ length: 60 }).map((_, i) => (
        <rect key={`wr${i}`} x={Math.random() * 6000} y={730 + Math.random() * 100} width={30 + Math.random() * 60} height="1" fill="white" opacity={Math.random() * 0.03 + 0.01} rx="1" />
      ))}

      {/* Bridge water reflection */}
      <rect x="2300" y="720" width="1800" height="80" fill="#8B2232" opacity="0.04" />
      {/* Tower reflections */}
      <rect x="2705" y="720" width="40" height="60" fill="#8B2232" opacity="0.03" />
      <rect x="3665" y="720" width="40" height="60" fill="#8B2232" opacity="0.03" />
    </svg>
  );
}

/* ─── Background music ─── */
let audioEl: HTMLAudioElement | null = null;
let musicReady = false;

const LOOP_START = 290; // 4:50
const LOOP_END = 372;   // 6:12

function initMusic() {
  if (audioEl) return;
  audioEl = document.createElement("audio");
  audioEl.src = "/welcome-to-sf.mp3";
  audioEl.volume = 0.8;
  audioEl.preload = "auto";

  audioEl.addEventListener("canplay", () => {
    if (!musicReady) {
      musicReady = true;
      audioEl!.currentTime = LOOP_START;
      playMusic();
    }
  });

  audioEl.addEventListener("timeupdate", () => {
    if (audioEl && audioEl.currentTime >= LOOP_END) {
      audioEl.currentTime = LOOP_START;
    }
  });

  audioEl.load();
}

function playMusic() {
  if (!audioEl) return;
  audioEl.play().catch(() => {
    // Autoplay blocked — will retry on user interaction
  });
}

function fadeOutMusic() {
  if (!audioEl) return;
  const el = audioEl;
  const fade = setInterval(() => {
    if (el.volume > 0.05) {
      el.volume = Math.max(0, el.volume - 0.05);
    } else {
      el.pause();
      clearInterval(fade);
    }
  }, 80);
}


/* ═══════════ MAIN COMPONENT ═══════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0); // 0 to 5 presses
  const [bounce, setBounce] = useState(false);
  const done = progress >= 5;
  const [showCTA, setShowCTA] = useState(false);

  // Init audio on mount, play on any interaction if autoplay blocked
  useEffect(() => {
    initMusic();
    const retry = () => playMusic();
    window.addEventListener("click", retry);
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry);
    return () => {
      window.removeEventListener("click", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
    };
  }, []);

  const advance = useCallback(() => {
    if (done) return;
    setProgress(p => {
      const next = p + 1;
      if (next >= 5) {
        setTimeout(() => setShowCTA(true), 800);
        fadeOutMusic();
      }
      return next;
    });
    setBounce(true);
    setTimeout(() => setBounce(false), 350);
  }, [done]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance]);

  // Scene is 6000px. Max scroll = 6000 - viewport width so we never see black.
  const maxScroll = Math.max(0, 6000 - (typeof window !== "undefined" ? window.innerWidth : 1400));
  const sceneX = (progress / 5) * maxScroll;
  // Plane bobs gently and hops on press
  const planeBaseY = 28 + Math.sin(progress * 0.8) * 4;

  const texts = [
    "press space to fly",
    "every founder gets $250K",
    "the clock starts ticking",
    "some build empires",
    "most crash and burn",
    "",
  ];

  return (
    <div
      onClick={!done ? advance : undefined}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        cursor: done ? "default" : "pointer",
        background: "#09090B",
        fontFamily: "'Poppins', system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes propSpin { to { transform: rotate(360deg); } }
        @keyframes bobFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(124,58,237,0.4); }
          50% { box-shadow: 0 0 70px rgba(124,58,237,0.6); }
        }
      `}</style>

      {/* ── HORIZONTAL SCROLLING SCENE ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 6000,
        height: "100%",
        transform: `translateX(-${sceneX}px)`,
        transition: "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        willChange: "transform",
      }}>
        <SFScene />
      </div>

      {/* ── DARK OVERLAY (60-70% opacity) ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(9, 9, 11, 0.65)",
        pointerEvents: "none",
      }} />

      {/* ── FOG LAYERS ── */}
      {[
        { bottom: "5%", height: "25%", opacity: 0.08, blur: 60, dur: 90 },
        { bottom: "15%", height: "20%", opacity: 0.05, blur: 50, dur: 120 },
        { bottom: "30%", height: "15%", opacity: 0.04, blur: 40, dur: 75 },
      ].map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: f.bottom,
            left: "-10%",
            width: "120%",
            height: f.height,
            background: `rgba(255,255,255,${f.opacity})`,
            filter: `blur(${f.blur}px)`,
            animation: `fogDrift${i} ${f.dur}s ease-in-out infinite alternate`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        />
      ))}
      <style>{`
        @keyframes fogDrift0 { from { transform: translateX(-3%); } to { transform: translateX(3%); } }
        @keyframes fogDrift1 { from { transform: translateX(2%); } to { transform: translateX(-2%); } }
        @keyframes fogDrift2 { from { transform: translateX(-1%); } to { transform: translateX(1%); } }
      `}</style>

      {/* ── PLANE (fixed position, center-upper) ── */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: `${planeBaseY}%`,
        transform: `translateX(-60px) rotate(${bounce ? -10 : 0}deg) scale(${bounce ? 1.08 : 1})`,
        transition: "top 1s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: done ? "none" : "bobFloat 3s ease-in-out infinite",
        zIndex: 20,
        pointerEvents: "none",
        filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))",
      }}>
        <PlaneSVG />
      </div>

      {/* ── MONEY TRAIL ── */}
      {progress >= 2 && progress < 5 && (
        <div style={{ position: "absolute", left: "42%", top: `${planeBaseY + 3}%`, zIndex: 19, pointerEvents: "none" }}>
          {[0,1,2,3,4].map(i => (
            <span key={i} style={{
              position: "absolute",
              left: -20 - i * 18,
              top: i * 6,
              color: "#22C55E",
              fontSize: 14 - i,
              fontWeight: 700,
              opacity: 0.7 - i * 0.12,
              animation: `fadeUp 2s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}>$</span>
          ))}
        </div>
      )}

      {/* ── PHASE TEXT ── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        textAlign: "center",
        transform: "translateY(-50%)",
        zIndex: 25,
        pointerEvents: "none",
      }}>
        {!done && (
          <h1
            key={progress}
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "clamp(1.2rem, 3.5vw, 2.5rem)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              margin: 0,
              padding: "0 2rem",
              textShadow: "0 2px 30px rgba(0,0,0,0.8)",
              animation: "fadeUp 0.6s ease",
            }}
          >
            {texts[progress]}
          </h1>
        )}

        {showCTA && (
          <div style={{ animation: "fadeUp 0.8s ease" }}>
            <h1 style={{
              color: "rgba(255,255,255,0.92)",
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              margin: "0 0 28px 0",
              textShadow: "0 2px 40px rgba(0,0,0,0.8)",
            }}>
              find your runway
            </h1>
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/play"); }}
              style={{
                padding: "14px 48px",
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: "'Poppins', system-ui, sans-serif",
                color: "white",
                background: "#7C3AED",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                pointerEvents: "auto",
                animation: "glowPulse 2s ease-in-out infinite",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              play burn.money →
            </button>
          </div>
        )}
      </div>

      {/* ── PROGRESS BAR (5 segments) ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        display: "flex",
        gap: 2,
        zIndex: 30,
      }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1,
            background: i < progress ? "#7C3AED" : "rgba(255,255,255,0.06)",
            transition: "background 0.6s ease",
            boxShadow: i < progress ? "0 0 8px rgba(124,58,237,0.5)" : "none",
          }} />
        ))}
      </div>

      {/* ── HINT ── */}
      {progress === 0 && (
        <div style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 25,
          pointerEvents: "none",
          animation: "fadeUp 1s ease",
        }}>
          <span style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
          }}>
            press space or tap to begin
          </span>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
