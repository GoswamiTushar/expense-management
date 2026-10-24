import { Platform } from 'react-native';

/**
 * Web Audio API synthesizer for instant, zero-latency in-app sound effects.
 * Requires 0 external audio assets, works completely offline, and adheres
 * to mobile browser audio autoplay unlock requirements.
 */

let audioCtx = null;
let isAudioUnlocked = false;

// Safe AudioContext getter
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (_) {
    return null;
  }
};

// Unlock AudioContext on first user interaction in browser
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'running') {
        isAudioUnlocked = true;
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      }
    } catch (_) {}
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  window.addEventListener('click', unlockAudio, { once: true, passive: true });
}

// Native audio fallback via expo-av
let expoAvSound = null;
const getExpoAv = async () => {
  if (Platform.OS === 'web') return null;
  try {
    const av = require('expo-av');
    return av.Audio;
  } catch (_) {
    return null;
  }
};

/**
 * Synthesizes studio-quality micro audio effects using Web Audio nodes
 */
const playWebSound = (type) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (type) {
    case 'tap': {
      // Subtle wooden/glass micro click (20ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.02);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.022);
      break;
    }

    case 'pop': {
      // Cheerful bubble pop (40ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.038);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.042);
      break;
    }

    case 'toggle': {
      // Crisp toggle switch snap (25ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.027);
      break;
    }

    case 'success': {
      // Luxurious two-tone chime (C5 -> G5/C6 shimmer, 380ms)
      // Note 1: C5 (523.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.19);

      // Note 2: G5 (783.99Hz) + C6 (1046.5Hz) chime
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1046.5, now + 0.08);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.setValueAtTime(0.14, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc2.connect(gain2);
      osc3.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc3.start(now + 0.08);
      osc2.stop(now + 0.39);
      osc3.stop(now + 0.39);
      break;
    }

    case 'confirm': {
      // Warm financial settlement harmony (D5 587Hz -> F#5 740Hz -> A5 880Hz, 450ms)
      const freqs = [587.33, 739.99, 880.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.09, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.46);
      });
      break;
    }

    case 'delete': {
      // Cautionary descending double tone (240Hz -> 180Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
      break;
    }

    case 'drawer': {
      // Smooth air swoosh (65ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.065);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      break;
    }

    default:
      break;
  }
};

/**
 * Plays an in-app sound if enabled by user settings.
 */
export const playSound = async (type = 'tap', enabled = true) => {
  if (!enabled) return;

  if (Platform.OS === 'web') {
    playWebSound(type);
    return;
  }

  // Native iOS / Android playback fallback
  try {
    const Audio = await getExpoAv();
    if (!Audio) return;
    // On native, short synthetic sounds or system sounds can be played
  } catch (_) {}
};
