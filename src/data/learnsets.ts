// モンスターのレベルアップ習得表（ポケモン式）
// 171種を手書きしない代わりに、種族（family）・役割（role）・耐性・種族名ハッシュから決定的に生成する。
// 色違いは基礎種の表を引き継ぐ（固有技だけが違う）。
import type { MonsterDef } from '../core/types';
import { SKILLS } from './skills';
import { hashStr } from '../core/rng';

export interface LearnEntry { lv: number; skill: string }

const FAMILY: Record<string, LearnEntry[]> = {
  beast: [{ lv: 6, skill: 'bite' }, { lv: 18, skill: 'quake_stomp' }, { lv: 34, skill: 'brave_slash_m' }],
  bird: [{ lv: 6, skill: 'wing_attack' }, { lv: 16, skill: 'blind_dust' }, { lv: 30, skill: 'white_wind' }, { lv: 44, skill: 'aero' }],
  dragon: [{ lv: 8, skill: 'flame' }, { lv: 22, skill: 'dark_wave' }, { lv: 45, skill: 'megaflare' }],
  undead: [{ lv: 6, skill: 'drain_touch' }, { lv: 18, skill: 'curse' }, { lv: 40, skill: 'dark_flare' }],
  demon: [{ lv: 10, skill: 'mind_blast' }, { lv: 20, skill: 'curse' }, { lv: 42, skill: 'gravija' }],
  amorph: [{ lv: 8, skill: 'aqua_breath' }, { lv: 20, skill: 'self_heal' }, { lv: 38, skill: 'mighty_guard' }],
  aquatic: [{ lv: 6, skill: 'aqua_breath' }, { lv: 16, skill: 'sleep_gas' }, { lv: 28, skill: 'tidal_wave' }],
  plant: [{ lv: 6, skill: 'needles' }, { lv: 20, skill: 'bad_breath' }, { lv: 32, skill: 'poison_breath' }],
  elemental: [{ lv: 6, skill: 'flame' }, { lv: 14, skill: 'self_destruct' }, { lv: 30, skill: 'meteor_strike' }, { lv: 50, skill: 'flare' }],
  machine: [{ lv: 8, skill: 'laser' }, { lv: 20, skill: 'thunder_breath' }, { lv: 36, skill: 'mighty_guard' }],
  giant: [{ lv: 6, skill: 'quake_stomp' }, { lv: 24, skill: 'meteor_strike' }, { lv: 40, skill: 'brave_slash_m' }],
  human: [{ lv: 10, skill: 'brave_slash_m' }, { lv: 18, skill: 'blind_dust' }, { lv: 36, skill: 'holy_light' }],
};
const ROLE: Record<string, LearnEntry[]> = {
  attacker: [{ lv: 26, skill: 'brave_slash_m' }, { lv: 52, skill: 'meteor_strike' }],
  blocker: [{ lv: 5, skill: 'shell_guard' }, { lv: 30, skill: 'mighty_guard' }, { lv: 48, skill: 'protect' }],
  healer: [{ lv: 8, skill: 'white_wind' }, { lv: 16, skill: 'self_heal' }, { lv: 28, skill: 'cura' }, { lv: 46, skill: 'holy_light' }],
  jammer: [{ lv: 7, skill: 'sleep_gas' }, { lv: 15, skill: 'silence_song' }, { lv: 33, skill: 'stone_gaze' }, { lv: 50, skill: 'slowga' }],
  support: [{ lv: 12, skill: 'white_wind' }, { lv: 24, skill: 'haste' }, { lv: 38, skill: 'blaster' }, { lv: 55, skill: 'hastega' }],
};
// 魔力型（mag倍率1.3以上）は吸収属性に合わせた黒魔法を覚える
const ELEM_SPELLS: Record<string, [string, string, string]> = {
  fire: ['fire', 'fira', 'firaga'], ice: ['blizzard', 'blizzara', 'blizzaga'], thunder: ['thunder', 'thundara', 'thundaga'],
  water: ['water', 'water', 'tidal_wave'], wind: ['aero', 'aero', 'tornado'], earth: ['stone', 'stone', 'quake_stomp'], poison: ['bio', 'bio', 'poison_breath'], dark: ['dark_wave', 'dark_flare', 'dark_flare'], holy: ['holy_light', 'holy_light', 'holy'],
};
// 固有技と被って表が薄い種族への補充
const GENERIC: LearnEntry[] = [{ lv: 14, skill: 'blind_dust' }, { lv: 27, skill: 'sleep_gas' }, { lv: 41, skill: 'self_heal' }, { lv: 56, skill: 'mighty_guard' }, { lv: 70, skill: 'gravija' }];
const cache = new Map<string, LearnEntry[]>();
export function learnsetFor(def: MonsterDef, baseId?: string): LearnEntry[] {
  const key = baseId ?? def.id;
  const hit = cache.get(key); if (hit) return hit;
  const h = hashStr('learn:' + key);
  const jit = (lv: number, i: number) => Math.max(2, lv + (((h >>> (i * 3)) % 7) - 3));
  const raw: LearnEntry[] = [...(FAMILY[def.family] ?? FAMILY.beast), ...(ROLE[def.role] ?? [])];
  if ((def.mult.mag ?? 1) >= 1.3) {
    const absorb = Object.entries(def.resist ?? {}).find(([, v]) => v === -1)?.[0];
    const els = Object.keys(ELEM_SPELLS);
    const el = absorb && ELEM_SPELLS[absorb] ? absorb : els[h % els.length];
    const [a, b, c] = ELEM_SPELLS[el];
    raw.push({ lv: 12, skill: a }, { lv: 32, skill: b }, { lv: 58, skill: c });
  }
  const seen = new Set<string>(def.skills);
  const out: LearnEntry[] = [];
  raw.forEach((e, i) => { if (!SKILLS[e.skill] || seen.has(e.skill)) return; seen.add(e.skill); out.push({ lv: jit(e.lv, i), skill: e.skill }); });
  for (const e of GENERIC) { if (out.length >= 4) break; if (seen.has(e.skill)) continue; seen.add(e.skill); out.push({ lv: jit(e.lv, out.length), skill: e.skill }); }
  out.sort((a, b) => a.lv - b.lv);
  const res = out.slice(0, 8);
  cache.set(key, res);
  return res;
}
