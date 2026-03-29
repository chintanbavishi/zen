import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";

/* ───── Phase Configuration ───── */
interface Phase {
  subtitle: string;
  title: string;
  skyGradient: string;
  bridgeOpacity: number;
  bridgeColor: string;
  fogOpacity: number;
  waterColor: string;
  textColor: string;
  glowColor: string;
  showStars: boolean;
  showMoon: boolean;
  showCityLights: boolean;
  planeY: number; // % from top
  planeX: number; // % from left
  planeRotation: number; // degrees
  showRunway: boolean;
}

const PHASES: Phase[] = [
  {
    // Phase 1: Dawn (0-20%)
    subtitle: "y combinator just wired you $250,000",
    title: "every founder gets $250K",
    skyGradient: `linear-gradient(to bottom,
      #FFF8F0 0%, #F5D0B0 35%, #E8A87C 60%, #C4988A 80%, #1a2a3a 95%)`,
    bridgeOpacity: 0.7,
    bridgeColor: "#2a2a3a",
    fogOpacity: 0.5,
    waterColor: "#1a2a3a",
    textColor: "rgba(42,42,58,0.85)",
    glowColor: "rgba(232,168,124,0.4)",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    planeY: 55,
    planeX: -10,
    planeRotation: -8,
    showRunway: false,
  },
  {
    // Phase 2: Day (20-40%)
    subtitle: "the clock starts ticking",
    title: "most burn through it in 12 months",
    skyGradient: `linear-gradient(to bottom,
      #B8D4E8 0%, #D4E4F0 25%, #FFF8F0 55%, #F0E0D0 80%, #1a2a3a 95%)`,
    bridgeOpacity: 0.5,
    bridgeColor: "#3a3a4a",
    fogOpacity: 0.3,
    waterColor: "#2a3a4a",
    textColor: "rgba(42,42,58,0.8)",
    glowColor: "rgba(184,212,232,0.3)",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    planeY: 30,
    planeX: 25,
    planeRotation: -12,
    showRunway: false,
  },
  {
    // Phase 3: Sunset (40-60%)
    subtitle: "against all odds",
    title: "some build empires",
    skyGradient: `linear-gradient(to bottom,
      #E8A87C 0%, #D4887A 25%, #C4788A 45%, #8B5A7E 65%, #5C4A6E 85%, #1a2a3a 95%)`,
    bridgeOpacity: 0.8,
    bridgeColor: "#1a1a2a",
    fogOpacity: 0.35,
    waterColor: "#1a1a2a",
    textColor: "rgba(250,245,239,0.85)",
    glowColor: "rgba(232,168,124,0.5)",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    planeY: 25,
    planeX: 50,
    planeRotation: 0,
    showRunway: false,
  },
  {
    // Phase 4: Night (60-80%)
    subtitle: "the runway gets shorter",
    title: "most crash and burn",
    skyGradient: `linear-gradient(to bottom,
      #0C0E1A 0%, #1A1A3E 30%, #2D2B55 55%, #1A1A3E 80%, #0C0E1A 100%)`,
    bridgeOpacity: 0.6,
    bridgeColor: "#0a0a1a",
    fogOpacity: 0.15,
    waterColor: "#0a0a14",
    textColor: "rgba(250,245,239,0.8)",
    glowColor: "rgba(92,74,110,0.4)",
    showStars: true,
    showMoon: true,
    showCityLights: true,
    planeY: 35,
    planeX: 70,
    planeRotation: 5,
    showRunway: false,
  },
  {
    // Phase 5: New Dawn / Landing (80-100%)
    subtitle: "you have one shot",
    title: "find your runway",
    skyGradient: `linear-gradient(to bottom,
      #2D2B55 0%, #5C4A6E 20%, #C4788A 40%, #E8A87C 60%, #F5D0B0 80%, #1a2a3a 95%)`,
    bridgeOpacity: 0.4,
    bridgeColor: "#2a2a3a",
    fogOpacity: 0.25,
    waterColor: "#1a2a3a",
    textColor: "rgba(250,245,239,0.9)",
    glowColor: "rgba(232,168,124,0.6)",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    planeY: 62,
    planeX: 60,
    planeRotation: 12,
    showRunway: true,
  },
];

/* ───── Interpolation helpers ───── */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: string, b: string, t: number): string {
  const parse = (c: string) => {
    const hex = c.replace("#", "");
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r},${g},${bl})`;
}

/* ───── Money particle type ───── */
interface MoneyParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
}

/* ───── Star data (generated once) ───── */
function generateStars(count: number) {
  const stars: { x: number; y: number; size: number; delay: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
    });
  }
  return stars;
}

const STARS = generateStars(80);

/* ───── Component ───── */
export function LandingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<MoneyParticle[]>([]);
  const particleIdRef = useRef(0);
  const lastProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  // Smooth progress animation
  useEffect(() => {
    const animate = () => {
      setProgress((prev) => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.1) return target;
        return prev + diff * 0.08;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Spawn money particles when progress advances
  const spawnParticles = useCallback(
    (planeX: number, planeY: number) => {
      const newParticles: MoneyParticle[] = [];
      for (let i = 0; i < 3; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: planeX - 2 + Math.random() * 2,
          y: planeY + Math.random() * 3,
          opacity: 0.8 + Math.random() * 0.2,
          size: 10 + Math.random() * 8,
          vx: -0.3 - Math.random() * 0.5,
          vy: 0.2 + Math.random() * 0.4,
          rotation: Math.random() * 360,
        });
      }
      setParticles((prev) => [...prev.slice(-30), ...newParticles]);
    },
    []
  );

  // Particle decay
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.3,
            y: p.y + p.vy * 0.3,
            opacity: p.opacity - 0.015,
            rotation: p.rotation + 2,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Input handlers
  const advanceProgress = useCallback(
    (delta: number) => {
      targetProgressRef.current = Math.min(
        100,
        Math.max(0, targetProgressRef.current + delta)
      );
      // Spawn particles if advancing
      if (delta > 0 && targetProgressRef.current > 20) {
        const phaseIdx = Math.min(
          4,
          Math.floor(targetProgressRef.current / 20)
        );
        const localT =
          (targetProgressRef.current - phaseIdx * 20) / 20;
        const phase = PHASES[phaseIdx];
        const nextPhase = PHASES[Math.min(4, phaseIdx + 1)];
        const px = lerp(phase.planeX, nextPhase.planeX, localT);
        const py = lerp(phase.planeY, nextPhase.planeY, localT);
        spawnParticles(px, py);
      }
    },
    [spawnParticles]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        advanceProgress(15);
      } else if (e.code === "ArrowRight" || e.code === "ArrowDown") {
        e.preventDefault();
        advanceProgress(5);
      } else if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
        e.preventDefault();
        advanceProgress(-5);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      advanceProgress(e.deltaY > 0 ? 4 : -4);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const delta = touchStartY - e.touches[0].clientY;
      if (Math.abs(delta) > 5) {
        advanceProgress(delta > 0 ? 3 : -3);
        touchStartY = e.touches[0].clientY;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [advanceProgress]);

  // Track progress for particle spawning
  useEffect(() => {
    lastProgressRef.current = progress;
  }, [progress]);

  /* ───── Derived phase state ───── */
  const phaseIdx = Math.min(4, Math.floor(progress / 20));
  const nextIdx = Math.min(4, phaseIdx + 1);
  const localT = phaseIdx === nextIdx ? 0 : (progress - phaseIdx * 20) / 20;
  const phase = PHASES[phaseIdx];
  const next = PHASES[nextIdx];

  const planeX = lerp(phase.planeX, next.planeX, localT);
  const planeY = lerp(phase.planeY, next.planeY, localT);
  const planeRot = lerp(phase.planeRotation, next.planeRotation, localT);
  const bridgeOpacity = lerp(phase.bridgeOpacity, next.bridgeOpacity, localT);
  const bridgeColor = lerpColor(phase.bridgeColor, next.bridgeColor, localT);
  const fogOpacity = lerp(phase.fogOpacity, next.fogOpacity, localT);
  const waterColor = lerpColor(phase.waterColor, next.waterColor, localT);
  const starsOpacity = phase.showStars
    ? localT < 0.5
      ? lerp(0, 1, localT * 2)
      : 1
    : next.showStars
    ? lerp(0, 1, localT)
    : 0;
  const moonOpacity = phase.showMoon ? 1 : next.showMoon ? localT : 0;
  const cityOpacity = phase.showCityLights
    ? 1
    : next.showCityLights
    ? localT
    : 0;

  // Sky gradient — use current phase gradient (snaps at phase boundaries for clean transitions)
  const skyGradient =
    localT < 0.5 ? phase.skyGradient : next.skyGradient;

  // Text — show current phase text, fade based on local position
  const textOpacity =
    localT < 0.15
      ? localT / 0.15
      : localT > 0.85
      ? (1 - localT) / 0.15
      : 1;
  const currentPhase = PHASES[phaseIdx];

  const showCTA = progress >= 90;
  const planeEntered = progress > 2;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        margin: 0,
        padding: 0,
        background: skyGradient,
        fontFamily: "'Outfit', sans-serif",
        cursor: "default",
        userSelect: "none",
        transition: "background 1.5s ease",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Horizon glow */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "140%",
          height: "40%",
          background: `radial-gradient(ellipse at center, ${phase.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 1.5s ease",
        }}
      />

      {/* Stars */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: starsOpacity,
          transition: "opacity 1s ease",
          zIndex: 1,
        }}
      >
        {STARS.map((s, i) => (
          <div
            key={i}
            className="star-twinkle"
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "#faf5ef",
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "15%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 40%, #FFF8F0 0%, #E8D8C8 60%, #C4B8A8 100%)",
          boxShadow: "0 0 40px rgba(255,248,240,0.3), 0 0 80px rgba(255,248,240,0.15)",
          opacity: moonOpacity,
          transition: "opacity 1s ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* City lights (distant, along water line) */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: 0,
          right: 0,
          height: 3,
          opacity: cityOpacity,
          transition: "opacity 1s ease",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="city-light-blink"
            style={{
              position: "absolute",
              left: `${5 + i * 2.3}%`,
              width: Math.random() > 0.5 ? 2 : 1,
              height: Math.random() > 0.5 ? 3 : 2,
              background:
                i % 3 === 0
                  ? "rgba(255,200,100,0.8)"
                  : "rgba(255,248,240,0.6)",
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

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
          filter: "blur(0.6px)",
          opacity: bridgeOpacity,
          transition: "opacity 1s ease",
          zIndex: 2,
        }}
      >
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="xMidYMax meet"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Deck */}
          <rect x="50" y="220" width="900" height="6" fill={bridgeColor} />

          {/* Left tower */}
          <polygon
            points="280,40 290,40 294,220 276,220"
            fill={bridgeColor}
          />
          <polygon
            points="300,40 310,40 314,220 296,220"
            fill={bridgeColor}
          />
          <rect x="275" y="40" width="40" height="5" fill={bridgeColor} />
          <rect x="275" y="100" width="40" height="4" fill={bridgeColor} />
          <rect x="275" y="155" width="40" height="4" fill={bridgeColor} />

          {/* Right tower */}
          <polygon
            points="690,40 700,40 704,220 686,220"
            fill={bridgeColor}
          />
          <polygon
            points="710,40 720,40 724,220 706,220"
            fill={bridgeColor}
          />
          <rect x="685" y="40" width="40" height="5" fill={bridgeColor} />
          <rect x="685" y="100" width="40" height="4" fill={bridgeColor} />
          <rect x="685" y="155" width="40" height="4" fill={bridgeColor} />

          {/* Main cables */}
          <path
            d="M50,120 Q165,180 295,42"
            stroke={bridgeColor}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M295,42 Q500,200 705,42"
            stroke={bridgeColor}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M705,42 Q835,180 950,120"
            stroke={bridgeColor}
            strokeWidth="3"
            fill="none"
          />

          {/* Suspender cables - left approach */}
          {[120, 170, 220].map((x) => {
            const t = (x - 50) / (295 - 50);
            const cy =
              120 * (1 - t) * (1 - t) +
              180 * 2 * t * (1 - t) +
              42 * t * t;
            return (
              <line
                key={`la${x}`}
                x1={x}
                y1={cy}
                x2={x}
                y2={220}
                stroke={bridgeColor}
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}

          {/* Suspender cables - center span */}
          {[340, 380, 420, 460, 500, 540, 580, 620, 660].map((x) => {
            const t = (x - 295) / (705 - 295);
            const cy =
              42 * (1 - t) * (1 - t) +
              200 * 2 * t * (1 - t) +
              42 * t * t;
            return (
              <line
                key={`cs${x}`}
                x1={x}
                y1={cy}
                x2={x}
                y2={220}
                stroke={bridgeColor}
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}

          {/* Suspender cables - right approach */}
          {[780, 830, 880].map((x) => {
            const t = (x - 705) / (950 - 705);
            const cy =
              42 * (1 - t) * (1 - t) +
              180 * 2 * t * (1 - t) +
              120 * t * t;
            return (
              <line
                key={`ra${x}`}
                x1={x}
                y1={cy}
                x2={x}
                y2={220}
                stroke={bridgeColor}
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}
        </svg>
      </div>

      {/* Fog layers */}
      <div
        className="fog-layer fog-1"
        style={{
          position: "absolute",
          bottom: "25%",
          left: "-10%",
          right: "-10%",
          height: "30%",
          background: `linear-gradient(to top, rgba(255,248,240,${fogOpacity}), transparent)`,
          pointerEvents: "none",
          willChange: "transform",
          filter: "blur(8px)",
          zIndex: 3,
        }}
      />
      <div
        className="fog-layer fog-2"
        style={{
          position: "absolute",
          bottom: "35%",
          left: "-5%",
          right: "-5%",
          height: "25%",
          background: `linear-gradient(to top, rgba(255,248,240,${fogOpacity * 0.5}), transparent)`,
          pointerEvents: "none",
          willChange: "transform",
          filter: "blur(15px)",
          zIndex: 3,
        }}
      />
      <div
        className="fog-layer fog-3"
        style={{
          position: "absolute",
          bottom: "45%",
          left: "-8%",
          right: "-8%",
          height: "20%",
          background: `linear-gradient(to top, rgba(200,185,210,${fogOpacity * 0.4}), transparent)`,
          filter: "blur(25px)",
          pointerEvents: "none",
          willChange: "transform",
          zIndex: 3,
        }}
      />

      {/* Top haze */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "35%",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)",
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
          background: `linear-gradient(to bottom, ${waterColor}, ${waterColor})`,
          pointerEvents: "none",
          transition: "background 1.5s ease",
          zIndex: 1,
        }}
      >
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

      {/* Runway (Phase 5) */}
      {progress > 75 && (
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "12%",
            width: "25%",
            height: 4,
            background: "rgba(250,245,239,0.4)",
            opacity: Math.min(1, (progress - 75) / 15),
            transform: "perspective(400px) rotateX(30deg) rotateZ(-5deg)",
            transformOrigin: "right center",
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          {/* Runway markings */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${10 + i * 11}%`,
                top: -1,
                width: "6%",
                height: 2,
                background: "rgba(250,245,239,0.6)",
              }}
            />
          ))}
        </div>
      )}

      {/* Money particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            color: "#4ade80",
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            pointerEvents: "none",
            zIndex: 6,
            fontWeight: 600,
            textShadow: "0 0 8px rgba(74,222,128,0.4)",
          }}
        >
          $
        </div>
      ))}

      {/* Plane SVG */}
      <div
        style={{
          position: "absolute",
          left: `${planeX}%`,
          top: `${planeY}%`,
          transform: `translate(-50%, -50%) rotate(${planeRot}deg)`,
          transition: "left 0.3s ease-out, top 0.3s ease-out",
          opacity: planeEntered ? 1 : 0,
          pointerEvents: "none",
          zIndex: 7,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
        }}
      >
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fuselage */}
          <ellipse cx="55" cy="30" rx="40" ry="10" fill="#E8D8C8" />
          <ellipse cx="55" cy="30" rx="40" ry="10" fill="url(#fuselageGrad)" />

          {/* Cockpit window */}
          <ellipse cx="88" cy="28" rx="6" ry="5" fill="#B8D4E8" opacity="0.8" />

          {/* Wing */}
          <path
            d="M35,30 L20,12 L65,28 Z"
            fill="#D4C4B4"
            opacity="0.9"
          />
          <path
            d="M35,30 L20,48 L65,32 Z"
            fill="#C4B4A4"
            opacity="0.9"
          />

          {/* Tail */}
          <path d="M15,30 L5,14 L22,28 Z" fill="#D4C4B4" opacity="0.85" />
          <path d="M15,30 L10,26 L18,28 Z" fill="#C4B4A4" opacity="0.85" />

          {/* BURN.MONEY text on fuselage */}
          <text
            x="55"
            y="33"
            textAnchor="middle"
            fontSize="6"
            fontFamily="Outfit, sans-serif"
            fontWeight="600"
            fill="#5C4A6E"
            opacity="0.7"
          >
            BURN.MONEY
          </text>

          {/* Propeller */}
          <g className="propeller-spin" style={{ transformOrigin: "98px 30px" }}>
            <rect
              x="96"
              y="20"
              width="4"
              height="20"
              rx="2"
              fill="#8B7A6A"
              opacity="0.7"
            />
          </g>

          {/* Engine exhaust glow */}
          <circle cx="12" cy="30" r="3" fill="#E8A87C" opacity="0.4">
            <animate
              attributeName="opacity"
              values="0.2;0.5;0.2"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </circle>

          <defs>
            <linearGradient
              id="fuselageGrad"
              x1="15"
              y1="20"
              x2="95"
              y2="40"
            >
              <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C4B4A4" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Grain overlay */}
      <div
        className="grain"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 8,
        }}
      />

      {/* Phase text */}
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
          paddingTop: "15vh",
          zIndex: 9,
          pointerEvents: "none",
        }}
      >
        {/* Phase subtitle */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2vw, 1.3rem)",
            color: currentPhase.textColor,
            letterSpacing: "0.05em",
            margin: "0 0 1rem 0",
            padding: "0 1rem",
            textAlign: "center",
            opacity: progress < 2 ? 0 : textOpacity,
            transition: "opacity 0.5s ease, color 1s ease",
          }}
        >
          {currentPhase.subtitle}
        </p>

        {/* Phase title */}
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            color: currentPhase.textColor,
            letterSpacing: "0.04em",
            textShadow: `0 0 40px ${currentPhase.glowColor}`,
            margin: 0,
            padding: "0 1.5rem",
            textAlign: "center",
            lineHeight: 1.2,
            opacity: progress < 2 ? 0 : textOpacity,
            transition: "opacity 0.5s ease, color 1s ease",
            maxWidth: 700,
          }}
        >
          {currentPhase.title}
        </h1>

        {/* BURN.MONEY logo — always visible */}
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
            color: currentPhase.textColor,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            margin: "2rem 0 0 0",
            opacity: 0.4,
            transition: "color 1s ease",
          }}
        >
          BURN.MONEY
        </p>

        {/* CTA button — appears at Phase 5 */}
        {showCTA && (
          <button
            onClick={() => navigate("/play")}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
              color: "#faf5ef",
              background: "rgba(232,168,124,0.2)",
              border: "1px solid rgba(250,245,239,0.4)",
              borderRadius: 9999,
              padding: "0.85rem 2.5rem",
              cursor: "pointer",
              letterSpacing: "0.06em",
              marginTop: "2.5rem",
              pointerEvents: "auto",
              opacity: Math.min(1, (progress - 90) / 5),
              transition:
                "background 0.3s, border-color 0.3s, opacity 0.5s ease",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232,168,124,0.35)";
              e.currentTarget.style.borderColor = "rgba(250,245,239,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(232,168,124,0.2)";
              e.currentTarget.style.borderColor = "rgba(250,245,239,0.4)";
            }}
          >
            find your runway →
          </button>
        )}
      </div>

      {/* Instruction hint */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
          opacity: progress < 5 ? 0.7 : Math.max(0, 0.7 - progress / 20),
          transition: "opacity 0.5s ease",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            color: "rgba(250,245,239,0.6)",
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.03em",
          }}
        >
          press spacebar to fly
        </p>
        <div
          className="bounce-arrow"
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "rgba(250,245,239,0.4)",
            marginTop: 8,
          }}
        >
          ▼
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, #E8A87C, #C4788A, #5C4A6E)",
            transition: "width 0.15s ease-out",
          }}
        />
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fogDrift1 {
          0% { transform: translateX(-8%); }
          100% { transform: translateX(8%); }
        }
        @keyframes fogDrift2 {
          0% { transform: translateX(5%); }
          100% { transform: translateX(-5%); }
        }
        @keyframes fogDrift3 {
          0% { transform: translateX(-6%) translateY(-2%); }
          100% { transform: translateX(6%) translateY(2%); }
        }
        @keyframes waterShimmer {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes propellerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes cityBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }

        .fog-1 {
          animation: fogDrift1 60s ease-in-out infinite alternate;
        }
        .fog-2 {
          animation: fogDrift2 80s ease-in-out infinite alternate-reverse;
        }
        .fog-3 {
          animation: fogDrift3 100s ease-in-out infinite alternate;
        }
        .water-shimmer {
          animation: waterShimmer 4s ease-in-out infinite;
        }
        .star-twinkle {
          animation: starTwinkle 3s ease-in-out infinite;
        }
        .propeller-spin {
          animation: propellerSpin 0.15s linear infinite;
        }
        .bounce-arrow {
          animation: bounceArrow 1.5s ease-in-out infinite;
        }
        .city-light-blink {
          animation: cityBlink 5s ease-in-out infinite;
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
          .fog-3 { display: none; }
        }
      `}</style>
    </div>
  );
}
