/**
 * Sound utility using Web Audio API.
 * Provides lightweight UI feedback sounds for button clicks, success, error, and notifications.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playClick() {
  playTone(800, 0.05, 'sine', 0.05);
}

export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Two ascending tones
  setTimeout(() => playTone(523, 0.1, 'sine', 0.06), 0);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.06), 80);
}

export function playError() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Two descending tones
  setTimeout(() => playTone(400, 0.12, 'square', 0.04), 0);
  setTimeout(() => playTone(300, 0.18, 'square', 0.04), 100);
}

export function playNotification() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Three quick ascending tones
  setTimeout(() => playTone(440, 0.08, 'sine', 0.05), 0);
  setTimeout(() => playTone(554, 0.08, 'sine', 0.05), 60);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.05), 120);
}
