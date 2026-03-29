import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";

/* ───── Phase Configuration ───── */
interface Phase {
  text: string;
  skyTop: string;
  skyMid: string;
  skyBot: string;
  hillNear: string;
  hillFar: string;
  waterColor: string;
  bridgeColor: string;
  showStars: boolean;
  showMoon: boolean;
  showCityLights: boolean;
  showRunway: boolean;
  sunY: number; // percent from top
  sunColor: string;
  sunOpacity: number;
  planeY: number;
}

const PHASES: Phase[] = [
  {
    // Phase 1: Morning in SF (0-20%)
    text: "every founder gets $250K",
    skyTop: "#4AC4F0",
    skyMid: "#87CEEB",
    skyBot: "#B0E0FF",
    hillNear: "#4CAF50",
    hillFar: "#A5D6A7",
    waterColor: "#4A90D9",
    bridgeColor: "#C41E3A",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    showRunway: false,
    sunY: 70,
    sunColor: "#FFF176",
    sunOpacity: 0.9,
    planeY: 35,
  },
  {
    // Phase 2: Flying Over the Bay (20-40%)
    text: "most burn through it in 12 months",
    skyTop: "#3AB8E8",
    skyMid: "#7EC8E3",
    skyBot: "#A8D8EA",
    hillNear: "#66BB6A",
    hillFar: "#C8E6C9",
    waterColor: "#5BA3E6",
    bridgeColor: "#D4382E",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    showRunway: false,
    sunY: 55,
    sunColor: "#FFF9C4",
    sunOpacity: 0.8,
    planeY: 25,
  },
  {
    // Phase 3: Sunset Over SF (40-60%)
    text: "some build empires",
    skyTop: "#4A90D9",
    skyMid: "#FF9800",
    skyBot: "#E91E63",
    hillNear: "#388E3C",
    hillFar: "#81C784",
    waterColor: "#D4772C",
    bridgeColor: "#8B1A2B",
    showStars: false,
    showMoon: false,
    showCityLights: false,
    showRunway: false,
    sunY: 78,
    sunColor: "#FF9800",
    sunOpacity: 1,
    planeY: 28,
  },
  {
    // Phase 4: Night (60-80%)
    text: "most crash and burn",
    skyTop: "#0D1B2A",
    skyMid: "#1A237E",
    skyBot: "#283593",
    hillNear: "#1B5E20",
    hillFar: "#2E7D32",
    waterColor: "#0D1B2A",
    bridgeColor: "#4A1A1A",
    showStars: true,
    showMoon: true,
    showCityLights: true,
    showRunway: false,
    sunY: 100,
    sunColor: "#FF9800",
    sunOpacity: 0,
    planeY: 30,
  },
  {
    // Phase 5: Landing (80-100%)
    text: "find your runway",
    skyTop: "#4A148C",
    skyMid: "#FF6F00",
    skyBot: "#FFB74D",
    hillNear: "#2E7D32",
    hillFar: "#66BB6A",
    waterColor: "#3A6B9F",
    bridgeColor: "#6B2020",
    showStars: false,
    showMoon: false,
    showCityLights: true,
    showRunway: true,
    sunY: 75,
    sunColor: "#FF6F00",
    sunOpacity: 0.7,
    planeY: 55,
  },
];

/* ───── Helpers ───── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

function getPhaseValues(progress: number) {
  const idx = Math.min(Math.floor(progress / 20), 4);
  const nextIdx = Math.min(idx + 1, 4);
  const t = (progress - idx * 20) / 20;

  const a = PHASES[idx];
  const b = PHASES[nextIdx];

  return {
    text: a.text,
    showCTA: idx === 4,
    skyTop: lerpColor(a.skyTop, b.skyTop, t),
    skyMid: lerpColor(a.skyMid, b.skyMid, t),
    skyBot: lerpColor(a.skyBot, b.skyBot, t),
    hillNear: lerpColor(a.hillNear, b.hillNear, t),
    hillFar: lerpColor(a.hillFar, b.hillFar, t),
    waterColor: lerpColor(a.waterColor, b.waterColor, t),
    bridgeColor: lerpColor(a.bridgeColor, b.bridgeColor, t),
    showStars: a.showStars,
    showMoon: a.showMoon,
    showCityLights: a.showCityLights || b.showCityLights,
    showRunway: a.showRunway,
    sunY: lerp(a.sunY, b.sunY, t),
    sunColor: lerpColor(a.sunColor, b.sunColor, t),
    sunOpacity: lerp(a.sunOpacity, b.sunOpacity, t),
    planeY: lerp(a.planeY, b.planeY, t),
    parallaxX: progress * 3,
    phaseIdx: idx,
  };
}

/* ───── Pixel Cloud Component ───── */
function PixelCloud({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const s = 6 * size;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        imageRendering: "pixelated" as const,
      }}
    >
      <svg
        width={s * 10}
        height={s * 5}
        viewBox="0 0 10 5"
        shapeRendering="crispEdges"
      >
        {/* Cloud body */}
        <rect x="1" y="2" width="8" height="2" fill="#FFFFFF" />
        <rect x="2" y="1" width="6" height="1" fill="#FFFFFF" />
        <rect x="3" y="0" width="2" height="1" fill="#FFFFFF" />
        <rect x="6" y="0" width="2" height="1" fill="#FFFFFF" />
        <rect x="0" y="3" width="1" height="1" fill="#FFFFFF" />
        <rect x="9" y="3" width="1" height="1" fill="#FFFFFF" />
        {/* Shadow */}
        <rect x="1" y="4" width="8" height="1" fill="#D0E8FF" />
        <rect x="0" y="4" width="1" height="1" fill="#D0E8FF" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ───── Pixel Stars ───── */
function PixelStars() {
  const stars = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: (i * 37 + 13) % 100,
      y: (i * 23 + 7) % 45,
      size: i % 3 === 0 ? 3 : 2,
      delay: (i * 0.3) % 2,
    }))
  );
  return (
    <>
      {stars.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: i % 5 === 0 ? "#FFF9C4" : "#FFFFFF",
            imageRendering: "pixelated" as const,
            animation: `twinkle 1.5s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

/* ───── Pixel Moon ───── */
function PixelMoon() {
  return (
    <div style={{ position: "absolute", right: "12%", top: "8%" }}>
      <svg
        width={48}
        height={48}
        viewBox="0 0 8 8"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" as const }}
      >
        <rect x="2" y="0" width="4" height="1" fill="#FFF9C4" />
        <rect x="1" y="1" width="4" height="1" fill="#FFF9C4" />
        <rect x="0" y="2" width="4" height="1" fill="#FFF9C4" />
        <rect x="0" y="3" width="4" height="1" fill="#FFF9C4" />
        <rect x="0" y="4" width="4" height="1" fill="#FFF9C4" />
        <rect x="0" y="5" width="4" height="1" fill="#FFF9C4" />
        <rect x="1" y="6" width="4" height="1" fill="#FFF9C4" />
        <rect x="2" y="7" width="4" height="1" fill="#FFF9C4" />
      </svg>
    </div>
  );
}

/* ───── Pixel Bridge (Golden Gate) ───── */
function PixelBridge({ color, parallaxX }: { color: string; parallaxX: number }) {
  const lighter = color;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "28%",
        left: `calc(30% - ${parallaxX * 0.5}px)`,
        width: 320,
        height: 120,
        imageRendering: "pixelated" as const,
        transition: "left 0.3s ease-out",
      }}
    >
      <svg
        width={320}
        height={120}
        viewBox="0 0 80 30"
        shapeRendering="crispEdges"
      >
        {/* Left tower */}
        <rect x="12" y="2" width="4" height="24" fill={lighter} />
        <rect x="11" y="0" width="6" height="3" fill={lighter} />
        {/* Right tower */}
        <rect x="58" y="2" width="4" height="24" fill={lighter} />
        <rect x="57" y="0" width="6" height="3" fill={lighter} />
        {/* Road deck */}
        <rect x="0" y="18" width="80" height="3" fill={lighter} />
        {/* Cables - left side */}
        <rect x="14" y="3" width="1" height="1" fill={lighter} />
        <rect x="16" y="4" width="1" height="1" fill={lighter} />
        <rect x="18" y="5" width="1" height="1" fill={lighter} />
        <rect x="20" y="6" width="1" height="1" fill={lighter} />
        <rect x="22" y="7" width="1" height="1" fill={lighter} />
        <rect x="24" y="8" width="1" height="1" fill={lighter} />
        <rect x="26" y="9" width="1" height="1" fill={lighter} />
        <rect x="28" y="10" width="1" height="1" fill={lighter} />
        <rect x="30" y="11" width="1" height="1" fill={lighter} />
        <rect x="32" y="12" width="1" height="1" fill={lighter} />
        <rect x="34" y="13" width="1" height="1" fill={lighter} />
        <rect x="36" y="14" width="1" height="1" fill={lighter} />
        <rect x="38" y="15" width="1" height="1" fill={lighter} />
        {/* Cables - right side */}
        <rect x="40" y="15" width="1" height="1" fill={lighter} />
        <rect x="42" y="14" width="1" height="1" fill={lighter} />
        <rect x="44" y="13" width="1" height="1" fill={lighter} />
        <rect x="46" y="12" width="1" height="1" fill={lighter} />
        <rect x="48" y="11" width="1" height="1" fill={lighter} />
        <rect x="50" y="10" width="1" height="1" fill={lighter} />
        <rect x="52" y="9" width="1" height="1" fill={lighter} />
        <rect x="54" y="8" width="1" height="1" fill={lighter} />
        <rect x="56" y="7" width="1" height="1" fill={lighter} />
        <rect x="60" y="4" width="1" height="1" fill={lighter} />
        <rect x="62" y="5" width="1" height="1" fill={lighter} />
        <rect x="64" y="6" width="1" height="1" fill={lighter} />
        {/* Vertical suspenders */}
        {[16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56].map((xp) => (
          <rect key={xp} x={xp} y={Math.max(4, 18 - Math.abs(xp - 36) * 0.5)} width="1" height={18 - Math.max(4, 18 - Math.abs(xp - 36) * 0.5)} fill={lighter} opacity="0.6" />
        ))}
        {/* Tower lights at night - small red dots */}
        <rect x="13" y="0" width="2" height="1" fill="#FF3333" opacity="0.8" />
        <rect x="59" y="0" width="2" height="1" fill="#FF3333" opacity="0.8" />
      </svg>
    </div>
  );
}

/* ───── Pixel City Skyline ───── */
function PixelSkyline({
  parallaxX,
  showLights,
}: {
  parallaxX: number;
  showLights: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "30%",
        right: `calc(-5% - ${parallaxX * 0.3}px)`,
        width: 200,
        height: 80,
        imageRendering: "pixelated" as const,
        transition: "right 0.3s ease-out",
      }}
    >
      <svg
        width={200}
        height={80}
        viewBox="0 0 50 20"
        shapeRendering="crispEdges"
      >
        {/* Buildings */}
        <rect x="2" y="6" width="5" height="14" fill="#546E7A" />
        <rect x="8" y="3" width="4" height="17" fill="#455A64" />
        <rect x="13" y="8" width="6" height="12" fill="#607D8B" />
        <rect x="20" y="1" width="3" height="19" fill="#37474F" />
        <rect x="24" y="5" width="5" height="15" fill="#546E7A" />
        <rect x="30" y="7" width="4" height="13" fill="#455A64" />
        <rect x="35" y="4" width="3" height="16" fill="#607D8B" />
        <rect x="39" y="9" width="5" height="11" fill="#546E7A" />
        <rect x="45" y="6" width="4" height="14" fill="#37474F" />
        {/* Transamerica-ish */}
        <rect x="21" y="0" width="1" height="1" fill="#37474F" />
        {/* Windows when lit */}
        {showLights &&
          [
            [3, 8],
            [5, 10],
            [3, 12],
            [9, 5],
            [10, 7],
            [9, 9],
            [14, 10],
            [16, 12],
            [15, 14],
            [21, 3],
            [21, 6],
            [21, 9],
            [25, 7],
            [27, 9],
            [25, 11],
            [31, 9],
            [32, 11],
            [36, 6],
            [36, 8],
            [40, 11],
            [42, 13],
            [46, 8],
            [47, 10],
          ].map(([wx, wy], i) => (
            <rect
              key={i}
              x={wx}
              y={wy}
              width="1"
              height="1"
              fill="#FFF176"
              opacity={0.7 + (i % 3) * 0.1}
            />
          ))}
      </svg>
    </div>
  );
}

/* ───── Pixel Plane ───── */
function PixelPlane({
  y,
  boosted,
  isNight,
}: {
  y: number;
  boosted: boolean;
  isNight: boolean;
}) {
  const windowFill = isNight ? "#FFF176" : "#87CEEB";
  return (
    <div
      style={{
        position: "absolute",
        left: "35%",
        top: `${y}%`,
        transform: boosted
          ? "rotate(-12deg) translateY(-24px)"
          : "rotate(-2deg) translateY(0px)",
        transition: boosted
          ? "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1.2)"
          : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.8s ease-out",
        zIndex: 20,
        imageRendering: "pixelated" as const,
      }}
    >
      <svg
        width={140}
        height={60}
        viewBox="0 0 35 15"
        shapeRendering="crispEdges"
      >
        {/* Propeller */}
        <g style={{ transformOrigin: "3px 6px", animation: "spin 0.15s linear infinite" }}>
          <rect x="1" y="4" width="1" height="1" fill="#78909C" />
          <rect x="1" y="7" width="1" height="1" fill="#78909C" />
          <rect x="2" y="5" width="1" height="2" fill="#90A4AE" />
        </g>
        {/* Nose */}
        <rect x="3" y="5" width="2" height="3" fill="#E0E0E0" />
        {/* Body */}
        <rect x="5" y="4" width="20" height="5" fill="#F5F5F5" />
        <rect x="5" y="3" width="18" height="1" fill="#EEEEEE" />
        <rect x="5" y="9" width="18" height="1" fill="#E0E0E0" />
        {/* Cockpit */}
        <rect x="5" y="4" width="3" height="2" fill="#81D4FA" />
        {/* Windows */}
        <rect x="10" y="5" width="1" height="1" fill={windowFill} />
        <rect x="13" y="5" width="1" height="1" fill={windowFill} />
        <rect x="16" y="5" width="1" height="1" fill={windowFill} />
        <rect x="19" y="5" width="1" height="1" fill={windowFill} />
        {/* Wing top */}
        <rect x="11" y="1" width="8" height="2" fill="#B0BEC5" />
        <rect x="12" y="0" width="6" height="1" fill="#90A4AE" />
        {/* Wing bottom */}
        <rect x="11" y="10" width="8" height="2" fill="#B0BEC5" />
        <rect x="12" y="12" width="6" height="1" fill="#90A4AE" />
        {/* Tail */}
        <rect x="25" y="4" width="5" height="4" fill="#E0E0E0" />
        <rect x="28" y="1" width="3" height="3" fill="#BDBDBD" />
        <rect x="30" y="0" width="2" height="2" fill="#C41E3A" />
        <rect x="29" y="8" width="3" height="2" fill="#BDBDBD" />
        {/* BURN.MONEY text (tiny line for flavor) */}
        <rect x="8" y="7" width="10" height="1" fill="#C41E3A" opacity="0.6" />
        {/* Engine glow */}
        <rect x="1" y="6" width="2" height="1" fill="#FFD54F" opacity="0.6" />
      </svg>
    </div>
  );
}

/* ───── Money Trail ───── */
function MoneyTrail({ progress }: { progress: number }) {
  const count = Math.floor(progress / 8);
  const bills = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      x: 28 - i * 6 + (i % 2) * 2,
      y: 40 + (i % 3) * 8 - (i % 2) * 4,
      rot: (i * 25) % 40 - 20,
      delay: i * 0.15,
    }))
  );
  if (progress < 15) return null;
  return (
    <>
      {bills.current.slice(0, Math.min(count, 12)).map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: `rotate(${b.rot}deg)`,
            opacity: Math.max(0, 1 - (progress - 20) * 0.008),
            fontSize: 16,
            color: "#4CAF50",
            fontWeight: 900,
            fontFamily: "monospace",
            textShadow: "1px 1px 0 #2E7D32",
            animation: `float ${2 + (i % 3) * 0.5}s ease-in-out ${b.delay}s infinite alternate`,
            zIndex: 15,
            imageRendering: "pixelated" as const,
          }}
        >
          $
        </div>
      ))}
    </>
  );
}

/* ───── Pixel Birds ───── */
function PixelBirds({ progress }: { progress: number }) {
  if (progress < 20 || progress > 50) return null;
  return (
    <>
      {[
        { x: 65, y: 18, s: 0.8 },
        { x: 72, y: 14, s: 1 },
        { x: 78, y: 20, s: 0.7 },
      ].map((bird, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${bird.x}%`,
            top: `${bird.y}%`,
            animation: `birdFly 1.2s ease-in-out ${i * 0.3}s infinite alternate`,
            zIndex: 10,
          }}
        >
          <svg
            width={12 * bird.s}
            height={8 * bird.s}
            viewBox="0 0 6 4"
            shapeRendering="crispEdges"
          >
            <rect x="0" y="0" width="1" height="1" fill="#333" />
            <rect x="1" y="1" width="1" height="1" fill="#333" />
            <rect x="2" y="2" width="1" height="1" fill="#333" />
            <rect x="3" y="2" width="1" height="1" fill="#333" />
            <rect x="4" y="1" width="1" height="1" fill="#333" />
            <rect x="5" y="0" width="1" height="1" fill="#333" />
          </svg>
        </div>
      ))}
    </>
  );
}

/* ───── Pixel Sunflowers ───── */
function PixelSunflowers({ parallaxX }: { parallaxX: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "6%",
        left: `calc(10% - ${parallaxX * 1.2}px)`,
        display: "flex",
        gap: 16,
        zIndex: 12,
        transition: "left 0.3s ease-out",
      }}
    >
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          width={20}
          height={32}
          viewBox="0 0 5 8"
          shapeRendering="crispEdges"
          style={{ imageRendering: "pixelated" as const }}
        >
          {/* Stem */}
          <rect x="2" y="4" width="1" height="4" fill="#388E3C" />
          <rect x="1" y="5" width="1" height="1" fill="#388E3C" />
          {/* Petals */}
          <rect x="1" y="0" width="3" height="1" fill="#FFC107" />
          <rect x="0" y="1" width="1" height="2" fill="#FFC107" />
          <rect x="4" y="1" width="1" height="2" fill="#FFC107" />
          <rect x="1" y="3" width="3" height="1" fill="#FFC107" />
          {/* Center */}
          <rect x="1" y="1" width="3" height="2" fill="#FF9800" />
          <rect x="2" y="1" width="1" height="2" fill="#795548" />
        </svg>
      ))}
    </div>
  );
}

/* ───── Pixel Trees ───── */
function PixelTree({
  x,
  bottom,
  size = 1,
  dark = false,
}: {
  x: number;
  bottom: number;
  size?: number;
  dark?: boolean;
}) {
  const fill1 = dark ? "#1B5E20" : "#2E7D32";
  const fill2 = dark ? "#2E7D32" : "#388E3C";
  const fill3 = dark ? "#388E3C" : "#66BB6A";
  const s = 6 * size;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: `${bottom}%`,
        imageRendering: "pixelated" as const,
        zIndex: 11,
      }}
    >
      <svg
        width={s * 5}
        height={s * 8}
        viewBox="0 0 5 8"
        shapeRendering="crispEdges"
      >
        {/* Trunk */}
        <rect x="2" y="6" width="1" height="2" fill="#795548" />
        {/* Foliage */}
        <rect x="1" y="4" width="3" height="2" fill={fill1} />
        <rect x="0" y="3" width="5" height="2" fill={fill2} />
        <rect x="1" y="1" width="3" height="2" fill={fill2} />
        <rect x="2" y="0" width="1" height="1" fill={fill3} />
        {/* Highlight */}
        <rect x="1" y="2" width="1" height="1" fill={fill3} />
      </svg>
    </div>
  );
}

/* ───── Pixel Runway ───── */
function PixelRunway() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "30%",
        width: 300,
        height: 20,
        zIndex: 14,
      }}
    >
      <svg
        width={300}
        height={20}
        viewBox="0 0 75 5"
        shapeRendering="crispEdges"
      >
        <rect x="0" y="1" width="75" height="3" fill="#546E7A" />
        {/* Dashed center line */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x={i * 8 + 1}
            y="2"
            width="4"
            height="1"
            fill="#FFF9C4"
          />
        ))}
        {/* Edge lines */}
        <rect x="0" y="0" width="75" height="1" fill="#FFFFFF" opacity="0.5" />
        <rect x="0" y="4" width="75" height="1" fill="#FFFFFF" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ───── Pixel Sun ───── */
function PixelSun({
  y,
  color,
  opacity,
}: {
  y: number;
  color: string;
  opacity: number;
}) {
  if (opacity < 0.05) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "70%",
        top: `${y}%`,
        opacity,
        transition: "top 0.8s ease-out, opacity 0.8s ease-out",
        zIndex: 1,
      }}
    >
      <svg
        width={56}
        height={56}
        viewBox="0 0 8 8"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" as const }}
      >
        <rect x="2" y="0" width="4" height="1" fill={color} />
        <rect x="1" y="1" width="6" height="1" fill={color} />
        <rect x="0" y="2" width="8" height="4" fill={color} />
        <rect x="1" y="6" width="6" height="1" fill={color} />
        <rect x="2" y="7" width="4" height="1" fill={color} />
      </svg>
    </div>
  );
}

/* ───── Main LandingPage ───── */
export function LandingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [boosted, setBoosted] = useState(false);
  const boostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setProgress((p) => Math.min(p + 15, 100));
    setBoosted(true);
    if (boostTimer.current) clearTimeout(boostTimer.current);
    boostTimer.current = setTimeout(() => setBoosted(false), 300);
  }, []);

  // Spacebar & touch
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [advance]);

  // Scroll wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setProgress((p) => Math.min(100, Math.max(0, p + e.deltaY * 0.08)));
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const v = getPhaseValues(progress);

  return (
    <div
      onClick={advance}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        background: `linear-gradient(to bottom, ${v.skyTop} 0%, ${v.skyMid} 50%, ${v.skyBot} 100%)`,
        transition: "background 0.8s ease-out",
        imageRendering: "auto",
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-10px) rotate(var(--rot, 0deg)); }
        }
        @keyframes birdFly {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-4px) translateX(6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Sun */}
      <PixelSun y={v.sunY} color={v.sunColor} opacity={v.sunOpacity} />

      {/* Stars */}
      {v.showStars && <PixelStars />}

      {/* Moon */}
      {v.showMoon && <PixelMoon />}

      {/* Clouds */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${-v.parallaxX * 0.15}px)`,
          transition: "transform 0.5s ease-out",
          zIndex: 2,
        }}
      >
        <PixelCloud x={10} y={10} size={1.2} />
        <PixelCloud x={35} y={6} size={1.5} />
        <PixelCloud x={65} y={12} size={1} />
        <PixelCloud x={85} y={5} size={1.3} />
      </div>

      {/* Far hills */}
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: `calc(0% - ${v.parallaxX * 0.3}px)`,
          width: "150%",
          height: "30%",
          backgroundColor: v.hillFar,
          clipPath: `polygon(
            0% 100%, 0% 80%,
            2% 80%, 2% 75%,
            4% 75%, 4% 70%,
            6% 70%, 6% 65%,
            8% 65%, 8% 60%,
            10% 60%, 10% 55%,
            12% 55%, 12% 50%,
            14% 50%, 14% 45%,
            16% 45%, 16% 40%,
            20% 40%, 20% 35%,
            24% 35%, 24% 30%,
            28% 30%, 28% 35%,
            30% 35%, 30% 40%,
            32% 40%, 32% 45%,
            35% 45%, 35% 50%,
            38% 50%, 38% 45%,
            40% 45%, 40% 40%,
            42% 40%, 42% 35%,
            45% 35%, 45% 30%,
            48% 30%, 48% 25%,
            50% 25%, 50% 20%,
            52% 20%, 52% 25%,
            55% 25%, 55% 30%,
            58% 30%, 58% 35%,
            60% 35%, 60% 40%,
            62% 40%, 62% 45%,
            65% 45%, 65% 50%,
            68% 50%, 68% 55%,
            70% 55%, 70% 50%,
            72% 50%, 72% 45%,
            75% 45%, 75% 40%,
            78% 40%, 78% 45%,
            80% 45%, 80% 50%,
            85% 50%, 85% 55%,
            90% 55%, 90% 60%,
            95% 60%, 95% 65%,
            100% 65%, 100% 100%
          )`,
          transition: "background-color 0.8s ease-out, left 0.3s ease-out",
          zIndex: 3,
        }}
      />

      {/* City Skyline */}
      <PixelSkyline parallaxX={v.parallaxX} showLights={v.showCityLights} />

      {/* Bridge */}
      <PixelBridge color={v.bridgeColor} parallaxX={v.parallaxX} />

      {/* Water */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: 0,
          width: "100%",
          height: "18%",
          backgroundColor: v.waterColor,
          transition: "background-color 0.8s ease-out",
          zIndex: 5,
        }}
      >
        {/* Water sparkles */}
        {!v.showStars &&
          Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${10 + i * 12}%`,
                top: `${30 + (i % 3) * 15}%`,
                width: 4,
                height: 2,
                backgroundColor: "#FFFFFF",
                opacity: 0.3,
                animation: `pulse 2s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}
      </div>

      {/* Near hills / ground */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: `calc(0% - ${v.parallaxX * 0.8}px)`,
          width: "160%",
          height: "16%",
          backgroundColor: v.hillNear,
          clipPath: `polygon(
            0% 100%, 0% 60%,
            3% 60%, 3% 50%,
            5% 50%, 5% 40%,
            8% 40%, 8% 30%,
            12% 30%, 12% 20%,
            15% 20%, 15% 25%,
            18% 25%, 18% 30%,
            22% 30%, 22% 35%,
            25% 35%, 25% 30%,
            28% 30%, 28% 25%,
            30% 25%, 30% 20%,
            33% 20%, 33% 15%,
            36% 15%, 36% 20%,
            40% 20%, 40% 25%,
            45% 25%, 45% 30%,
            50% 30%, 50% 35%,
            55% 35%, 55% 30%,
            58% 30%, 58% 25%,
            62% 25%, 62% 20%,
            65% 20%, 65% 25%,
            68% 25%, 68% 30%,
            72% 30%, 72% 35%,
            78% 35%, 78% 40%,
            85% 40%, 85% 45%,
            90% 45%, 90% 50%,
            95% 50%, 95% 55%,
            100% 55%, 100% 100%
          )`,
          transition: "background-color 0.8s ease-out, left 0.3s ease-out",
          zIndex: 10,
        }}
      />

      {/* Ground base */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "5%",
          backgroundColor: "#D4A574",
          zIndex: 10,
        }}
      />

      {/* Trees */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${-v.parallaxX * 0.9}px)`,
          transition: "transform 0.3s ease-out",
          zIndex: 11,
        }}
      >
        <PixelTree x={5} bottom={12} size={1.2} />
        <PixelTree x={15} bottom={14} size={0.9} dark />
        <PixelTree x={42} bottom={13} size={1.1} />
        <PixelTree x={55} bottom={11} size={1.3} dark />
        <PixelTree x={80} bottom={12} size={1} />
        <PixelTree x={92} bottom={14} size={0.8} dark />
      </div>

      {/* Sunflowers */}
      <PixelSunflowers parallaxX={v.parallaxX} />

      {/* Runway */}
      {v.showRunway && <PixelRunway />}

      {/* Money trail */}
      <MoneyTrail progress={progress} />

      {/* Birds */}
      <PixelBirds progress={progress} />

      {/* The Plane */}
      <PixelPlane y={v.planeY} boosted={boosted} isNight={v.showStars} />

      {/* Phase Text */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: "#FFFFFF",
            textShadow: "2px 2px 0 rgba(0,0,0,0.5), 4px 4px 0 rgba(0,0,0,0.2)",
            textTransform: "lowercase",
            margin: 0,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
            padding: "0 1rem",
          }}
        >
          {v.text}
        </p>
      </div>

      {/* CTA Button — Phase 5 */}
      {progress >= 80 && (
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 30,
            animation: "bounceIn 0.5s ease-out",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/play");
            }}
            style={{
              padding: "14px 36px",
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
              fontWeight: 700,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: "#FFFFFF",
              backgroundColor: "#4CAF50",
              border: "4px solid #2E7D32",
              borderRadius: 0,
              cursor: "pointer",
              textTransform: "lowercase",
              letterSpacing: "0.05em",
              boxShadow: `
                4px 4px 0 #2E7D32,
                -2px -2px 0 #66BB6A inset
              `,
              imageRendering: "pixelated" as const,
              outline: "none",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget.style.transform = "translate(2px, 2px)");
              (e.currentTarget.style.boxShadow = "2px 2px 0 #2E7D32, -2px -2px 0 #66BB6A inset");
            }}
            onMouseUp={(e) => {
              (e.currentTarget.style.transform = "translate(0, 0)");
              (e.currentTarget.style.boxShadow = "4px 4px 0 #2E7D32, -2px -2px 0 #66BB6A inset");
            }}
          >
            play burn.money →
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 6,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "#FFC107",
            transition: "width 0.3s ease-out",
            imageRendering: "pixelated" as const,
            boxShadow: "0 0 4px rgba(255,193,7,0.6)",
          }}
        />
      </div>

      {/* Hint text */}
      {progress < 10 && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 30,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
              textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
              letterSpacing: "0.05em",
              textTransform: "lowercase",
            }}
          >
            press spacebar / tap / scroll to fly
          </span>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
