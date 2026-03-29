import { useCallback, useRef } from "react";

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

type SoundName = "chaching" | "heartbeat" | "sadtrombone" | "crowd" | "whoosh" | "pop";

function playSynth(name: SoundName) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  switch (name) {
    case "chaching": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
      break;
    }
    case "pop": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
      break;
    }
    case "heartbeat": {
      [0, 0.2].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(offset === 0 ? 60 : 55, now + offset);
        gain.gain.setValueAtTime(offset === 0 ? 0.4 : 0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset); osc.stop(now + offset + 0.15);
      });
      break;
    }
    case "sadtrombone": {
      [200, 180, 160, 140].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + i * 0.3);
        gain.gain.setValueAtTime(0.15, now + i * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.3); osc.stop(now + i * 0.3 + 0.4);
      });
      break;
    }
    case "crowd": {
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
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(now); source.stop(now + 1.5);
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
      osc.start(now); osc.stop(now + 0.2);
      break;
    }
  }
}

export function useSound(name: SoundName) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const play = useCallback(() => playSynth(name), [name]);
  const playLoop = useCallback((ms: number) => {
    playSynth(name);
    intervalRef.current = setInterval(() => playSynth(name), ms);
  }, [name]);
  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);
  return { play, playLoop, stop };
}
