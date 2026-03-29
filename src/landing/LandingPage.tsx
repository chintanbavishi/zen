import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function multiLerp(colors: string[], t: number): string {
  if (t <= 0) return colors[0];
  if (t >= 1) return colors[colors.length - 1];
  const seg = (colors.length - 1) * t;
  const i = Math.floor(seg);
  const local = seg - i;
  return lerpColor(colors[i], colors[Math.min(i + 1, colors.length - 1)], local);
}

/* ------------------------------------------------------------------ */
/*  SVG sub-components                                                 */
/* ------------------------------------------------------------------ */

function Plane({ nightFactor, landed }: { nightFactor: number; landed: boolean }) {
  const windowGlow = `rgba(255,220,80,${0.15 + nightFactor * 0.85})`;
  return (
    <svg
      width="120"
      height="50"
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {/* propeller */}
      <g
        style={{
          transformOrigin: "8px 22px",
          animation: landed ? "none" : "spin 0.15s linear infinite",
        }}
      >
        <rect x="5" y="14" width="6" height="2" rx="1" fill="#666" />
        <rect x="5" y="28" width="6" height="2" rx="1" fill="#666" />
      </g>
      {/* fuselage */}
      <ellipse cx="55" cy="23" rx="48" ry="14" fill="#F0F0F0" />
      <ellipse cx="55" cy="23" rx="48" ry="14" fill="url(#fuselageGrad)" />
      {/* text */}
      <text
        x="55"
        y="27"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#1a1a2e"
        letterSpacing="0.5"
      >
        BURN.MONEY
      </text>
      {/* windows */}
      {[30, 40, 50, 60, 70, 78].map((cx) => (
        <circle key={cx} cx={cx} cy="17" r="2.2" fill={windowGlow} stroke="#ccc" strokeWidth="0.5" />
      ))}
      {/* wing top */}
      <path d="M40 15 L30 2 L70 2 L60 15" fill="#D0D0D0" stroke="#bbb" strokeWidth="0.5" />
      {/* wing bottom */}
      <path d="M40 31 L30 44 L70 44 L60 31" fill="#D0D0D0" stroke="#bbb" strokeWidth="0.5" />
      {/* tail fin */}
      <path d="M98 23 L112 8 L115 10 L104 23" fill="#FF6B35" />
      <path d="M98 23 L112 38 L115 36 L104 23" fill="#C41E3A" />
      {/* nose cone */}
      <ellipse cx="9" cy="23" rx="5" ry="8" fill="#E0E0E0" />
      <defs>
        <linearGradient id="fuselageGrad" x1="55" y1="9" x2="55" y2="37">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GoldenGateBridge({ nightFactor }: { nightFactor: number }) {
  const bridgeColor = nightFactor > 0.5 ? "#1a0a0a" : "#C41E3A";
  const lightOpacity = nightFactor;
  return (
    <svg
      viewBox="0 0 800 200"
      style={{ width: "100%", height: "100%", position: "absolute", bottom: 0 }}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* deck */}
      <rect x="80" y="140" width="640" height="8" fill={bridgeColor} />
      {/* tower left */}
      <rect x="200" y="30" width="16" height="118" fill={bridgeColor} />
      <rect x="196" y="30" width="24" height="6" fill={bridgeColor} />
      {/* tower right */}
      <rect x="584" y="30" width="16" height="118" fill={bridgeColor} />
      <rect x="580" y="30" width="24" height="6" fill={bridgeColor} />
      {/* main cables */}
      <path
        d="M80 80 Q 208 10, 208 33 Q 208 10, 400 90 Q 592 10, 592 33 Q 592 10, 720 80"
        stroke={bridgeColor}
        strokeWidth="3"
        fill="none"
      />
      {/* suspender cables left */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 220 + i * 45;
        const cableTop = 33 + Math.abs(i - 3.5) * 6;
        return (
          <line key={`sl${i}`} x1={x} y1={cableTop} x2={x} y2="140" stroke={bridgeColor} strokeWidth="1" />
        );
      })}
      {/* suspender cables right */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 600 - i * 45 + 220 - 200;
        const cableTop = 33 + Math.abs(i - 3.5) * 6;
        return (
          <line key={`sr${i}`} x1={x} y1={cableTop} x2={x} y2="140" stroke={bridgeColor} strokeWidth="1" />
        );
      })}
      {/* tower lights at night */}
      <circle cx="208" cy="30" r="4" fill="#FF3030" opacity={lightOpacity} />
      <circle cx="592" cy="30" r="4" fill="#FF3030" opacity={lightOpacity} />
    </svg>
  );
}

function Cloud({ size, top, speed, delay }: { size: number; top: string; speed: number; delay: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        right: "-200px",
        width: size,
        height: size * 0.45,
        opacity: 0.85,
        animation: `cloudDrift ${speed}s linear ${delay}s infinite`,
        willChange: "transform",
      }}
    >
      <svg viewBox="0 0 200 90" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="70" cy="60" rx="60" ry="28" fill="white" opacity="0.9" />
        <ellipse cx="110" cy="50" rx="50" ry="32" fill="white" opacity="0.95" />
        <ellipse cx="140" cy="62" rx="45" ry="24" fill="white" opacity="0.85" />
        <ellipse cx="90" cy="42" rx="35" ry="25" fill="white" />
      </svg>
    </div>
  );
}

function Stars({ opacity }: { opacity: number }) {
  const stars = useRef(
    Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
    }))
  );
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {stars.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            backgroundColor: "white",
            animation: `twinkle 2s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function Moon({ opacity }: { opacity: number }) {
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        right: "12%",
        width: 60,
        height: 60,
        opacity,
        transition: "opacity 0.3s",
      }}
    >
      <svg viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="25" fill="#F5F5DC" />
        <circle cx="40" cy="25" r="20" fill="currentColor" className="text-transparent" />
      </svg>
    </div>
  );
}

function CityLights({ opacity }: { opacity: number }) {
  const lights = useRef(
    Array.from({ length: 40 }, () => ({
      x: 10 + Math.random() * 80,
      y: 75 + Math.random() * 8,
      size: 1.5 + Math.random() * 2,
      delay: Math.random() * 4,
      color: Math.random() > 0.7 ? "#F59E0B" : "#FEFCE8",
    }))
  );
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {lights.current.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${l.x}%`,
            top: `${l.y}%`,
            width: l.size,
            height: l.size,
            borderRadius: "50%",
            backgroundColor: l.color,
            animation: `twinkle 3s ease-in-out ${l.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function Runway({ opacity }: { opacity: number }) {
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "18%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
        maxWidth: 500,
        height: 16,
        opacity,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundImage:
            "repeating-linear-gradient(90deg, #fff 0px, #fff 20px, transparent 20px, transparent 35px)",
          marginBottom: 10,
        }}
      />
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundImage:
            "repeating-linear-gradient(90deg, #fff 0px, #fff 20px, transparent 20px, transparent 35px)",
        }}
      />
    </div>
  );
}

function MoneyTrail({ count, opacity }: { count: number; opacity: number }) {
  if (count <= 0 || opacity <= 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: -20 - i * 18,
            top: 10 + Math.sin(i * 1.2) * 15,
            color: "#22C55E",
            fontWeight: 700,
            fontSize: 14 + Math.random() * 6,
            opacity: opacity * (0.3 + 0.7 * (1 - i / count)),
            animation: `moneyFall 1.8s ease-in ${i * 0.12}s infinite`,
            pointerEvents: "none",
          }}
        >
          $
        </span>
      ))}
    </>
  );
}

function Hills({ nightFactor }: { nightFactor: number }) {
  const c1 = nightFactor > 0.5 ? "#0a1a0a" : "#2D5F2D";
  const c2 = nightFactor > 0.5 ? "#0d1f0d" : "#3A7A3A";
  return (
    <svg
      viewBox="0 0 800 120"
      style={{ position: "absolute", bottom: 0, width: "100%", height: "15%" }}
      preserveAspectRatio="none"
    >
      <path d="M0 120 Q100 40,200 80 Q350 20,500 70 Q650 30,800 60 L800 120Z" fill={c1} />
      <path d="M0 120 Q150 60,300 90 Q500 50,700 80 L800 100 L800 120Z" fill={c2} />
    </svg>
  );
}

function Water({ nightFactor }: { nightFactor: number }) {
  const color = nightFactor > 0.5 ? "#0a1525" : "#2980B9";
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "8%",
        background: color,
        overflow: "hidden",
        transition: "background 0.8s",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent 100%)`,
          animation: "waveShift 4s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}

function Sun({ progress }: { progress: number }) {
  // visible from 0.3 to 0.65
  if (progress < 0.3 || progress > 0.65) return null;
  const t = (progress - 0.3) / 0.35;
  const y = 30 + t * 70; // sinks
  const o = 1 - t;
  return (
    <div
      style={{
        position: "absolute",
        left: "20%",
        top: `${y}%`,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "radial-gradient(circle, #FDB813 30%, #FF6B35 100%)",
        opacity: o,
        filter: "blur(2px)",
        pointerEvents: "none",
      }}
    />
  );
}

function Skyline({ nightFactor }: { nightFactor: number }) {
  const color = nightFactor > 0.5 ? "#0d0d1a" : "#4A4A5A";
  const buildings = useRef([
    { x: 10, w: 3, h: 18 },
    { x: 15, w: 2.5, h: 14 },
    { x: 19, w: 4, h: 22 },
    { x: 25, w: 2, h: 12 },
    { x: 29, w: 3.5, h: 20 },
    { x: 34, w: 2, h: 16 },
    { x: 38, w: 3, h: 24 },
    { x: 43, w: 2.5, h: 11 },
    { x: 47, w: 4, h: 19 },
    { x: 53, w: 2, h: 15 },
    { x: 57, w: 3, h: 21 },
    { x: 62, w: 2.5, h: 13 },
    { x: 67, w: 3.5, h: 25 },
    { x: 72, w: 2, h: 17 },
    { x: 76, w: 3, h: 14 },
    { x: 80, w: 2.5, h: 20 },
    { x: 85, w: 3, h: 16 },
    { x: 89, w: 2, h: 12 },
  ]);
  return (
    <div style={{ position: "absolute", bottom: "8%", width: "100%", height: "25%", pointerEvents: "none" }}>
      {buildings.current.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            bottom: 0,
            width: `${b.w}%`,
            height: `${b.h}%`,
            backgroundColor: color,
            transition: "background-color 0.8s",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase text data                                                    */
/* ------------------------------------------------------------------ */

const PHASES = [
  { center: 0.1, text: "every founder gets $250K" },
  { center: 0.3, text: "most burn through it in 12 months" },
  { center: 0.5, text: "some build empires" },
  { center: 0.7, text: "most crash and burn" },
  { center: 0.9, text: "" }, // CTA phase — handled separately
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const rafRef = useRef(0);
  const targetRef = useRef(0);
  const navigate = useNavigate();

  const ease = useCallback(() => {
    const diff = targetRef.current - progressRef.current;
    if (Math.abs(diff) < 0.001) {
      progressRef.current = targetRef.current;
      setProgress(targetRef.current);
      return;
    }
    progressRef.current += diff * 0.08;
    setProgress(progressRef.current);
    rafRef.current = requestAnimationFrame(ease);
  }, []);

  const advance = useCallback(
    (delta: number) => {
      targetRef.current = Math.max(0, Math.min(1, targetRef.current + delta));
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(ease);
    },
    [ease]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      advance(e.deltaY * 0.0008);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        advance(0.15);
      }
      if (e.code === "ArrowDown") advance(0.05);
      if (e.code === "ArrowUp") advance(-0.05);
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      advance(dy * 0.002);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [advance]);

  /* derived values */
  const skyColors = [
    "#FDB813", // 0 dawn gold
    "#87CEEB", // 0.2 blue sky
    "#4A90D9", // 0.4 midday
    "#C62368", // 0.5 sunset
    "#2D1B69", // 0.6
    "#0C0E1A", // 0.7 night
    "#1A1A2E", // 0.8
    "#2D1B69", // 0.9 pre-dawn
    "#FF6B35", // 1.0 new dawn
  ];
  const skyBottom = [
    "#FF6B35",
    "#87CEEB",
    "#87CEEB",
    "#2D1B69",
    "#0C0E1A",
    "#0C0E1A",
    "#1A1A2E",
    "#1A1A2E",
    "#C62368",
  ];
  const skyTop = multiLerp(skyColors, progress);
  const skyBot = multiLerp(skyBottom, progress);

  // night factor: 0 during day, peaks at ~0.7
  const nightFactor = progress < 0.45 ? 0 : progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) / 0.15) : Math.min(1, (progress - 0.45) / 0.2);

  // plane position
  const planeX = progress < 0.15
    ? -5 + progress / 0.15 * 45
    : progress > 0.85
      ? 40 + (progress - 0.85) / 0.15 * 10
      : 40 + Math.sin(progress * Math.PI) * 8;
  const planeY = progress < 0.15
    ? 70 - progress / 0.15 * 35
    : progress > 0.8
      ? 35 + ((progress - 0.8) / 0.2) * 40
      : 35 + Math.sin(progress * 2.5) * 10;
  const planeRotate = progress < 0.15
    ? -15
    : progress > 0.8
      ? 8
      : -5 + Math.sin(progress * 4) * 5;
  const landed = progress > 0.95;

  // money trail intensity
  const moneyCount = progress < 0.2 ? 0 : progress > 0.85 ? Math.max(0, Math.round((1 - (progress - 0.7) / 0.3) * 6)) : Math.round(8 + progress * 6);
  const moneyOpacity = progress < 0.2 ? 0 : progress > 0.9 ? 0.2 : 0.9;

  // phase text
  const activeText = PHASES.find((p) => Math.abs(progress - p.center) < 0.12 && p.text);
  const textOpacity = activeText ? 1 - Math.abs(progress - activeText.center) / 0.12 : 0;

  // CTA
  const ctaOpacity = progress > 0.85 ? Math.min(1, (progress - 0.85) / 0.1) : 0;

  // stars / moon
  const starsOpacity = nightFactor;
  const moonOpacity = nightFactor > 0.3 ? Math.min(1, (nightFactor - 0.3) / 0.3) : 0;

  // runway
  const runwayOpacity = progress > 0.8 ? Math.min(1, (progress - 0.8) / 0.1) : 0;

  // cloud visibility (fade out at night)
  const cloudOpacity = 1 - nightFactor * 0.8;

  // progress bar
  const barWidth = `${progress * 100}%`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: "default",
        userSelect: "none",
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 100%)`,
        transition: "background 0.15s linear",
      }}
    >
      {/* stars */}
      <Stars opacity={starsOpacity} />

      {/* moon */}
      <Moon opacity={moonOpacity} />

      {/* sun */}
      <Sun progress={progress} />

      {/* clouds */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: cloudOpacity, pointerEvents: "none" }}>
        <Cloud size={180} top="12%" speed={28} delay={0} />
        <Cloud size={130} top="22%" speed={35} delay={5} />
        <Cloud size={160} top="8%" speed={40} delay={12} />
        <Cloud size={100} top="30%" speed={32} delay={18} />
        <Cloud size={140} top="18%" speed={45} delay={25} />
      </div>

      {/* skyline */}
      <Skyline nightFactor={nightFactor} />

      {/* city lights */}
      <CityLights opacity={nightFactor > 0.4 ? nightFactor : 0} />

      {/* hills */}
      <Hills nightFactor={nightFactor} />

      {/* golden gate bridge */}
      <div style={{ position: "absolute", bottom: "5%", width: "100%", height: "25%", pointerEvents: "none" }}>
        <GoldenGateBridge nightFactor={nightFactor} />
      </div>

      {/* water */}
      <Water nightFactor={nightFactor} />

      {/* runway */}
      <Runway opacity={runwayOpacity} />

      {/* plane */}
      <div
        style={{
          position: "absolute",
          left: `${planeX}%`,
          top: `${planeY}%`,
          transform: `rotate(${planeRotate}deg) translateY(${landed ? 0 : Math.sin(Date.now() / 600) * 3}px)`,
          transition: "left 0.3s ease-out, top 0.3s ease-out",
          animation: landed ? "none" : "planeBob 2.5s ease-in-out infinite",
          zIndex: 20,
          willChange: "transform, left, top",
        }}
      >
        <MoneyTrail count={moneyCount} opacity={moneyOpacity} />
        <Plane nightFactor={nightFactor} landed={landed} />
      </div>

      {/* phase text */}
      {activeText && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: textOpacity,
            transition: "opacity 0.3s",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "white",
              textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)",
              margin: 0,
              padding: "0 1rem",
              lineHeight: 1.2,
            }}
          >
            {activeText.text}
          </h2>
        </div>
      )}

      {/* CTA */}
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
          justifyContent: "center",
          opacity: ctaOpacity,
          transition: "opacity 0.4s",
          zIndex: 30,
          pointerEvents: ctaOpacity > 0.5 ? "auto" : "none",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            fontWeight: 700,
            color: "white",
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
            margin: "0 0 2rem 0",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          find your runway
        </h1>
        <button
          onClick={() => navigate("/play")}
          style={{
            background: "linear-gradient(135deg, #7C3AED, #9F5AFF)",
            color: "white",
            border: "none",
            padding: "1rem 2.5rem",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 600,
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.3)",
            animation: "ctaPulse 2s ease-in-out infinite",
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          play burn.money &rarr;
        </button>
      </div>

      {/* scroll hint */}
      {progress < 0.05 && (
        <div
          style={{
            position: "absolute",
            bottom: "3%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            textAlign: "center",
            animation: "fadeInUp 1s ease-out",
            zIndex: 30,
          }}
        >
          <div style={{ animation: "bounce 2s infinite" }}>&#8595;</div>
          <div style={{ marginTop: 4 }}>scroll or press spacebar</div>
        </div>
      )}

      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          width: barWidth,
          background: "linear-gradient(90deg, #7C3AED, #22C55E)",
          zIndex: 40,
          transition: "width 0.1s linear",
        }}
      />

      {/* keyframe styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cloudDrift {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100vw - 300px)); }
        }
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes moneyFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(40px) rotate(20deg); opacity: 0; }
        }
        @keyframes planeBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 50px rgba(124,58,237,0.7), 0 4px 30px rgba(0,0,0,0.4); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes waveShift {
          from { transform: translateX(-20px); }
          to { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}
