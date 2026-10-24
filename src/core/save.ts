import { abilityStones, stonesUsed } from './entity';
import { SUPPORTS } from '../data/jobs';
import type { GameState } from './state';
import { SAVE_VERSION } from './state';
const KEY = 'crystal-tower-save';
function storage(): Storage | null { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } }
export function save(s: GameState): void { const st = storage(); if (st) st.setItem(KEY, JSON.stringify(s)); }
export function load(): GameState | null {
  const st = storage(); if (!st) return null;
  const raw = st.getItem(KEY); if (!raw) return null;
  try { const s = JSON.parse(raw) as GameState; return migrate(s); } catch { return null; }
}
export function clear(): void { storage()?.removeItem(KEY); }
export function exportSave(s: GameState): string { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))); }
export function importSave(text: string): GameState | null {
  try { return migrate(JSON.parse(decodeURIComponent(escape(atob(text.trim()))))); } catch { return null; }
}
function migrate(s: GameState): GameState {
  // 魔石制への移行：容量を超えるサポートは後ろから外す（migrate末尾で実施）
  const trimStones = () => { for (const h of Object.values(s.heroes)) { h.equipped = (h.equipped ?? []).filter(k => SUPPORTS[k]); while (stonesUsed(h) > abilityStones(s, h) && h.equipped.length) h.equipped.pop(); } };
  if (!s.version) s.version = SAVE_VERSION;
  s.settings ??= { auto: true, speed: 2, autoGambit: true, hand: 'right' };
  s.settings.autoGambit ??= true;
  s.settings.hand ??= 'right';
  s.reserve ??= [];
  s.missions ??= { offers: [], active: [], completed: 0 };
  s.maxDepthEver ??= 0; s.superBosses ??= {}; s.autoModes ??= {};
  for (const m of s.monsters) m.grade ??= (m.rare ? 'rare' : 'normal');
  s.run.underground ??= false; s.run.undergroundWarps ??= []; s.run.maxDepth ??= 0;
  const CMD_MAP: Record<string, string> = { cmd_two_slash: 'two_slash', cmd_jump: 'jump', cmd_steal: 'steal', cmd_capture: 'capture', cmd_focus: 'focus', cmd_msword_fire: 'magic_sword_fire', white1: 'cure', white3: 'curaga', black1: 'fire', black3: 'fira' };
  for (const h of Object.values(s.heroes)) {
    h.learnedSkills ??= []; h.tomes ??= []; h.mastery ??= {}; h.spellMastery ??= {};
    h.equippedCmds = (h.equippedCmds ?? []).filter(c => !c.startsWith('cmd_'));
    for (const old of [...h.learned, ...h.equipped]) if (CMD_MAP[old] && !h.learnedSkills.includes(CMD_MAP[old])) h.learnedSkills.push(CMD_MAP[old]);
    h.learned = h.learned.filter(a => !CMD_MAP[a]); h.equipped = h.equipped.filter(a => !CMD_MAP[a]);
    for (const k of Object.keys(h.itemAp)) if (CMD_MAP[k]) { h.itemAp[CMD_MAP[k]] = h.itemAp[k]; delete h.itemAp[k]; }
  }
  trimStones();
  return s;
}
