// BGM：WebAudio のマルチトラック・シーケンサ（リード／ハーモニー／アルペジオ／ベース／パッド／ドラム）
// 音源ファイルは不要。public/bgm/<曲名>.mp3|ogg があればそちらを優先して鳴らす。
type Osc = OscillatorType;
interface Voice { wave: Osc; vol: number; detune?: number; attack?: number; release?: number; vib?: number; cutoff?: number; pan?: number; sub?: boolean }
interface Track { voice: Voice; notes: Note[] }
type Note = [string | string[], number]; // [音名 | 和音 | '-', 拍]
interface Song { bpm: number; swing?: number; tracks: Record<string, Track>; drums?: { pattern: string; vol: number } }

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
function freq(n: string): number { const m = /^([A-G][#b]?)(\d)$/.exec(n); if (!m) return 440; const name = FLAT[m[1]] ?? m[1]; const i = NAMES.indexOf(name); const o = Number(m[2]); return 440 * Math.pow(2, (o - 4) + (i - 9) / 12); }
const seq = (s: string): Note[] => s.trim().split(/\s+/).filter(Boolean).map(tok => { const [n, d] = tok.split(':'); return [n.includes('+') ? n.split('+') : n, Number(d ?? 1)]; });
/** 和音記号 → 構成音（パッド用）。例 'Am7/3' = Am7 を第3オクターブで */
function chord(sym: string, oct = 3): string[] {
  const m = /^([A-G][#b]?)(m7b5|maj7|m7|7sus|7|m|sus4|dim|aug|add9)?$/.exec(sym); if (!m) return [];
  const root = NAMES.indexOf(FLAT[m[1]] ?? m[1]); const q = m[2] ?? '';
  const iv: Record<string, number[]> = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], '7sus': [0, 5, 7, 10], sus4: [0, 5, 7], dim: [0, 3, 6], aug: [0, 4, 8], m7b5: [0, 3, 6, 10], add9: [0, 4, 7, 14] };
  return (iv[q] ?? iv['']).map(s => { const n = root + s; return NAMES[n % 12] + (oct + Math.floor(n / 12)); });
}
const pad = (prog: string, beats: number, oct = 3): Note[] => prog.trim().split(/\s+/).map(c => [chord(c, oct), beats]);
/** アルペジオ：和音ごとに pattern（構成音インデックス、負で下のオクターブ、+4で上）を step 拍で */
function arp(prog: string, pattern: number[], step: number, beatsPerChord: number, oct = 3): Note[] {
  const out: Note[] = [];
  for (const c of prog.trim().split(/\s+/)) {
    const tones = chord(c, oct); if (!tones.length) continue;
    const n = Math.round(beatsPerChord / step);
    for (let i = 0; i < n; i++) { const p = pattern[i % pattern.length]; const base = tones[((p % tones.length) + tones.length) % tones.length]; const shift = Math.floor(p / tones.length); const m = /^([A-G]#?)(\d)$/.exec(base)!; out.push([m[1] + (Number(m[2]) + shift), step]); }
  }
  return out;
}
/** ベース：和音のルートで pattern（拍の長さ配列。負は休符） */
function bassLine(prog: string, pattern: number[], beatsPerChord: number, oct = 2, fifthEvery = 0): Note[] {
  const out: Note[] = [];
  prog.trim().split(/\s+/).forEach((c, ci) => { const tones = chord(c, oct); let acc = 0, i = 0; while (acc < beatsPerChord - 1e-6) { const d = pattern[i % pattern.length]; const useFifth = fifthEvery && ((i + 1) % fifthEvery === 0); out.push([d < 0 ? '-' : (useFifth ? tones[2] : tones[0]), Math.abs(d)]); acc += Math.abs(d); i++; } void ci; });
  return out;
}

const LEAD: Voice = { wave: 'square', vol: 0.055, detune: 6, attack: 0.01, release: 0.12, vib: 5, cutoff: 3200 };
const LEAD_SOFT: Voice = { wave: 'triangle', vol: 0.07, detune: 4, attack: 0.03, release: 0.25, vib: 4, cutoff: 2600 };
const LEAD_SAW: Voice = { wave: 'sawtooth', vol: 0.045, detune: 8, attack: 0.01, release: 0.1, vib: 4, cutoff: 2400 };
const HARM: Voice = { wave: 'triangle', vol: 0.035, attack: 0.02, release: 0.2, cutoff: 2000, pan: 0.3 };
const ARP: Voice = { wave: 'square', vol: 0.028, attack: 0.005, release: 0.08, cutoff: 2800, pan: -0.3 };
const ARP_SOFT: Voice = { wave: 'triangle', vol: 0.045, attack: 0.01, release: 0.2, cutoff: 2400, pan: -0.25 };
const BASS: Voice = { wave: 'triangle', vol: 0.09, attack: 0.005, release: 0.08, cutoff: 900, sub: true };
const BASS_SAW: Voice = { wave: 'sawtooth', vol: 0.06, attack: 0.005, release: 0.06, cutoff: 700, sub: true };
const PAD: Voice = { wave: 'sawtooth', vol: 0.016, detune: 10, attack: 0.6, release: 0.8, cutoff: 1100 };
const PAD_WARM: Voice = { wave: 'triangle', vol: 0.03, detune: 6, attack: 0.5, release: 0.9, cutoff: 1400 };

export const SONGS: Record<string, Song> = {
  // ───── タイトル：分散和音が静かに昇っていく（70bpm、16分アルペジオ、8小節×2）
  title: (() => {
    const prog = 'Cmaj7 G Am7 Fmaj7 C Dm7 G7sus G7  Am7 Em7 Fmaj7 Cmaj7 Dm7 G7 Cmaj7 Cmaj7';
    return { bpm: 72, tracks: {
      arp: { voice: ARP_SOFT, notes: arp(prog, [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], 0.25, 4, 3) },
      lead: { voice: LEAD_SOFT, notes: seq('-:4 -:4 E5:3 D5:1 C5:4 -:2 E5:1 G5:1 A5:3 G5:1 F5:2 E5:2 D5:4 C5:2 E5:2 G5:3 F5:1 E5:2 C5:2 D5:4 -:2 E5:1 F5:1 G5:2 C6:2 B5:1 A5:1 G5:2 E5:4') },
      bass: { voice: BASS, notes: bassLine(prog, [4], 4, 2) },
      pad: { voice: PAD, notes: pad(prog, 4, 3) },
    } } as Song;
  })(),
  // ───── 拠点：3拍子のワルツ、温かいパッド（96bpm、16小節）
  hub: (() => {
    const prog = 'F C Dm Bb F C Gm C  F Am Bb Bbm F C F F';
    return { bpm: 100, tracks: {
      lead: { voice: LEAD_SOFT, notes: seq('A4:2 C5:1 E5:2 D5:1 D5:2 C5:1 D5:3 A4:2 C5:1 E5:2 D5:1 D5:1 C5:1 Bb4:1 C5:3 F5:2 E5:1 E5:2 C5:1 D5:2 F5:1 Db5:3 C5:2 A4:1 G4:2 B4:1 C5:3 -:3') },
      harm: { voice: HARM, notes: seq('-:3 -:3 -:3 -:3 -:3 -:3 -:3 -:3  F4:3 E4:3 D4:3 Db4:3 C4:3 Bb3:1 C4:1 D4:1 A3:3 -:3') },
      arp: { voice: ARP_SOFT, notes: arp(prog, [0, 2, 4, 2, 1, 2], 0.5, 3, 3) },
      bass: { voice: BASS, notes: bassLine(prog, [1.5, 1.5], 3, 2) },
      pad: { voice: PAD_WARM, notes: pad(prog, 3, 3) },
    }, drums: { pattern: 'x..h..', vol: 0.5 } } as Song;
  })(),
  // ───── 通常戦闘：速い4/4、刻むベース、A/B構成（160bpm、16小節）
  battle: (() => {
    const prog = 'Dm Dm Bb C  Dm Dm Bb A  Gm Dm Gm A  Bb C Dm A';
    return { bpm: 162, swing: 0, tracks: {
      lead: { voice: LEAD, notes: seq('D5:.5 D5:.5 F5:.5 D5:.5 A5:1 G5:.5 F5:.5  E5:.5 D5:.5 E5:.5 F5:.5 E5:1 D5:.5 C5:.5  D5:.5 F5:.5 A5:.5 Bb5:.5 A5:1 G5:1  E5:.5 G5:.5 E5:.5 C5:.5 D5:2  D5:.5 D5:.5 F5:.5 D5:.5 A5:1 G5:.5 F5:.5  E5:.5 D5:.5 E5:.5 F5:.5 E5:1 D5:.5 C5:.5  D5:.5 F5:.5 A5:.5 Bb5:.5 A5:1 C6:1  C#5:.5 E5:.5 A5:.5 C#6:.5 E6:2  Bb5:.5 A5:.5 G5:.5 A5:.5 Bb5:1 D6:1  A5:.5 F5:.5 D5:.5 F5:.5 A5:2  G5:.5 Bb5:.5 D6:.5 Bb5:.5 G5:1 D5:1  E5:.5 C#5:.5 E5:.5 A5:.5 C#6:1 E6:1  F6:.5 D6:.5 Bb5:.5 D6:.5 F6:1 D6:1  E6:.5 C6:.5 G5:.5 C6:.5 E6:1 C6:1  D6:.5 A5:.5 F5:.5 A5:.5 D6:1 F6:1  E6:1 C#6:1 A5:1 E5:1') },
      harm: { voice: HARM, notes: seq('-:16 -:16 D5:4 D5:4 Bb4:4 A4:4  F5:2 D5:2 E5:2 C5:2 D5:4 A4:2 C#5:2') },
      bass: { voice: BASS_SAW, notes: bassLine(prog, [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], 4, 1, 4) },
      pad: { voice: PAD, notes: pad(prog, 4, 3) },
    }, drums: { pattern: 'x.h.s.h.x.h.s.hh', vol: 1 } } as Song;
  })(),
  // ───── ボス：重いオスティナート、半拍食いのドラム（138bpm、16小節）
  boss: (() => {
    const prog = 'Em Em C B7  Em Em C B7  Am Em F#dim B7  C D Em B7';
    return { bpm: 140, tracks: {
      lead: { voice: LEAD_SAW, notes: seq('E5:.5 E5:.5 G5:.5 E5:.5 B5:1 A5:.5 G5:.5  F#5:.5 G5:.5 F#5:.5 E5:.5 D#5:1 E5:1  C5:.5 E5:.5 G5:.5 C6:.5 B5:1 G5:1  F#5:.5 D#5:.5 B4:.5 D#5:.5 F#5:2  E5:.5 E5:.5 G5:.5 E5:.5 B5:1 A5:.5 G5:.5  F#5:.5 G5:.5 F#5:.5 E5:.5 D#5:1 E5:1  G5:.5 A5:.5 B5:.5 C6:.5 B5:1 A5:1  B5:1 D#6:1 F#6:2  A5:.5 C6:.5 E6:.5 C6:.5 A5:1 E5:1  G5:.5 B5:.5 E6:.5 B5:.5 G5:1 E5:1  F#5:.5 A5:.5 C6:.5 A5:.5 F#5:1 C6:1  B5:.5 D#6:.5 F#6:.5 D#6:.5 B5:2  C6:1 B5:.5 C6:.5 G5:1 E5:1  D6:1 C6:.5 D6:.5 A5:1 F#5:1  E6:1 G6:1 B5:1 E6:1  D#6:1 F#6:1 B5:2') },
      arp: { voice: ARP, notes: arp(prog, [0, 2, 1, 2], 0.5, 4, 3) },
      bass: { voice: BASS_SAW, notes: bassLine(prog, [0.75, 0.75, 0.5, 1, 1], 4, 1) },
      pad: { voice: PAD, notes: pad(prog, 4, 2) },
    }, drums: { pattern: 'x..x..s.x.x..xs.', vol: 1 } } as Song;
  })(),
  // ───── 裏タワー：遅く、半音でにじむ（104bpm、16小節）
  chaos: (() => {
    const prog = 'Cm Cm Ab G7  Cm Cm Ab G7  Fm Cm Db G7  Ab Bb Cm Cm';
    return { bpm: 104, tracks: {
      lead: { voice: LEAD_SOFT, notes: seq('G4:2 Ab4:1 G4:1 Eb4:4 C5:2 Bb4:1 C5:1 D5:1 B4:1 D5:1 F5:1 G4:2 Ab4:1 Bb4:1 C5:4 Eb5:2 C5:1 Ab4:1 D5:2 B4:2 F4:2 Ab4:1 C5:1 Eb5:4 Db5:2 F5:1 Ab5:1 G5:2 D5:2 Ab4:1 C5:1 Eb5:1 Ab5:1 F5:1 D5:1 Bb4:1 F5:1 Eb5:2 D5:1 C5:1 C5:4') },
      arp: { voice: ARP_SOFT, notes: arp(prog, [0, 1, 2, 1], 1, 4, 3) },
      bass: { voice: BASS, notes: bassLine(prog, [2, 1, 1], 4, 1) },
      pad: { voice: PAD, notes: pad(prog, 4, 2) },
    }, drums: { pattern: 'x.......x...h...', vol: 0.6 } } as Song;
  })(),
};

// ───── エンジン
let ctx: AudioContext | null = null;
let bus: { master: GainNode; dry: GainNode; delay: DelayNode; fb: GainNode; wet: GainNode; comp: DynamicsCompressorNode } | null = null;
let current: string | null = null; let timer: number | undefined; let enabled = true;
let cursors: Record<string, { i: number; t: number }> = {}; let drumT = 0, drumI = 0; let songStart = 0;
function ac(): AudioContext | null { try { ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)(); if (ctx.state === 'suspended') void ctx.resume(); return ctx; } catch { return null; } }
function ensureBus(a: AudioContext) {
  if (bus) return bus;
  const master = a.createGain(); master.gain.value = 1;
  const comp = a.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
  const dry = a.createGain(); dry.gain.value = 1;
  const delay = a.createDelay(1.0); delay.delayTime.value = 0.28; const fb = a.createGain(); fb.gain.value = 0.28; const wet = a.createGain(); wet.gain.value = 0.22;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  master.connect(dry).connect(comp); master.connect(delay); delay.connect(lp).connect(fb).connect(delay); delay.connect(wet).connect(comp); comp.connect(a.destination);
  bus = { master, dry, delay, fb, wet, comp }; return bus;
}
function playNote(a: AudioContext, out: AudioNode, f: number, t0: number, dur: number, v: Voice) {
  const g = a.createGain(); const atk = v.attack ?? 0.01, rel = v.release ?? 0.1;
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v.vol, t0 + atk); g.gain.setValueAtTime(v.vol, Math.max(t0 + atk, t0 + dur - rel * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
  let dest: AudioNode = g;
  if (v.cutoff) { const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.cutoff; lp.Q.value = 0.7; lp.connect(g); dest = lp; }
  if (v.pan && a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = v.pan; g.connect(p).connect(out); } else g.connect(out);
  const mk = (det: number, type: Osc, vol = 1) => { const o = a.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; if (v.vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = 5.5; lg.gain.value = v.vib; l.connect(lg).connect(o.detune); l.start(t0 + 0.08); l.stop(t0 + dur + rel + 0.1); } const og = a.createGain(); og.gain.value = vol; o.connect(og).connect(dest); o.start(t0); o.stop(t0 + dur + rel + 0.05); };
  if (v.detune) { mk(-v.detune, v.wave, 0.6); mk(v.detune, v.wave, 0.6); } else mk(0, v.wave);
  if (v.sub) { const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = f / 2; const sg = a.createGain(); sg.gain.value = 0.7; o.connect(sg).connect(dest); o.start(t0); o.stop(t0 + dur + rel + 0.05); }
}
function drum(a: AudioContext, out: AudioNode, kind: string, t0: number, vol: number) {
  if (kind === 'x') { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(160, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.11); g.gain.setValueAtTime(0.22 * vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16); o.connect(g).connect(out); o.start(t0); o.stop(t0 + 0.18); }
  else { const n = Math.floor(a.sampleRate * (kind === 's' ? 0.14 : 0.04)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, kind === 's' ? 1.5 : 3); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = kind === 's' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 's' ? 1800 : 7000; const g = a.createGain(); g.gain.value = (kind === 's' ? 0.16 : 0.05) * vol; s.connect(f).connect(g).connect(out); s.start(t0); if (kind === 's') { const o = a.createOscillator(), og = a.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(120, t0 + 0.08); og.gain.setValueAtTime(0.1 * vol, t0); og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1); o.connect(og).connect(out); o.start(t0); o.stop(t0 + 0.12); } }
}
function schedule() {
  const a = ac(); if (!a || !current || !bus) return;
  const song = SONGS[current]; const beat = 60 / song.bpm; const horizon = a.currentTime + 0.5;
  for (const [name, tr] of Object.entries(song.tracks)) {
    const c = cursors[name]; const total = tr.notes.reduce((s, n) => s + n[1], 0);
    while (c.t < horizon) {
      const [n, d] = tr.notes[c.i % tr.notes.length]; const dur = d * beat;
      const swing = song.swing && (c.i % 2 === 1) ? song.swing * beat : 0;
      if (n !== '-') for (const nn of Array.isArray(n) ? n : [n]) playNote(a, bus.master, freq(nn), c.t + swing, dur * (name === 'pad' ? 1.0 : 0.92), tr.voice);
      c.t += dur; c.i++;
      if (c.i % tr.notes.length === 0) c.t = songStart + Math.round((c.t - songStart) / (total * beat)) * total * beat; // ループ境界で位相を合わせる
    }
  }
  if (song.drums) { while (drumT < horizon) { const k = song.drums.pattern[drumI % song.drums.pattern.length]; if (k !== '.') drum(a, bus.master, k, drumT, song.drums.vol); drumT += beat / 4; drumI++; } }
}
// ───── 音声ファイル優先
const fileCache: Record<string, HTMLAudioElement | null | 'checking'> = {}; let fileAudio: HTMLAudioElement | null = null;
function tryFile(name: string): HTMLAudioElement | null | 'checking' {
  if (fileCache[name] !== undefined) return fileCache[name];
  fileCache[name] = 'checking'; let pending = 2;
  for (const ext of ['mp3', 'ogg']) {
    const au = new Audio(`./bgm/${name}.${ext}`); au.loop = true; au.volume = 0.35; au.preload = 'auto';
    au.addEventListener('canplaythrough', () => { if (fileCache[name] === 'checking') { fileCache[name] = au; if (current === name && enabled) { stopSynth(); fileAudio = au; void au.play().catch(() => {}); } } }, { once: true });
    au.addEventListener('error', () => { if (--pending === 0 && fileCache[name] === 'checking') fileCache[name] = null; }, { once: true });
  }
  return 'checking';
}
function stopSynth() {
  if (timer) { clearInterval(timer); timer = undefined; }
  if (bus && ctx) { const b = bus; const t = ctx.currentTime; b.master.gain.cancelScheduledValues(t); b.master.gain.setValueAtTime(b.master.gain.value, t); b.master.gain.linearRampToValueAtTime(0.0001, t + 0.35); bus = null; setTimeout(() => { try { b.master.disconnect(); b.comp.disconnect(); } catch { /* noop */ } }, 700); }
}
export function playBgm(name: string | null) {
  if (name === current) return;
  stopBgm();
  if (!name || !enabled || !SONGS[name]) return;
  current = name;
  const f = tryFile(name);
  if (f && f !== 'checking') { fileAudio = f; f.currentTime = 0; void f.play().catch(() => {}); return; }
  const a = ac(); if (!a) return;
  const b = ensureBus(a); const t0 = a.currentTime + 0.08; songStart = t0;
  cursors = Object.fromEntries(Object.keys(SONGS[name].tracks).map(k => [k, { i: 0, t: t0 }])); drumT = t0; drumI = 0;
  b.master.gain.setValueAtTime(0.0001, a.currentTime); b.master.gain.linearRampToValueAtTime(1, a.currentTime + 0.8);
  schedule(); timer = window.setInterval(schedule, 120);
}
export function stopBgm() { stopSynth(); if (fileAudio) { const au = fileAudio; fileAudio = null; au.pause(); } current = null; }
export function setBgmEnabled(on: boolean) { enabled = on; if (!on) stopBgm(); }
export function currentBgm() { return current; }
