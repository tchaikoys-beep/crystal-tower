// 効果音：WebAudio で合成するチップチューン風SE（音源ファイル不要）
let ctx: AudioContext | null = null;
let enabled = true;
export function setSfxEnabled(on: boolean) { enabled = on; }
export function sfxEnabled() { return enabled; }
function ac(): AudioContext | null {
  if (!enabled) return null;
  try { ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)(); if (ctx.state === 'suspended') void ctx.resume(); return ctx; } catch { return null; }
}
function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08, slide = 0, delay = 0) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  const t0 = a.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur: number, vol = 0.12, lowpass = 1800, delay = 0) {
  const a = ac(); if (!a) return;
  const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
  const g = a.createGain(); g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + delay);
}
export const SFX = {
  cursor: () => tone(880, 0.04, 'square', 0.04),
  confirm: () => { tone(660, 0.05, 'square', 0.05); tone(990, 0.08, 'square', 0.05, 0, 0.05); },
  cancel: () => tone(330, 0.08, 'square', 0.05, -120),
  hit: () => { noise(0.08, 0.14, 1600); tone(180, 0.08, 'triangle', 0.08, -100); },
  crit: () => { noise(0.14, 0.2, 2600); tone(120, 0.16, 'sawtooth', 0.1, -80); tone(1200, 0.1, 'square', 0.05, 400, 0.02); },
  miss: () => tone(500, 0.1, 'sine', 0.04, -300),
  magic: (el?: string) => {
    switch (el) {
      case 'fire': noise(0.25, 0.1, 900); tone(220, 0.3, 'sawtooth', 0.06, 300); break;
      case 'ice': tone(1800, 0.25, 'sine', 0.06, -900); tone(2400, 0.2, 'sine', 0.04, -1200, 0.05); break;
      case 'thunder': noise(0.06, 0.25, 6000); tone(1500, 0.12, 'square', 0.08, -1300, 0.02); break;
      case 'water': tone(400, 0.3, 'sine', 0.06, 500); tone(600, 0.25, 'sine', 0.04, 400, 0.08); break;
      case 'wind': noise(0.35, 0.08, 1200); break;
      case 'earth': noise(0.3, 0.2, 400); tone(80, 0.3, 'triangle', 0.1, -40); break;
      case 'holy': [660, 880, 1320].forEach((f, i) => tone(f, 0.35, 'sine', 0.05, 0, i * 0.06)); break;
      case 'dark': tone(220, 0.4, 'sawtooth', 0.06, -150); tone(165, 0.4, 'sawtooth', 0.04, -100, 0.05); break;
      default: tone(900, 0.2, 'square', 0.05, 600); tone(1200, 0.15, 'square', 0.04, 800, 0.08);
    }
  },
  heal: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'sine', 0.05, 0, i * 0.06)),
  status: () => tone(700, 0.2, 'square', 0.04, -400),
  limit: () => { noise(0.3, 0.15, 3000); [440, 554, 659, 880].forEach((f, i) => tone(f, 0.25, 'square', 0.06, 0, i * 0.05)); },
  capture: () => [880, 1100, 1320, 1760].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.07)),
  victory: () => { const m = [523, 523, 523, 523, 415, 466, 523, 466, 523]; const d = [0.12, 0.12, 0.12, 0.36, 0.36, 0.36, 0.24, 0.12, 0.6]; let t = 0; m.forEach((f, i) => { tone(f, d[i] * 0.95, 'square', 0.06, 0, t); tone(f / 2, d[i] * 0.95, 'triangle', 0.04, 0, t); t += d[i]; }); },
  defeat: () => [392, 349, 311, 262].forEach((f, i) => tone(f, 0.4, 'triangle', 0.06, -20, i * 0.3)),
  levelup: () => [659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.15, 'square', 0.05, 0, i * 0.08)),
  treasure: () => [1047, 1319, 1568].forEach((f, i) => tone(f, 0.12, 'square', 0.05, 0, i * 0.08)),
  flee: () => { for (let i = 0; i < 6; i++) tone(600 - i * 60, 0.05, 'square', 0.04, 0, i * 0.05); },
};
/** ボタンの押下音を全画面で鳴らす（戻る・やめる・外す系はキャンセル音） */
export function installUiSounds(root: HTMLElement) {
  root.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('button'); if (!b || b.disabled) return;
    const t = b.textContent ?? '';
    if (/戻る|やめる|たたむ|閉じる|外す|破棄|もどる/.test(t)) SFX.cancel(); else SFX.confirm();
  });
}
