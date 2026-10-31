// BGM：WebAudio で鳴らすチップチューン風のループ曲（音源ファイル不要）。画面ごとに曲を切り替える
type Note = [string, number]; // [音名(休符は'-'), 拍]
interface Song { bpm: number; melody: Note[]; bass: Note[]; drums?: string; wave: OscillatorType; vol: number }
const FREQ: Record<string, number> = {};
{ const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; for (let o = 1; o <= 7; o++) names.forEach((n, i) => { FREQ[n + o] = 440 * Math.pow(2, (o - 4) + (i - 9) / 12); }); }
const seq = (s: string): Note[] => s.trim().split(/\s+/).map(tok => { const [n, d] = tok.split(':'); return [n, Number(d ?? 1)]; });
export const SONGS: Record<string, Song> = {
  // タイトル：ゆったりした上昇アルペジオ（6/8っぽく）
  title: { bpm: 96, wave: 'triangle', vol: 0.05,
    melody: seq('C4:.5 E4:.5 G4:.5 C5:.5 E5:.5 G5:.5 E5:.5 C5:.5  A3:.5 C4:.5 E4:.5 A4:.5 C5:.5 E5:.5 C5:.5 A4:.5  F3:.5 A3:.5 C4:.5 F4:.5 A4:.5 C5:.5 A4:.5 F4:.5  G3:.5 B3:.5 D4:.5 G4:.5 B4:.5 D5:.5 B4:.5 G4:.5'),
    bass: seq('C2:4 A1:4 F1:4 G1:4') },
  // 拠点：穏やかな4拍子
  hub: { bpm: 84, wave: 'triangle', vol: 0.045,
    melody: seq('E4:1 G4:1 A4:2  G4:1 E4:1 D4:2  C4:1 E4:1 G4:1 A4:1  G4:3 -:1  E4:1 G4:1 B4:2  A4:1 G4:1 E4:2  D4:1 E4:1 G4:1 E4:1  D4:3 -:1'),
    bass: seq('C2:2 G2:2 A1:2 E2:2 F1:2 C2:2 G1:2 D2:2 C2:2 G2:2 A1:2 E2:2 F1:2 C2:2 G1:4'), drums: 'x..x..x.x..x..x.' },
  // 通常戦闘：疾走感
  battle: { bpm: 150, wave: 'square', vol: 0.045,
    melody: seq('A4:.5 A4:.5 C5:.5 A4:.5 E5:1 D5:.5 C5:.5  B4:.5 B4:.5 D5:.5 B4:.5 F5:1 E5:.5 D5:.5  C5:.5 C5:.5 E5:.5 C5:.5 G5:1 F5:.5 E5:.5  D5:.5 E5:.5 F5:.5 E5:.5 D5:.5 C5:.5 B4:.5 G4:.5'),
    bass: seq('A1:.5 A1:.5 A2:.5 A1:.5 A1:.5 A1:.5 A2:.5 A1:.5 G1:.5 G1:.5 G2:.5 G1:.5 G1:.5 G1:.5 G2:.5 G1:.5 F1:.5 F1:.5 F2:.5 F1:.5 F1:.5 F1:.5 F2:.5 F1:.5 E1:.5 E1:.5 E2:.5 E1:.5 E1:.5 E1:.5 E2:.5 E1:.5'), drums: 'x.o.x.o.x.o.xxo.' },
  // ボス：重く緊張感
  boss: { bpm: 132, wave: 'sawtooth', vol: 0.04,
    melody: seq('D4:.5 D4:.5 F4:.5 D4:.5 G#4:1 G4:.5 F4:.5  D4:.5 D4:.5 F4:.5 D4:.5 A4:1 G#4:.5 G4:.5  A#4:.5 A4:.5 G4:.5 F4:.5 D#4:.5 D4:.5 C4:.5 D4:.5  A#3:1 C4:1 D4:2'),
    bass: seq('D1:1 D1:.5 D1:.5 D1:1 C1:1 D1:1 D1:.5 D1:.5 D1:1 C1:1 A#0:1 A#0:1 C1:1 C1:1 D1:2 D1:2'), drums: 'x..xx..xx.x.x.oo' },
  // 裏タワー：不穏
  chaos: { bpm: 112, wave: 'sawtooth', vol: 0.035,
    melody: seq('E4:1 F4:1 E4:1 D#4:1  E4:.5 G4:.5 B4:1 A#4:1 A4:1  E4:1 F4:1 E4:1 D#4:1  C5:.5 B4:.5 A#4:.5 A4:.5 G#4:1 E4:1'),
    bass: seq('E1:2 E1:2 F1:2 F1:2 E1:2 E1:2 C1:2 B0:2'), drums: 'x...x..ox...x.o.' },
};
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: string | null = null;
let timer: number | undefined;
let enabled = true;
let nextTime = 0; let mi = 0, bi = 0, di = 0, mT = 0, bT = 0, dT = 0;
function ac(): AudioContext | null { try { ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)(); if (!master) { master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination); } if (ctx.state === 'suspended') void ctx.resume(); return ctx; } catch { return null; } }
function note(freq: number, t0: number, dur: number, type: OscillatorType, vol: number) {
  const a = ac(); if (!a || !master) return;
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.setValueAtTime(vol, t0 + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}
function drum(kind: string, t0: number) {
  const a = ac(); if (!a || !master) return;
  if (kind === 'x') { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + 0.12); g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14); o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.16); }
  else if (kind === 'o') { const n = Math.floor(a.sampleRate * 0.06), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000; const g = a.createGain(); g.gain.value = 0.05; s.connect(f).connect(g).connect(master); s.start(t0); }
}
function schedule() {
  const a = ac(); if (!a || !current) return;
  const song = SONGS[current]; const beat = 60 / song.bpm;
  while (nextTime < a.currentTime + 0.4) {
    // 3トラックを独立に進める（最も近い次イベント時刻へ）
    const tNext = Math.min(mT, bT, song.drums ? dT : Infinity);
    nextTime = tNext;
    if (mT === tNext) { const [n, d] = song.melody[mi % song.melody.length]; if (n !== '-') note(FREQ[n], mT, d * beat * 0.9, song.wave, song.vol); mT += d * beat; mi++; }
    if (bT === tNext) { const [n, d] = song.bass[bi % song.bass.length]; if (n !== '-') note(FREQ[n], bT, d * beat * 0.95, 'triangle', song.vol * 1.3); bT += d * beat; bi++; }
    if (song.drums && dT === tNext) { const k = song.drums[di % song.drums.length]; if (k !== '.') drum(k, dT); dT += beat / 2; di++; }
  }
}
// 音声ファイルがあればそれを優先（public/bgm/<name>.mp3 または .ogg）。なければ合成曲
const fileCache: Record<string, HTMLAudioElement | null | 'checking'> = {};
let fileAudio: HTMLAudioElement | null = null;
function tryFile(name: string): HTMLAudioElement | null | 'checking' {
  if (fileCache[name] !== undefined) return fileCache[name];
  fileCache[name] = 'checking';
  for (const ext of ['mp3', 'ogg']) {
    const a = new Audio(`./bgm/${name}.${ext}`); a.loop = true; a.volume = 0.35; a.preload = 'auto';
    a.addEventListener('canplaythrough', () => { if (fileCache[name] === 'checking') { fileCache[name] = a; if (current === name && enabled) { stopSynth(); fileAudio = a; void a.play().catch(() => {}); } } }, { once: true });
    a.addEventListener('error', () => { if (ext === 'ogg' && fileCache[name] === 'checking') fileCache[name] = null; }, { once: true });
  }
  return 'checking';
}
function stopSynth() { if (timer) { clearInterval(timer); timer = undefined; } if (master && ctx) { const g = master; const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.25); master = null; setTimeout(() => { try { g.disconnect(); } catch { /* noop */ } }, 400); } }
export function playBgm(name: string | null) {
  if (name === current) return;
  stopBgm();
  if (!name || !enabled || !SONGS[name]) return;
  const f = tryFile(name);
  if (f && f !== 'checking') { current = name; fileAudio = f; f.currentTime = 0; void f.play().catch(() => {}); return; }
  const a = ac(); if (!a) return;
  current = name; mi = bi = di = 0; const t0 = a.currentTime + 0.05; mT = bT = dT = t0; nextTime = t0;
  if (master) { master.gain.cancelScheduledValues(a.currentTime); master.gain.setValueAtTime(0.0001, a.currentTime); master.gain.linearRampToValueAtTime(1, a.currentTime + 0.6); }
  schedule(); timer = window.setInterval(schedule, 150);
}
export function stopBgm() {
  stopSynth();
  if (fileAudio) { const a = fileAudio; fileAudio = null; a.pause(); }
  current = null;
}
export function setBgmEnabled(on: boolean) { enabled = on; if (!on) stopBgm(); }
export function currentBgm() { return current; }
