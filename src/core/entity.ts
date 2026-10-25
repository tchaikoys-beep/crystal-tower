// 英雄・仲間・敵を「戦闘体（Combatant）」に変換する
import type { Element, Status, Stats, Skill, Slot, ItemInstance, AffixRoll, MonsterRole } from './types';
import { STAT_KEYS, ELEMENTS, SLOTS } from './types';
import type { GameState, HeroState, MonsterAlly, Gambit } from './state';
import { heroBase, enemyBase, equipLevelReq, itemPowerMult, masteryLevel } from './formulas';
import { HEROES, JOBS, COMMANDS, SUPPORTS, jobOfCommand } from '../data/jobs';
import { ITEMS } from '../data/items';
import { AFFIXES, SETS } from '../data/affixes';
import { MONSTERS } from '../data/monsters';
import { SKILLS, skillsOfCategory } from '../data/skills';

export interface Mods {
  crit: number; multi: number; pierce: number; vamp: number; regen: number;
  elementDmg: Partial<Record<Element, number>>;
  slayer: Record<string, number>;
  inflict: { status: Status; chance: number }[];
  resist: Partial<Record<Element, number>>;   // 被ダメ倍率（1=通常）
  statusRes: Partial<Record<Status, number>>; // 0..1 無効率
  evasion: number; first: number;
  steal: number; gil: number; exp: number; abp: number; drop: number; capture: number; tp: number;
  heal: number; brave: boolean; genji: boolean; hermes: boolean; phoenix: boolean; cactuar: number;
  spellMastery: Record<string, number>;
  magicBarrier: number; // 魔法被ダメ軽減率
  allResist: number;    // 全属性被ダメ倍率
}
export function emptyMods(): Mods {
  return { crit: 0.05, multi: 0, pierce: 0, vamp: 0, regen: 0, elementDmg: {}, slayer: {}, inflict: [], resist: {}, statusRes: {}, evasion: 0.03, first: 0,
    steal: 0, gil: 0, exp: 0, abp: 0, drop: 0, capture: 0, tp: 0, heal: 0, brave: false, genji: false, hermes: false, phoenix: false, cactuar: 0, spellMastery: {}, magicBarrier: 0, allResist: 1 };
}
export interface Command { id: string; name: string; skill: Skill; group: string }
export interface Combatant {
  uid: string;
  name: string;
  side: 'player' | 'enemy';
  kind: 'hero' | 'ally' | 'enemy';
  ref: string;
  spriteId: string;   // 絵の検索キー（英雄id／種族id）
  level: number;
  stats: Stats;
  hp: number; mp: number;
  atb: number;
  statuses: Partial<Record<Status, number>>;
  atk: number; def: number; mdef: number;
  weaponElement: Element | null;
  weaponType: string | null;
  mods: Mods;
  commands: Command[];
  gambits: Gambit[];
  family: string;
  boss: boolean;
  midboss: boolean;
  captureRate: number;
  defending: number;   // 0 なし 0.5 半減 1 無効
  focus: number;       // ためる倍率
  limit: number;       // 0..100
  limitSkill: string | null;
  supports: Set<string>;
  role: MonsterRole | null;
  color: string;
  kills: number;
  phoenixUsed: boolean;
  captured: boolean;
  fledAway: boolean;
  onceUsed?: Set<number>;
  elite: boolean;     // 強個体（＋）または守護者
  learner: boolean;   // 青魔法をラーニングできる
}
export const isAlive = (c: Combatant) => c.hp > 0 && !c.captured && !c.fledAway;

function mulStats(base: Stats, m: Partial<Stats>): Stats {
  const r = { ...base };
  for (const k of STAT_KEYS) r[k] = r[k] * (m[k] ?? 1);
  return r;
}
export function boardCount(s: GameState, id: string): number { return s.board[id] ?? 0; }
export function boardValue(s: GameState, tag: string): number {
  // tag ごとの合計値
  let v = 0;
  for (const [id, n] of Object.entries(s.board)) {
    const node = BOARD_INDEX[id];
    if (node && node.effect.tag === tag) v += node.effect.value * n;
  }
  return v;
}
import { BOARD } from '../data/board';
const BOARD_INDEX: Record<string, (typeof BOARD)[number]> = Object.fromEntries(BOARD.map(b => [b.id, b]));

export function itemOf(s: GameState, uid: string | null): ItemInstance | undefined {
  if (!uid) return undefined;
  return s.inventory.find(i => i.uid === uid);
}
export function affixVal(roll: AffixRoll): number { return roll.value; }

export function applyAffixes(mods: Mods, stats: Stats, affixes: AffixRoll[], out: { atkPct: number; magPct: number; defPct: number; mdefPct: number }): void {
  for (const r of affixes) {
    const a = AFFIXES[r.id]; if (!a) continue;
    const v = r.value;
    switch (a.id) {
      case 'strong': out.atkPct += v; break;
      case 'sage': out.magPct += v; break;
      case 'crit': mods.crit += v; break;
      case 'multi': mods.multi += v; break;
      case 'pierce': mods.pierce += v; break;
      case 'sturdy': out.defPct += v; break;
      case 'warded': out.mdefPct += v; break;
      case 'vital': stats.hp *= 1 + v; break;
      case 'arcane': stats.mp *= 1 + v; break;
      case 'evasive': mods.evasion += v; break;
      case 'swift': stats.spd *= 1 + v; break;
      case 'first': mods.first += v; break;
      case 'regen': mods.regen += v; break;
      case 'vamp': mods.vamp += v; break;
      case 'thief': mods.steal += v; break;
      case 'merchant': mods.gil += v; break;
      case 'scholar': mods.exp += v; break;
      case 'master': mods.abp += v; break;
      case 'lucky': mods.drop += v; break;
      case 'tamer': mods.capture += v; break;
      case 'reborn': mods.tp += v; break;
      case 'm_hp': stats.hp *= 1 + v; break;
      case 'm_atk': out.atkPct += v; break;
      case 'm_mag': out.magPct += v; break;
      case 'm_def': out.defPct += v; out.mdefPct += v * 0.5; break;
      case 'm_spd': stats.spd *= 1 + v; break;
      case 'm_regen': mods.regen += v; break;
      case 'm_crit': mods.crit += v; break;
      case 'm_eva': mods.evasion += v; break;
      case 'm_barrier': mods.magicBarrier += v; break;
      case 'm_allres': mods.allResist *= 1 - v; break;
      case 'm_growth': mods.exp += v; break;
      case 'm_bond': break; // 絆計算側で参照
      default:
        if (a.cat === 'element' && a.element) { mods.elementDmg[a.element] = (mods.elementDmg[a.element] ?? 0) + v; }
        else if (a.cat === 'resist' && a.element) { mods.resist[a.element] = (mods.resist[a.element] ?? 1) * (1 - Math.min(1, v)); }
        else if (a.cat === 'resist' && a.status) { mods.statusRes[a.status] = Math.min(1, (mods.statusRes[a.status] ?? 0) + v); }
        else if (a.cat === 'slayer' && a.family) { mods.slayer[a.family] = (mods.slayer[a.family] ?? 0) + v; }
        else if (a.cat === 'status' && a.status) { mods.inflict.push({ status: a.status, chance: v }); }
    }
  }
}
function applySupports(supports: Set<string>, mods: Mods, stats: Stats, hasShield: boolean, out: { atkPct: number; magPct: number; defPct?: number; mdefPct?: number }): void {
  if (supports.has('hp10')) stats.hp *= 1.1;
  if (supports.has('hp20')) stats.hp *= 1.2;
  if (supports.has('hp30')) stats.hp *= 1.3;
  if (supports.has('mp10')) stats.mp *= 1.1;
  if (supports.has('mp20')) stats.mp *= 1.2;
  if (supports.has('mag_up')) stats.mag *= 1.2;
  if (supports.has('mag10')) stats.mag *= 1.1;
  if (supports.has('str10')) out.atkPct += 0.1;
  if (supports.has('vit10')) out.defPct = (out.defPct ?? 0) + 0.1;
  if (supports.has('spr10')) out.mdefPct = (out.mdefPct ?? 0) + 0.1;
  if (supports.has('spd10')) stats.spd *= 1.1;
  if (supports.has('crit10')) mods.crit += 0.1;
  if (supports.has('eva10')) mods.evasion += 0.1;
  if (supports.has('multi10')) mods.multi += 0.1;
  if (supports.has('vamp5')) mods.vamp += 0.05;
  if (supports.has('heal_up')) mods.heal += 0.25;
  if (supports.has('magic_barrier')) mods.magicBarrier += 0.2;
  if (supports.has('two_handed') && !hasShield) out.atkPct += 0.4;
  if (supports.has('dash')) mods.first += 0.2;
  if (supports.has('steal_up')) mods.steal += 0.3;
  if (supports.has('capture_up')) mods.capture += 0.5;
  if (supports.has('gil_up')) mods.gil += 0.3;
  if (supports.has('exp_up')) mods.exp += 0.3;
  if (supports.has('abp_up')) mods.abp += 0.3;
  if (supports.has('drop_up')) mods.drop += 0.2;
  for (const el of ['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'holy', 'dark'] as const) if (supports.has('res_' + el)) mods.resist[el] = (mods.resist[el] ?? 1) * 0.5;
  for (const st of ['poison', 'sleep', 'blind', 'silence', 'slow', 'paralyze', 'berserk'] as Status[]) if (supports.has('res_' + st)) mods.statusRes[st] = 1;
  if (supports.has('first_strike')) mods.first += 0.4;
  if (supports.has('ribbon')) for (const st of ['poison', 'sleep', 'slow', 'blind', 'silence', 'berserk', 'paralyze'] as Status[]) mods.statusRes[st] = 1;
}
export function canEquip(hs: HeroState, it: ItemInstance): { ok: boolean; reason?: string } {
  const base = ITEMS[it.base];
  const req = it.unsealed ? Math.ceil(equipLevelReq(it.tier) / 2) : equipLevelReq(it.tier);
  if (hs.level < req) return { ok: false, reason: `Lv${req}必要` };
  if (base.kind === 'weapon' && base.wtype) {
    const job = JOBS[hs.job];
    if (!job.weapons.includes(base.wtype)) return { ok: false, reason: `${job.name}は装備不可` };
  }
  return { ok: true };
}
export function slotForKind(kind: string): Slot[] {
  switch (kind) { case 'weapon': return ['weapon']; case 'shield': return ['shield']; case 'head': return ['head']; case 'body': return ['body']; case 'acc': return ['acc1', 'acc2']; }
  return [];
}
/** 装備中アイテムが持つ習得アビリティ（個体 learn 優先）。FF9式：装備している間は未習得でも使える */
export function learnOf(it: ItemInstance | null | undefined): { ability?: string; skill?: string; ap: number } | undefined { return it ? (it.learn ?? ITEMS[it.base].learn) : undefined; }
export function equipLearns(s: GameState, hs: HeroState): { abilities: string[]; skills: string[] } {
  const abilities: string[] = [], skills: string[] = [];
  for (const sl of SLOTS) { const l = learnOf(itemOf(s, hs.equip[sl])); if (!l) continue; if (l.ability) abilities.push(l.ability); if (l.skill) skills.push(l.skill); }
  return { abilities, skills };
}
/** 装備中アイテムの技＋覚えた青魔法（カテゴリ判定に使う追加技） */
export function heroExtraSkills(s: GameState, hs: HeroState): string[] { return [...equipLearns(s, hs).skills, ...(s.blueLearned ?? []), ...(s.summons ?? [])]; }
/** 魔石容量（FF9式）。Lvと転生ボードで増える */
export function abilityStones(s: GameState, hs: HeroState): number { return 6 + Math.floor(hs.level / 4) + boardValue(s, 'ability_slots') * 4 + (s.rebirths >= 3 ? 2 : 0); }
export function stonesUsed(hs: HeroState): number { return hs.equipped.reduce((a, k) => a + (SUPPORTS[k]?.cost ?? 0), 0); }
export function heroSupports(s: GameState, hs: HeroState): Set<string> {
  // セット中のサポート＋現ジョブで習得済みの分（FF5準拠で自動適用）＋装備中アイテムのアビリティ（FF9式、魔石不要）
  const set = new Set<string>(hs.equipped);
  const job = JOBS[hs.job];
  const jl = hs.jobs[hs.job]?.lv ?? 1;
  for (const l of job.learn) if (jl >= l.lv) set.add(l.ability);
  for (const a of equipLearns(s, hs).abilities) set.add(a);
  return set;
}
/** カテゴリ内で使える技：ジョブLvで解放した分＋装備から覚えた分 */
export function categorySkills(hs: HeroState, cat: string, extra: string[] = []): Skill[] {
  const out: Skill[] = [];
  const job = jobOfCommand(cat);
  const lv = job ? (hs.jobs[job.id]?.lv ?? 0) : 0;
  if (job) for (const u of job.unlocks) { const sk = SKILLS[u.skill]; if (!sk || lv < u.lv || out.includes(sk)) continue; if (sk.kind === 'spell' && (sk.level ?? 1) >= 4 && !(hs.tomes ?? []).includes(sk.id)) continue; out.push(sk); }
  for (const id of [...(hs.learnedSkills ?? []), ...extra]) { const sk = SKILLS[id]; if (sk && sk.category === cat && !out.includes(sk)) out.push(sk); }
  return out;
}
/** コマンド枠にセットできるカテゴリ（技を1つ以上持っているもの） */
export function availableCategories(hs: HeroState, extra: string[] = []): string[] {
  return Object.keys(COMMANDS).filter(cat => categorySkills(hs, cat, extra).length > 0);
}
export function heroCommands(s: GameState, hs: HeroState, _supports: Set<string>): Command[] {
  const extra = heroExtraSkills(s, hs);
  const cmds: Command[] = [{ id: 'attack', name: 'たたかう', skill: SKILLS.attack, group: 'basic' }];
  const job = JOBS[hs.job];
  const cats = [...(job.command ? [job.command] : []), ...(hs.equippedCmds ?? []).filter(c => c !== job.command)];
  for (const cat of cats) {
    const name = COMMANDS[cat]?.name ?? cat;
    for (const sk of categorySkills(hs, cat, extra)) if (!cmds.some(c => c.id === sk.id)) cmds.push({ id: sk.id, name: sk.name, skill: sk, group: name });
  }
  cmds.push({ id: 'defend', name: 'ぼうぎょ', skill: SKILLS.defend, group: 'basic' });
  return cmds;
}
export function blessingMult(s: GameState): Partial<Stats> & { heal?: number } {
  switch (s.blessing) {
    case 'wind': return { spd: 1.1 };
    case 'fire': return { str: 1.15, mag: 1.15, vit: 0.9, spr: 0.9 };
    case 'water': return { mp: 1.2, heal: 1.2 };
    case 'earth': return { vit: 1.15, spr: 1.15, spd: 0.9 };
  }
  return {};
}

export function buildHero(s: GameState, hs: HeroState): Combatant {
  const def = HEROES[hs.id];
  const job = JOBS[hs.job];
  let stats = mulStats(heroBase(hs.level), def.mult);
  stats = mulStats(stats, job.mult);
  if (hs.job === def.innateJob) stats = mulStats(stats, { hp: 1.2, mp: 1.2, str: 1.2, vit: 1.2, mag: 1.2, spr: 1.2, spd: 1.2, luck: 1.2 });
  const bless = blessingMult(s);
  stats = mulStats(stats, bless);
  const pct = boardValue(s, 'stat_pct');
  for (const k of STAT_KEYS) stats[k] *= 1 + pct;
  stats.hp *= 1 + boardValue(s, 'hp_pct');
  stats.mp *= 1 + boardValue(s, 'mp_pct');
  const mods = emptyMods();
  mods.heal = (bless.heal ?? 1) - 1;
  const out = { atkPct: 0, magPct: 0, defPct: 0, mdefPct: 0 };
  let weaponPower = 0, def_ = 0, mdef = 0;
  let weaponElement: Element | null = null;
  let weaponType: string | null = null;
  const supports = heroSupports(s, hs);
  const hasShield = !!hs.equip.shield;
  for (const slot of Object.keys(hs.equip) as Slot[]) {
    const it = itemOf(s, hs.equip[slot]);
    if (!it) continue;
    const base = ITEMS[it.base];
    const tierMult = itemPowerMult(it.found, it.tier);
    if (base.power) weaponPower += base.power * tierMult;
    if (base.def) def_ += base.def * tierMult;
    if (base.mdef) mdef += base.mdef * tierMult;
    if (base.element && slot === 'weapon') weaponElement = base.element;
    if (slot === 'weapon' && base.wtype) weaponType = base.wtype;
    if (base.stats) for (const [k, v] of Object.entries(base.stats)) stats[k as keyof Stats] += v as number;
    applyAffixes(mods, stats, it.affixes, out);
    if (it.unique === 'brave') mods.brave = true;
    if (it.unique === 'genji') mods.genji = true;
    if (it.unique === 'ribbon') supports.add('ribbon');
    if (it.unique === 'hermes') mods.hermes = true;
    if (it.unique === 'phoenix') mods.phoenix = true;
    if (it.unique === 'cactuar') mods.cactuar = 1000 * it.tier;
  }
  // セット効果
  const setCount: Record<string, number> = {};
  for (const slot of Object.keys(hs.equip) as Slot[]) { const it = itemOf(s, hs.equip[slot]); const st = it && ITEMS[it.base].set; if (st) setCount[st] = (setCount[st] ?? 0) + 1; }
  if ((setCount.mithril ?? 0) >= 3) stats.spd *= 1.15;
  if ((setCount.diamond ?? 0) >= 3) mods.magicBarrier = 0.3;
  if ((setCount.crystal ?? 0) >= 3) mods.allResist = 0.5;
  if ((setCount.genji ?? 0) >= 3) mods.multi += 0.3;
  if ((setCount.genji ?? 0) >= 4) mods.genji = true;
  if ((setCount.thief ?? 0) >= 3) { mods.steal += 0.3; mods.first += 0.2; }
  if ((setCount.thief ?? 0) >= 4) mods.drop += 0.2;
  if ((setCount.mage ?? 0) >= 3) stats.mag *= 1.15;
  if ((setCount.mage ?? 0) >= 4) supports.add('half_mp');
  if ((setCount.onion ?? 0) >= 3) { const f = (setCount.onion ?? 0) >= 4 ? 1.25 : 1.1; for (const k of STAT_KEYS) stats[k] *= f; }
  if (weaponPower === 0 && supports.has('brawl')) weaponPower = stats.str * 0.8;
  const wm = masteryLevel((hs.mastery ?? {})[weaponType ?? 'fist'] ?? 0);
  out.atkPct += 0.025 * wm; mods.crit += wm >= 16 ? 0.1 : 0;
  if (hasShield) mods.evasion += 0.01 * masteryLevel((hs.mastery ?? {}).shield ?? 0);
  mods.spellMastery = Object.fromEntries(Object.entries(hs.spellMastery ?? {}).map(([k, v]) => [k, masteryLevel(v)]));
  applySupports(supports, mods, stats, hasShield, out);
  for (const k of STAT_KEYS) stats[k] = Math.round(stats[k]);
  const atk = Math.round((weaponPower + stats.str * 0.5) * (1 + out.atkPct));
  stats.mag = Math.round(stats.mag * (1 + out.magPct));
  const c: Combatant = {
    uid: 'h:' + hs.id, name: def.name, side: 'player', kind: 'hero', ref: hs.id, spriteId: hs.id, level: hs.level,
    stats, hp: Math.min(hs.hp, stats.hp), mp: Math.min(hs.mp, stats.mp), atb: 0, statuses: {},
    atk, def: Math.round((def_ + stats.vit * 0.6) * (1 + out.defPct)), mdef: Math.round((mdef + stats.spr * 0.6) * (1 + out.mdefPct)),
    weaponElement, weaponType, mods, commands: heroCommands(s, hs, supports), gambits: hs.gambits, family: 'human', boss: false, midboss: false, captureRate: 0,
    defending: 0, focus: 1, limit: hs.limit, limitSkill: def.limit, supports, role: null, elite: false, learner: hs.job === 'bluemage' || supports.has('learning'), color: '#58f', kills: 0, phoenixUsed: false, captured: false, fledAway: false,
  };
  if (hs.hp <= 0) c.hp = 0;
  return c;
}

export function buildAlly(s: GameState, m: MonsterAlly): Combatant {
  const def = MONSTERS[m.id];
  let stats = mulStats(heroBase(m.level), def.mult);
  stats = mulStats(stats, m.iv);
  const bondMult = 1 + 0.02 * m.bond + (m.rare ? 0.2 : 0);
  stats = mulStats(stats, { hp: bondMult * 1.15, mp: bondMult, str: bondMult, vit: bondMult, mag: bondMult, spr: bondMult, spd: bondMult, luck: bondMult });
  for (const [k, v] of Object.entries(m.food)) stats[k as keyof Stats] += v as number;
  const pct = boardValue(s, 'stat_pct');
  for (const k of STAT_KEYS) stats[k] *= 1 + pct;
  const mods = emptyMods();
  const out = { atkPct: 0, magPct: 0, defPct: 0, mdefPct: 0 };
  applyAffixes(mods, stats, m.traits, out);
  let def_ = 0, mdef = 0;
  const acc = itemOf(s, m.acc);
  if (acc) {
    const base = ITEMS[acc.base];
    const tm = itemPowerMult(acc.found, acc.tier);
    if (base.def) def_ += base.def * tm; if (base.mdef) mdef += base.mdef * tm;
    if (base.stats) for (const [k, v] of Object.entries(base.stats)) stats[k as keyof Stats] += v as number;
    applyAffixes(mods, stats, acc.affixes, out);
  }
  for (const r of Object.entries(def.resist ?? {})) mods.resist[r[0] as Element] = r[1];
  // 役割ごとの常時効果（企画書 第7章）
  const supports = new Set<string>();
  switch (def.role) {
    case 'attacker': out.atkPct += 0.25; mods.multi += 0.10; break;
    case 'blocker': stats.hp *= 1.25; out.defPct += 0.15; supports.add('cover'); break;
    case 'healer': mods.heal += 0.3; supports.add('auto_regen'); stats.mp *= 1.3; break;
    case 'jammer': stats.spd *= 1.1; break; // 状態異常付与率×2は battle 側
    case 'support': mods.first += 0.2; mods.drop += 0.10; mods.exp += 0.10; break;
  }
  for (const k of STAT_KEYS) stats[k] = Math.round(stats[k]);
  const commands: Command[] = [{ id: 'attack', name: 'たたかう', skill: SKILLS.attack, group: 'basic' }];
  const innate = def.skills.filter((_, i) => i === 0 || m.bond >= 3 * (i + 1));
  const known = [...innate, ...(m.learned ?? []).filter(k => !innate.includes(k) && SKILLS[k])];
  const unlocked = (m.moves ? m.moves.filter(k => known.includes(k)) : known).slice(0, 4);
  for (const sk of unlocked) {
    const base = SKILLS[sk];
    const costed: Skill = { ...base, mp: Math.max(base.mp, base.effect === 'fixed' ? 20 : 8) };
    commands.push({ id: sk, name: base.name, skill: costed, group: '固有技' });
  }
  commands.push({ id: 'defend', name: 'ぼうぎょ', skill: SKILLS.defend, group: 'basic' });
  return {
    uid: 'm:' + m.uid, name: gradeMark(m.grade) + def.name, side: 'player', kind: 'ally', ref: m.uid, spriteId: m.id, level: m.level,
    stats, hp: Math.min(m.hp, stats.hp), mp: Math.min(m.mp, stats.mp), atb: 0, statuses: {},
    atk: Math.round((stats.str * 1.7 + 8 * m.level * 0.3) * (1 + out.atkPct)), def: Math.round((def_ + stats.vit * 0.7) * (1 + out.defPct)), mdef: Math.round((mdef + stats.spr * 0.7) * (1 + out.mdefPct)),
    weaponElement: null, weaponType: null, mods, commands, gambits: m.gambits, family: def.family, boss: false, midboss: false, captureRate: 0,
    defending: 0, focus: 1, limit: 0, limitSkill: null, supports, role: def.role, elite: false, learner: false, color: def.color, kills: 0, phoenixUsed: false, captured: false, fledAway: false,
  };
}

export function gradeMark(g: string | undefined): string { return g === 'plus_rare' ? '●＋' : g === 'rare' ? '●' : g === 'plus' ? '＋' : ''; }
export function buildEnemy(id: string, floor: number, idx: number, opts: { guardian?: boolean; midboss?: boolean; areaboss?: boolean; trialMult?: number; elite?: boolean } = {}): Combatant {
  const def = MONSTERS[id];
  let stats = mulStats(enemyBase(floor), def.mult);
  if (opts.elite) stats = mulStats(stats, { hp: 1.6, str: 1.3, mag: 1.3, vit: 1.2, spd: 1.1 });
  if (opts.guardian) stats = mulStats(stats, floor < 10 ? { hp: 1.3, str: 1.1 } : { hp: 1.6, str: 1.2, mag: 1.2 });
  if (opts.areaboss) stats = mulStats(stats, { hp: 1.3, str: 1.3, mag: 1.3 });
  if (opts.trialMult) stats = mulStats(stats, { hp: opts.trialMult, str: opts.trialMult, mag: opts.trialMult });
  for (const k of STAT_KEYS) stats[k] = Math.round(stats[k]);
  const mods = emptyMods();
  for (const r of Object.entries(def.resist ?? {})) mods.resist[r[0] as Element] = r[1];
  const commands: Command[] = [{ id: 'attack', name: 'たたかう', skill: SKILLS.attack, group: 'basic' }];
  for (const sk of def.skills) commands.push({ id: sk, name: SKILLS[sk].name, skill: SKILLS[sk], group: '固有技' });
  const boss = !!(def.boss || opts.midboss || opts.areaboss);
  return {
    uid: 'e:' + id + ':' + idx, name: (opts.elite ? '＋' : '') + def.name + (opts.guardian && !boss ? '（守護者）' : ''), side: 'enemy', kind: 'enemy', ref: id, spriteId: id, level: floor,
    stats, hp: stats.hp, mp: stats.mp, atb: 0, statuses: {},
    atk: Math.round(stats.str * 1.4), def: Math.round(stats.vit * 1.0), mdef: Math.round(stats.spr * 1.0),
    weaponElement: null, weaponType: null, mods, commands, gambits: [], family: boss ? 'boss' : def.family, boss, midboss: !!opts.midboss, captureRate: def.captureRate,
    defending: 0, focus: 1, limit: 0, limitSkill: null, supports: new Set(), role: def.role, elite: !!(opts.elite || (opts.guardian && !boss)), learner: false, color: def.color, kills: 0, phoenixUsed: false, captured: false, fledAway: false,
  };
}
export function elementMultiplier(target: Combatant, el: Element | null | undefined): number {
  if (!el || el === 'none') return 1;
  const r = target.mods.resist[el];
  const base = r === undefined ? 1 : r;
  return base > 0 ? base * target.mods.allResist : base; // -1 吸収, 0 無効, 0.5 半減, 2 弱点
}
export const ALL_ELEMENTS = ELEMENTS;

export function activeSets(s: GameState, hs: HeroState): string[] {
  const cnt: Record<string, number> = {};
  for (const slot of Object.keys(hs.equip) as Slot[]) { const it = itemOf(s, hs.equip[slot]); const st = it && ITEMS[it.base].set; if (st) cnt[st] = (cnt[st] ?? 0) + 1; }
  return Object.entries(cnt).filter(([id, n]) => n >= (SETS[id]?.pieces ?? 99)).map(([id]) => id);
}
