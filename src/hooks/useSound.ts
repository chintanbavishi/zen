import { useCallback, useRef } from "react";

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

type SoundName = "chaching" | "heartbeat" | "sadpiano" | "crowd" | "whoosh";

function playSynth(name: SoundName) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  switch (name) {
    case "chaching": {
      // Two rising tones — cash register feel
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case "heartbeat": {
      // Double-beat low thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      // Second beat
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(55, now + 0.2);
      gain2.gain.setValueAtTime(0.3, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.35);
      break;
    }
    case "sadpiano": {
      // Descending sad notes: C4, B3, A3
      const notes = [261.6, 246.9, 220.0];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.4);
        gain.gain.setValueAtTime(0.2, now + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.4 + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 0.8);
      });
      break;
    }
    case "crowd": {
      // White noise burst shaped like a cheer
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2000, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(now);
      source.stop(now + 1.5);
      break;
    }
    case "whoosh": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
  }
}

export function useSound(name: SoundName) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const play = useCallback(() => {
    playSynth(name);
  }, [name]);

  const playLoop = useCallback((intervalMs: number) => {
    playSynth(name);
    intervalRef.current = setInterval(() => playSynth(name), intervalMs);
  }, [name]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { play, playLoop, stop };
}
