// ゲーム全体の状態遷移（拠点・塔・戦闘結果・転生）
import type { ItemInstance, Slot, Stats, Rarity } from './types';
import { SLOTS, STAT_KEYS } from './types';
import type { GameState, HeroState, MonsterAlly, Gambit, FloorEvent, RunState, Mission } from './state';
import { SAVE_VERSION } from './state';
import { Rng } from './rng';
import { Battle } from './battle';
import type { Combatant } from './entity';
import { buildHero, buildAlly, buildEnemy, canEquip, slotForKind, boardValue, itemOf, isAlive, learnOf } from './entity';
import { expToNext, abpToNext, MAX_LEVEL, MAX_JOB_LEVEL, isAreaBossFloor, isGateFloor, isWarpFloor, tierOf, masteryGain, affixValue } from './formulas';
import { rollDrops, generateItem, rollRarity, rollAffixes } from './loot';
import { generateFloor, generateUndergroundFloor, lawForFloor, lawBlock } from './tower';
import { computeTP, trialMult } from './rebirth';
import { recommendGambits } from './autogambit';
import type { AutoMode, AffixRoll } from './types';
import { learnsetFor } from '../data/learnsets';
import { HEROES, JOBS } from '../data/jobs';
import { ITEMS, tomeSpell, TOMES } from '../data/items';
import { MONSTERS, areaFor, SUPER_BOSSES, VARIANT_OF } from '../data/monsters';
import { AFFIXES } from '../data/affixes';

export function defaultGambits(kind: 'hero' | 'ally' | 'mage' | 'healer'): Gambit[] {
  if (kind === 'healer') return [
    { cond: 'ally_dead', action: 'skill:raise', on: true },
    { cond: 'ally_hp_lt_50', action: 'skill:cure', on: true },
    { cond: 'ally_bad_status', action: 'skill:esuna', on: true },
    { cond: 'enemy_weak', action: 'skill:holy', on: true },
    { cond: 'always', action: 'attack', on: true },
  ];
  if (kind === 'mage') return [
    { cond: 'ally_hp_lt_50', action: 'item:potion', on: true },
    { cond: 'enemy_weak', action: 'skill:fire', on: true },
    { cond: 'enemy_weak', action: 'skill:blizzard', on: true },
    { cond: 'enemy_weak', action: 'skill:thunder', on: true },
    { cond: 'mp_gt_30', action: 'skill:fire', on: true },
    { cond: 'always', action: 'attack', on: true },
  ];
  return [
    { cond: 'limit_ready', action: 'limit', on: true },
    { cond: 'enemy_capturable', action: 'item:magi_cage', on: true },
    { cond: 'self_hp_lt_30', action: 'item:hi_potion', on: true },
    { cond: 'ally_hp_lt_50', action: 'item:potion', on: true },
    { cond: 'enemy_capturable', action: 'skill:capture', on: true },
    { cond: 'always', action: 'attack', on: true },
  ];
}
export function createHero(id: string, level = 1): HeroState {
  const def = HEROES[id];
  const hs: HeroState = {
    id, level, exp: 0, job: def.innateJob, jobs: { [def.innateJob]: { lv: 1, abp: 0 } }, learned: [], equipped: [], equippedCmds: [], learnedSkills: [], tomes: [], mastery: {}, spellMastery: {},
    equip: { weapon: null, shield: null, head: null, body: null, acc1: null, acc2: null }, itemAp: {},
    gambits: defaultGambits(def.innateJob === 'blackmage' ? 'mage' : def.innateJob === 'whitemage' ? 'healer' : 'hero'), limit: 0, hp: 99999, mp: 99999,
  };
  return hs;
}
export function newGame(heroId: string, seed = Date.now() % 1000000): GameState {
  const s: GameState = {
    version: SAVE_VERSION, seed, rngState: seed, heroes: {}, party: [], reserve: [], monsters: [], inventory: [], bag: { potion: 5, phoenix_down: 1, magi_cage: 4 }, gil: 300,
    run: newRun(1), maxFloorEver: 1, maxDepthEver: 0, superBosses: {}, autoModes: {}, rebirths: 0, tp: 0, board: { start: 1 }, blessing: null, trials: [],
    missions: { offers: [], active: [], completed: 0 },
    codex: { items: [], affixes: [], monsters: [], captured: {} }, stats: { battles: 0, kills: 0, captures: 0, rebirthLog: [] }, uidCounter: 1, settings: { auto: true, speed: 2, autoGambit: true, hand: 'right' },
  };
  s.heroes[heroId] = createHero(heroId);
  s.party = ['h:' + heroId];
  const rng = rngOf(s);
  // 初期装備
  const starter: Record<string, string[]> = { bartz: ['broadsword', 'leather_armor'], terra: ['rod', 'leather_cap'], cloud: ['broadsword', 'buckler'] };
  for (const b of starter[heroId] ?? ['dagger']) {
    const it = generateItem(rng, 1, b, 'normal', nextUid(s));
    s.inventory.push(it);
    equip(s, heroId, it.uid);
  }
  saveRng(s, rng);
  startFloor(s, 1);
  fullRestore(s);
  return s;
}
export function newRun(floor: number): RunState {
  return { floor, maxFloor: floor, warps: [], areaBossKills: 0, gateKills: 0, newFloors: 0, cards: {}, redCards: 0, antilaw: [], events: [], eventIndex: 0, cleared: false, underground: false, undergroundWarps: [], maxDepth: 0 };
}
export function nextUid(s: GameState): string { return 'i' + (s.uidCounter++).toString(36); }
export function rngOf(s: GameState): Rng { return new Rng(s.rngState); }
export function saveRng(s: GameState, r: Rng): void { s.rngState = r.state(); }

// ---- パーティ
export function memberCombatant(s: GameState, key: string): Combatant | null {
  if (key.startsWith('h:')) { const h = s.heroes[key.slice(2)]; return h ? buildHero(s, h) : null; }
  const m = s.monsters.find(x => x.uid === key.slice(2));
  return m ? buildAlly(s, m) : null;
}
export function partyCombatants(s: GameState): Combatant[] {
  return s.party.map(k => memberCombatant(s, k)).filter((c): c is Combatant => !!c);
}
export function maxReserve(s: GameState): number { return 4 + boardValue(s, 'reserve'); }
export function maxMonsterSlots(s: GameState): number { return 2 + boardValue(s, 'monster_slots'); }
export const MAX_HERO_SLOTS = 4;
export function maxRanch(s: GameState): number { return 20 + boardValue(s, 'ranch'); }
export function maxStorage(s: GameState): number { return 200 + boardValue(s, 'storage'); }
export function abilitySlots(s: GameState): number { return 2 + boardValue(s, 'ability_slots'); }
export function cmdSlots(s: GameState): number { return 2 + boardValue(s, 'cmd_slots'); }
export function gambitRows(s: GameState): number { return 8 + boardValue(s, 'gambit_rows'); }

export function unlockedJobs(s: GameState): string[] {
  return Object.values(JOBS).filter(j => (!j.unlockFloor || s.maxFloorEver >= j.unlockFloor) && (!j.unlockRebirth || s.rebirths >= j.unlockRebirth)).map(j => j.id);
}
export function changeJob(s: GameState, heroId: string, job: string): string | null {
  const hs = s.heroes[heroId];
  if (!unlockedJobs(s).includes(job)) return 'まだ解放されていない';
  hs.job = job;
  hs.jobs[job] ??= { lv: 1, abp: 0 };
  hs.equippedCmds = (hs.equippedCmds ?? []).filter(c => c !== JOBS[job].command).slice(0, cmdSlotsFor(s, hs));
  // 装備できない武器を外す
  const w = itemOf(s, hs.equip.weapon);
  if (w && !canEquip(hs, w).ok) hs.equip.weapon = null;
  syncHp(s, hs);
  return null;
}
export function syncHp(s: GameState, hs: HeroState): void {
  const c = buildHero(s, hs);
  hs.hp = Math.min(hs.hp, c.stats.hp);
  hs.mp = Math.min(hs.mp, c.stats.mp);
}
export function fullRestore(s: GameState): void {
  for (const hs of Object.values(s.heroes)) { const c = buildHero(s, hs); hs.hp = c.stats.hp; hs.mp = c.stats.mp; }
  for (const m of s.monsters) { const c = buildAlly(s, m); m.hp = c.stats.hp; m.mp = c.stats.mp; }
}
export function learnedAbilities(s: GameState, hs: HeroState): string[] {
  const set = new Set<string>(hs.learned);
  for (const [jid, j] of Object.entries(hs.jobs)) for (const l of JOBS[jid].learn) if (j.lv >= l.lv) set.add(l.ability);
  return [...set];
}
// ---- 装備
export function equip(s: GameState, heroId: string, uid: string, slotHint?: Slot): string | null {
  const hs = s.heroes[heroId];
  const it = itemOf(s, uid); if (!it) return 'ない';
  const base = ITEMS[it.base];
  const ok = canEquip(hs, it); if (!ok.ok) return ok.reason ?? '装備不可';
  const slots = slotForKind(base.kind);
  if (!slots.length) return '装備品ではない';
  let slot = slotHint && slots.includes(slotHint) ? slotHint : slots.find(sl => !hs.equip[sl]) ?? slots[0];
  // 他の誰かが装備中なら外す
  for (const h of Object.values(s.heroes)) for (const sl of SLOTS) if (h.equip[sl] === uid) h.equip[sl] = null;
  for (const m of s.monsters) if (m.acc === uid) m.acc = null;
  hs.equip[slot] = uid;
  syncHp(s, hs);
  return null;
}
export function unequip(s: GameState, heroId: string, slot: Slot): void { s.heroes[heroId].equip[slot] = null; syncHp(s, s.heroes[heroId]); }
export function equipMonster(s: GameState, uid: string, itemUid: string | null): string | null {
  const m = s.monsters.find(x => x.uid === uid); if (!m) return 'ない';
  if (itemUid) { const it = itemOf(s, itemUid); if (!it || ITEMS[it.base].kind !== 'acc') return 'アクセサリのみ'; for (const h of Object.values(s.heroes)) for (const sl of SLOTS) if (h.equip[sl] === itemUid) h.equip[sl] = null; for (const o of s.monsters) if (o.acc === itemUid) o.acc = null; }
  m.acc = itemUid; return null;
}
export function isEquipped(s: GameState, uid: string): string | null {
  for (const h of Object.values(s.heroes)) for (const sl of SLOTS) if (h.equip[sl] === uid) return HEROES[h.id].name;
  for (const m of s.monsters) if (m.acc === uid) return MONSTERS[m.id].name;
  return null;
}
export function sellPrice(it: ItemInstance): number { const r: Record<Rarity, number> = { normal: 1, mithril: 2, crystal: 4, legend: 10, ultima: 30 }; return Math.round(ITEMS[it.base].price * 0.4 * r[it.rarity] * (1 + 0.3 * (it.tier - 1))); }
export function sellItem(s: GameState, uid: string): boolean {
  const it = itemOf(s, uid); if (!it || isEquipped(s, uid)) return false;
  s.gil += sellPrice(it); s.inventory = s.inventory.filter(i => i.uid !== uid); return true;
}
export function shopList(s: GameState): string[] {
  const area = areaFor(s.maxFloorEver).id;
  return Object.values(ITEMS).filter(i => i.area <= area && i.price <= 5000 && i.kind !== 'material' && i.kind !== 'tome').map(i => i.id);
}
export function buyItem(s: GameState, id: string): string | null {
  const b = ITEMS[id]; if (s.gil < b.price) return 'ギル不足';
  s.gil -= b.price;
  if (b.kind === 'consumable' || b.kind === 'material') s.bag[id] = (s.bag[id] ?? 0) + 1;
  else { if (s.inventory.length >= maxStorage(s)) { s.gil += b.price; return '倉庫がいっぱい'; } const rng = rngOf(s); s.inventory.push(generateItem(rng, 1, id, 'normal', nextUid(s))); saveRng(s, rng); }
  return null;
}
export function itemName(it: ItemInstance): string {
  const prefix = it.affixes.map(a => AFFIXES[a.id]?.name ?? '').join('');
  return `${it.unique ? '【' + it.unique + '】' : ''}${prefix}${ITEMS[it.base].name}${it.tier > 1 ? ' T' + it.tier : ''}`;
}
// ---- 塔
/** スケーリングに使う換算階。裏タワーは 1000 + 地下階×2 */
export function effFloor(s: GameState): number { return s.run.underground ? 1000 + s.run.floor * 2 : s.run.floor; }
export function undergroundUnlocked(s: GameState): boolean { return (s.superBosses?.omega ?? 0) > 0 || s.rebirths >= 20; }
export function enterUnderground(s: GameState, depth = 1): void {
  s.run.underground = true;
  startFloor(s, depth);
}
export function startFloor(s: GameState, floor: number): void {
  const rng = rngOf(s);
  const treasureBonus = partyCombatants(s).some(c => c.supports.has('treasure')) ? 0.3 : 0;
  s.run.floor = floor;
  s.run.events = s.run.underground ? generateUndergroundFloor(rng, floor, treasureBonus) : generateFloor(rng, floor, treasureBonus);
  s.run.eventIndex = 0;
  s.run.cleared = false;
  saveRng(s, rng);
}
export function currentEvent(s: GameState): FloorEvent | null { return s.run.events[s.run.eventIndex] ?? null; }
export function currentLaw(s: GameState) { return lawForFloor(s.seed, s.run.floor + (s.run.underground ? 100000 : 0), s.run.antilaw); }
export function skipEvent(s: GameState): void { const e = currentEvent(s); if (e && e.type === 'battle') { e.done = true; s.run.eventIndex++; } }
export function resolveSimpleEvent(s: GameState): string | null {
  const e = currentEvent(s); if (!e) return null;
  if (e.type === 'treasure') {
    const rng = rngOf(s);
    const area = areaFor(effFloor(s));
    if (rng.chance(0.12)) {
      const pool = TOMES.filter(id => (SKILLS[tomeSpell(id)].level ?? 4) - 3 <= area.id);
      if (pool.length) { const tm = rng.pick(pool); s.bag[tm] = (s.bag[tm] ?? 0) + 1; saveRng(s, rng); e.done = true; s.run.eventIndex++; missionProgress(s, 'treasure', undefined, 1, s.run.floor); return `宝箱から ${ITEMS[tm].name} を手に入れた！`; }
    }
    const rarity = rollRarity(rng, 0.5 + boardValue(s, 'rare_pct'), false, false);
    const it = generateItem(rng, effFloor(s), rng.pick(area.itemPool), rarity, nextUid(s));
    saveRng(s, rng);
    e.done = true; s.run.eventIndex++; missionProgress(s, 'treasure', undefined, 1, s.run.floor);
    if (s.inventory.length >= maxStorage(s)) return '宝箱があったが倉庫がいっぱいだ';
    s.inventory.push(it); addCodexItem(s, it);
    return `宝箱から ${itemName(it)} を手に入れた`;
  }
  if (e.type === 'fountain') { fullRestore(s); e.done = true; s.run.eventIndex++; return '回復の泉で全員回復した'; }
  return null;
}
export function climb(s: GameState): string | null {
  if (!s.run.cleared) return '守護者を倒していない';
  const next = s.run.floor + 1;
  if (s.run.underground) {
    if (next > s.run.maxDepth) { s.run.maxDepth = next; if (next > s.maxDepthEver) s.maxDepthEver = next; }
    startFloor(s, next);
    if (isWarpFloor(next) && !s.run.undergroundWarps.includes(next)) s.run.undergroundWarps.push(next);
    return null;
  }
  if (next > s.run.maxFloor) { s.run.maxFloor = next; if (next > s.maxFloorEver) { s.maxFloorEver = next; s.run.newFloors++; } }
  startFloor(s, next);
  if (isWarpFloor(next) && !s.run.warps.includes(next)) s.run.warps.push(next);
  return joinHeroes(s);
}
export function joinHeroes(s: GameState): string | null {
  const msgs: string[] = [];
  for (const h of Object.values(HEROES)) {
    if (s.heroes[h.id]) continue;
    const j = h.join;
    const ok = (j.kind === 'floor' && s.maxFloorEver >= j.floor) || (j.kind === 'rebirth' && s.rebirths >= j.count);
    if (ok) {
      s.heroes[h.id] = createHero(h.id, Math.max(1, Math.round(avgLevel(s) * 0.9)));
      const starter: Record<string, string> = { knight: 'broadsword', freelancer: 'broadsword', blackmage: 'rod', whitemage: 'staff', monk: 'kaiser_knuckle', thief: 'dagger', dragoon: 'spear', ranger: 'great_bow', ninja: 'dagger', summoner: 'rod', chemist: 'dagger', berserker: 'battle_axe', samurai: 'ashura', timemage: 'rod', mswordsman: 'broadsword', redmage: 'broadsword', bard: 'great_bow', dancer: 'dagger', geomancer: 'staff', beastmaster: 'whip' };
      const rng = rngOf(s); const it = generateItem(rng, 1, starter[h.innateJob] ?? 'dagger', 'normal', nextUid(s)); saveRng(s, rng);
      s.inventory.push(it); equip(s, h.id, it.uid);
      fullRestoreHero(s, h.id); msgs.push(`${h.name}（${h.title}）が仲間になった！拠点の酒場で編成できる`); }
  }
  return msgs.length ? msgs.join('\n') : null;
}
function fullRestoreHero(s: GameState, id: string) { const hs = s.heroes[id]; const c = buildHero(s, hs); hs.hp = c.stats.hp; hs.mp = c.stats.mp; }
export function avgLevel(s: GameState): number { const hs = Object.values(s.heroes); return hs.reduce((a, h) => a + h.level, 0) / Math.max(1, hs.length); }
export function warpTo(s: GameState, floor: number, underground = false): void {
  s.run.underground = underground;
  startFloor(s, floor);
  if (floor === 1 && !underground) fullRestore(s);
}
export function toHub(s: GameState): void { warpTo(s, 1, false); refreshOffers(s); }

// ---- 依頼掲示板（FFTA式ミッション）
export function refreshOffers(s: GameState): void {
  s.missions ??= { offers: [], active: [], completed: 0 };
  const rng = rngOf(s);
  while (s.missions.offers.length < 3) s.missions.offers.push(generateMission(s, rng));
  saveRng(s, rng);
}
function generateMission(s: GameState, rng: Rng): Mission {
  const top = Math.max(10, s.maxFloorEver);
  const floor = rng.int(Math.max(1, top - 60), top);
  const pool = subPoolOf(floor).filter(id => !MONSTERS[id].boss);
  const id = nextUid(s);
  const types: Mission['type'][] = ['kill', 'kill', 'capture', 'treasure', 'law', 'reach', 'collect'];
  const type = rng.pick(types);
  const area = areaFor(floor);
  const rewardGil = Math.round(enemyGilAt(floor) * 40);
  const bagReward = (): Record<string, number> => rng.pick<Record<string, number>>([{ magi_cage: 3 }, { antilaw: 1 }, { magicite: 2 }, { orichalcum: 1 }, { phoenix_feather: 1 }, { hi_potion: 5 }]);
  switch (type) {
    case 'kill': { const m = rng.pick(pool); const n = rng.int(6, 15); return { id, type, target: m, count: n, progress: 0, floorMin: area.floors[0], title: `${MONSTERS[m].name}を${n}体倒す（${area.floors[0]}階以降）`, reward: { gil: rewardGil, bag: bagReward() } }; }
    case 'capture': { const m = rng.pick(pool.filter(x => MONSTERS[x].captureRate > 0)); const n = rng.int(1, 2); return { id, type, target: m, count: n, progress: 0, floorMin: 1, title: `${MONSTERS[m].name}を${n}体捕獲する`, reward: { gil: rewardGil, item: 'crystal', tp: 5 } }; }
    case 'treasure': { const n = rng.int(2, 4); return { id, type, count: n, progress: 0, floorMin: 1, title: `宝箱を${n}個開ける`, reward: { gil: rewardGil, bag: { magi_cage: 2 } } }; }
    case 'law': { const n = rng.int(4, 8); return { id, type, count: n, progress: 0, floorMin: 1, title: `ロウを守って推奨行動をした戦闘を${n}回`, reward: { gil: rewardGil, bag: { antilaw: 1 }, tp: 10 } }; }
    case 'reach': { const f = Math.ceil((top + 5) / 10) * 10; return { id, type, count: f, progress: 0, floorMin: 1, title: `${f}階に到達する`, reward: { gil: rewardGil * 2, item: 'legend', tp: 15 } }; }
    case 'collect': { const mats = pool.map(x => MONSTERS[x].material).filter((x): x is string => !!x); const mat = mats.length ? rng.pick(mats) : 'mithril'; const n = rng.int(3, 8); return { id, type, target: mat, count: n, progress: 0, floorMin: 1, title: `${ITEMS[mat].name}を${n}個納める`, reward: { gil: rewardGil, item: 'crystal' } }; }
  }
}
function enemyGilAt(floor: number): number { return 5 * Math.pow(floor, 1.15); }
function subPoolOf(floor: number): string[] {
  const area = areaFor(floor);
  const sub = area.subs.find(x => floor >= x.floors[0] && floor <= x.floors[1]) ?? area.subs[0];
  return sub.pool;
}
export function acceptMission(s: GameState, id: string): string | null {
  if (s.missions.active.length >= 3) return '受注は3件まで';
  const m = s.missions.offers.find(x => x.id === id); if (!m) return 'ない';
  s.missions.offers = s.missions.offers.filter(x => x.id !== id);
  s.missions.active.push(m);
  refreshOffers(s);
  return null;
}
export function abandonMission(s: GameState, id: string): void { s.missions.active = s.missions.active.filter(x => x.id !== id); }
export function missionDone(s: GameState, m: Mission): boolean {
  if (m.type === 'collect') return (s.bag[m.target!] ?? 0) >= m.count;
  if (m.type === 'reach') return s.run.maxFloor >= m.count || s.maxFloorEver >= m.count;
  return m.progress >= m.count;
}
export function claimMission(s: GameState, id: string): string | null {
  const m = s.missions.active.find(x => x.id === id); if (!m) return 'ない';
  if (!missionDone(s, m)) return '未達成';
  if (m.type === 'collect') s.bag[m.target!] -= m.count;
  const got: string[] = [];
  s.gil += m.reward.gil; got.push(`${m.reward.gil}G`);
  if (m.reward.tp) { s.tp += m.reward.tp; got.push(`${m.reward.tp}TP`); }
  for (const [k, v] of Object.entries(m.reward.bag ?? {})) { s.bag[k] = (s.bag[k] ?? 0) + v; got.push(`${ITEMS[k].name}×${v}`); }
  if (m.reward.item) {
    const rng = rngOf(s); const area = areaFor(Math.max(1, s.maxFloorEver));
    const it = generateItem(rng, Math.max(1, s.maxFloorEver), rng.pick(area.itemPool), m.reward.item, nextUid(s)); saveRng(s, rng);
    if (s.inventory.length < maxStorage(s)) { s.inventory.push(it); addCodexItem(s, it); got.push(itemName(it)); } else got.push('（倉庫がいっぱいで装備は失われた）');
  }
  s.missions.active = s.missions.active.filter(x => x.id !== id);
  s.missions.completed++;
  refreshOffers(s);
  return got.join('、');
}
function missionProgress(s: GameState, type: Mission['type'], target: string | undefined, n: number, floor: number): void {
  for (const m of s.missions?.active ?? []) {
    if (m.type !== type) continue;
    if (m.target && m.target !== target) continue;
    if (floor < m.floorMin) continue;
    m.progress = Math.min(m.count, m.progress + n);
  }
}
// ---- 戦闘
export function startBattle(s: GameState, ev: FloorEvent): Battle {
  if (ev.type !== 'battle' && ev.type !== 'guardian') throw new Error('not battle');
  const rng = rngOf(s);
  const tm = s.trials.includes('strong') ? 2 : 1;
  const scale = ev.type === 'guardian' && ev.scale ? ev.scale : effFloor(s);
  const enemies = ev.enemies.map((raw, i) => { const elite = raw.endsWith('+'); const id = elite ? raw.slice(0, -1) : raw; return buildEnemy(id, scale, i, { elite, guardian: ev.type === 'guardian' && ev.boss === 'none', midboss: ev.type === 'guardian' && ev.boss === 'mid', areaboss: ev.type === 'guardian' && ev.boss === 'area', trialMult: tm }); });
  let players = partyCombatants(s);
  if (s.trials.includes('nobeast')) players = players.filter(p => p.kind === 'hero');
  if (s.settings.autoGambit) { const law = ev.type === 'guardian' && ev.superBoss ? null : currentLaw(s); for (const p of players) p.gambits = recommendGambits(p, law, s.bag, { mode: autoModeOf(s, p) }); }
  const b = new Battle(players, enemies, rng, {
    floor: scale, law: ev.type === 'guardian' && ev.superBoss ? null : currentLaw(s), noItem: s.trials.includes('noitem'), auto: s.settings.auto, respectLaw: true, bag: s.bag, gil: s.gil,
    canCaptureMidboss: boardValue(s, 'midboss_capture') > 0, canFlee: ev.type === 'battle', windBlessing: s.blessing === 'wind',
  });
  saveRng(s, rng);
  return b;
}
export interface BattleSummary { lines: string[]; items: ItemInstance[]; }
export function finishBattle(s: GameState, b: Battle, ev: FloorEvent): BattleSummary {
  const out: BattleSummary = { lines: [], items: [] };
  saveRng(s, b.rng);
  s.gil -= b.gilSpent;
  // HP/MP を書き戻す
  for (const c of b.players) {
    if (c.kind === 'hero') { const hs = s.heroes[c.ref]; hs.hp = c.hp; hs.mp = c.mp; hs.limit = c.limit; }
    else { const m = s.monsters.find(x => x.uid === c.ref); if (m) { m.hp = c.hp; m.mp = c.mp; } }
  }
  for (const id of b.stolen) s.bag[id] = (s.bag[id] ?? 0) + 1;
  if (b.result === 'lost') {
    const lost = Math.floor(s.gil / 2); s.gil -= lost;
    out.lines.push(`全滅… 拠点に戻された。ギルを${lost}失った`);
    toHub(s); fullRestore(s);
    return out;
  }
  if (b.result === 'fled') { out.lines.push('逃げた'); if (ev.type === 'battle') { ev.done = true; s.run.eventIndex++; } return out; }
  s.stats.battles++;
  // ロウ
  const block = lawBlock(s.run.floor);
  if (b.lawViolated) {
    s.run.cards[block] = (s.run.cards[block] ?? 0) + 1;
    if (s.run.cards[block] === 3) { s.run.redCards++; out.lines.push('レッドカード！この周の転生ポイント-10%'); }
    else out.lines.push(`イエローカード（${s.run.cards[block]}/3）ドロップ品質ダウン`);
  }
  if (b.lawFavored && !b.lawViolated) out.lines.push('ロウ遵守ボーナス：ドロップ率・ギル+20%');
  // ドロップ
  const mods = partyMods(s);
  const rng = rngOf(s);
  const scale = b.opt.floor;
  const ug = s.run.underground ? 0.5 : 0;
  const drops = rollDrops(rng, scale, b.enemies.map(e => ({ id: e.ref, boss: e.boss, captured: e.captured, elite: e.elite })), {
    drop: mods.drop + boardValue(s, 'drop_pct') + ug, rare: mods.rare + boardValue(s, 'rare_pct') + ug, gil: mods.gil, exp: mods.exp + boardValue(s, 'exp_pct'),
    lawViolated: b.lawViolated, lawFavored: b.lawFavored && !b.lawViolated, uid: () => nextUid(s),
  });
  saveRng(s, rng);
  s.gil += drops.gil;
  s.stats.kills += b.enemies.filter(e => e.hp <= 0).length;
  for (const e of b.enemies) if (e.hp <= 0 && !e.captured) missionProgress(s, 'kill', e.ref, 1, s.run.floor);
  if (b.enemies.some(e => e.elite && e.hp <= 0)) out.lines.push('＋強個体を撃破：ドロップ率2倍');
  if (b.lawFavored && !b.lawViolated && currentLaw(s)) missionProgress(s, 'law', undefined, 1, s.run.floor);
  for (const [k, v] of Object.entries(drops.bag)) s.bag[k] = (s.bag[k] ?? 0) + v;
  const bagText = Object.entries(drops.bag).map(([k, v]) => `${ITEMS[k].name}×${v}`).join('、');
  out.lines.push(`EXP ${drops.exp}　ギル ${drops.gil}${bagText ? '　' + bagText : ''}`);
  for (const it of drops.items) {
    if (s.inventory.length >= maxStorage(s)) { out.lines.push('倉庫がいっぱいで拾えなかった'); break; }
    s.inventory.push(it); out.items.push(it); addCodexItem(s, it);
    out.lines.push(`${rarityMark(it.rarity)} ${itemName(it)} を手に入れた`);
  }
  // 捕獲
  for (const c of b.captured) {
    if (s.monsters.length >= maxRanch(s)) { out.lines.push(`${c.name}を捕まえたが牧場がいっぱいだった`); continue; }
    const m = createMonsterAlly(s, c.ref, Math.max(1, Math.round(avgLevel(s) * 0.8)), s.run.underground ? 3 : 1, c.elite);
    s.monsters.push(m); s.stats.captures++; missionProgress(s, 'capture', c.ref, 1, s.run.floor);
    const rec = (s.codex.captured ??= {})[c.ref] ??= {}; rec[m.grade] = (rec[m.grade] ?? 0) + 1;
    if (!s.codex.monsters.includes(c.ref)) s.codex.monsters.push(c.ref);
    out.lines.push(`${m.grade === 'plus_rare' ? '●＋レアな強個体！ ' : m.grade === 'rare' ? '●レア個体！ ' : m.grade === 'plus' ? '＋強個体 ' : ''}${MONSTERS[c.ref].name}が仲間になった（牧場へ）`);
  }
  for (const e of b.enemies) if (!s.codex.monsters.includes(e.ref)) s.codex.monsters.push(e.ref);
  // 熟練度（FF2式）：使った回数×階層補正
  const mg = masteryGain(scale, Math.max(s.maxFloorEver, 1000 + s.maxDepthEver * 2));
  for (const u of b.uses) {
    const hs = s.heroes[u.uid.slice(2)]; if (!hs) continue;
    hs.mastery ??= {}; hs.spellMastery ??= {};
    if (u.kind === 'spell') hs.spellMastery[u.key] = (hs.spellMastery[u.key] ?? 0) + mg;
    else hs.mastery[u.key] = (hs.mastery[u.key] ?? 0) + mg;
  }
  for (const c of b.players) if (c.kind === 'hero' && s.heroes[c.ref].equip.shield) { const hs = s.heroes[c.ref]; hs.mastery ??= {}; hs.mastery.shield = (hs.mastery.shield ?? 0) + mg * 0.5; }
  // 経験値・ABP・AP
  const abp = Math.max(1, Math.round(2 + scale / 10 + (ev.type === 'guardian' ? 3 : 0)) * (1 + mods.abp + boardValue(s, 'abp_pct')));
  const ap = 10 + Math.floor(scale / 10);
  out.lines.push(...grantExp(s, drops.exp, abp, ap, b));
  // 階の進行
  if (ev.type === 'guardian' && ev.superBoss) { out.lines.push(...superBossReward(s, ev.superBoss)); return out; }
  ev.done = true; s.run.eventIndex++;
  if (ev.type === 'guardian') {
    s.run.cleared = true;
    if (ev.boss === 'area') { s.run.areaBossKills++; out.lines.push(`エリアボスを撃破！`); }
    if (isGateFloor(s.run.floor)) s.run.gateKills++;
  }
  return out;
}
export function rarityMark(r: Rarity): string { return { normal: '○', mithril: '◇', crystal: '◆', legend: '★', ultima: '☆' }[r]; }
export function addCodexItem(s: GameState, it: ItemInstance) {
  if (!s.codex.items.includes(it.base)) s.codex.items.push(it.base);
  for (const a of it.affixes) if (!s.codex.affixes.includes(a.id)) s.codex.affixes.push(a.id);
}
export function partyMods(s: GameState) {
  const cs = partyCombatants(s);
  const m = { drop: 0, rare: 0, gil: 0, exp: 0, abp: 0, capture: 0, tp: 0 };
  for (const c of cs) { m.drop += c.mods.drop; m.gil += c.mods.gil; m.exp += c.mods.exp; m.abp += c.mods.abp; m.capture += c.mods.capture; m.tp += c.mods.tp; }
  return m;
}
function grantExp(s: GameState, exp: number, abp: number, ap: number, b: Battle): string[] {
  const lines: string[] = [];
  const share = (key: string, mult: number) => {
    if (key.startsWith('h:')) {
      const hs = s.heroes[key.slice(2)]; if (!hs) return;
      const alive = b.players.find(p => p.uid === key); if (alive && alive.hp <= 0) return;
      let before = hs.level;
      hs.exp += Math.round(exp * mult);
      while (hs.level < MAX_LEVEL && hs.exp >= expToNext(hs.level)) { hs.exp -= expToNext(hs.level); hs.level++; }
      if (hs.level > before) { const c = buildHero(s, hs); hs.hp = Math.min(c.stats.hp, hs.hp + (c.stats.hp - buildHero(s, { ...hs, level: before }).stats.hp)); hs.mp = Math.min(c.stats.mp, hs.mp + 10); lines.push(`${HEROES[hs.id].name}はLv${hs.level}になった`); }
      // ABP
      const j = hs.jobs[hs.job] ??= { lv: 1, abp: 0 };
      if (j.lv < MAX_JOB_LEVEL) {
        j.abp += Math.round(abp * mult);
        while (j.lv < MAX_JOB_LEVEL && j.abp >= abpToNext(j.lv)) {
          j.abp -= abpToNext(j.lv); j.lv++;
          const learned = JOBS[hs.job].learn.find(l => l.lv === j.lv);
          lines.push(`${HEROES[hs.id].name}の${JOBS[hs.job].name}がLv${j.lv}に${learned ? `、「${SUPPORT_NAME(learned.ability)}」を習得` : ''}${j.lv === MAX_JOB_LEVEL ? '（マスター！）' : ''}`);
          if (learned && !hs.learned.includes(learned.ability)) hs.learned.push(learned.ability);
        }
      }
      // 装備アビリティAP
      for (const sl of SLOTS) {
        const it = itemOf(s, hs.equip[sl]); if (!it) continue;
        const base = ITEMS[it.base]; const lr = learnOf(it); if (!lr) continue;
        const key = lr.ability ?? lr.skill!;
        if (lr.ability && hs.learned.includes(key)) continue;
        if (lr.skill && (hs.learnedSkills.includes(key) || hasSkillByJob(hs, key))) continue;
        hs.itemAp[key] = (hs.itemAp[key] ?? 0) + Math.round(ap * mult);
        if (hs.itemAp[key] >= lr.ap) {
          if (lr.ability) hs.learned.push(key); else hs.learnedSkills.push(key);
          delete hs.itemAp[key]; lines.push(`${HEROES[hs.id].name}は${base.name}から「${learnName(lr)}」を習得した！`);
        }
      }
    } else {
      const m = s.monsters.find(x => x.uid === key.slice(2)); if (!m) return;
      const before = m.level;
      m.exp += Math.round(exp * mult);
      while (m.level < MAX_LEVEL && m.exp >= expToNext(m.level)) { m.exp -= expToNext(m.level); m.level++; }
      if (m.level > before) {
        const c = buildAlly(s, m); m.hp = Math.min(c.stats.hp, m.hp + 50 * (m.level - before)); lines.push(`${MONSTERS[m.id].name}はLv${m.level}になった`);
        for (const l of learnMonsterSkills(s, m)) lines.push(l);
      }
      if (mult >= 1) {
        m.bondXp += (1 + boardValue(s, 'bond_pct')) * (1 + (m.traits.find(x => x.id === 'm_bond')?.value ?? 0));
        const need = 5 + m.bond * 5;
        if (m.bond < 10 && m.bondXp >= need) { m.bondXp -= need; m.bond++; lines.push(`${MONSTERS[m.id].name}との絆がランク${m.bond}に`); }
      }
    }
  };
  for (const k of s.party) share(k, 1);
  for (const k of s.reserve) share(k, 0.5);
  for (const m of s.monsters) { const key = 'm:' + m.uid; if (!s.party.includes(key) && !s.reserve.includes(key)) share(key, 0.1); }
  for (const id of Object.keys(s.heroes)) { const key = 'h:' + id; if (!s.party.includes(key) && !s.reserve.includes(key)) share(key, 0.1); }
  return lines;
}
import { SUPPORTS, jobOfCommand, COMMANDS } from '../data/jobs';
import { SKILLS } from '../data/skills';
const SUPPORT_NAME = (id: string) => SUPPORTS[id]?.name ?? id;
export function learnName(l: { ability?: string; skill?: string }): string {
  if (l.ability) return SUPPORT_NAME(l.ability);
  const sk = SKILLS[l.skill!]; return sk ? `${COMMANDS[sk.category ?? '']?.name ?? ''}「${sk.name}」` : l.skill!;
}
/** ジョブLvで既にその技を解放済みか */
export function hasSkillByJob(hs: HeroState, skillId: string): boolean {
  const sk = SKILLS[skillId]; if (!sk?.category) return false;
  const job = jobOfCommand(sk.category); if (!job) return false;
  const lv = hs.jobs[job.id]?.lv ?? 0;
  return job.unlocks.some(u => u.skill === skillId && lv >= u.lv);
}
export function cmdSlotsFor(s: GameState, hs: HeroState): number { return cmdSlots(s) + (JOBS[hs.job].command ? 0 : 1); }

/** レベルに達した習得表の技を覚える。技枠（4）に空きがあれば自動でセット */
export function learnMonsterSkills(s: GameState, m: MonsterAlly, prefix = ''): string[] {
  const lines: string[] = [];
  const def = MONSTERS[m.id];
  m.learned ??= [];
  for (const e of learnsetFor(def, VARIANT_OF[m.id])) {
    if (e.lv > m.level || m.learned.includes(e.skill) || def.skills.includes(e.skill)) continue;
    m.learned.push(e.skill);
    if (m.moves && m.moves.length < MAX_MOVES) m.moves.push(e.skill);
    lines.push(`${def.name}は${prefix}「${SKILLS[e.skill].name}」を覚えた！${m.moves && m.moves.length >= MAX_MOVES && !m.moves.includes(e.skill) ? '（技枠がいっぱい。牧場で入れ替え）' : ''}`);
  }
  return lines;
}
export const MAX_MOVES = 4;
/** 使える技すべて：固有技（絆で解放）＋覚えた技 */
export function knownSkills(m: MonsterAlly): string[] {
  const def = MONSTERS[m.id];
  const innate = def.skills.filter((_, i) => i === 0 || m.bond >= 3 * (i + 1));
  return [...innate, ...(m.learned ?? []).filter(k => !innate.includes(k) && SKILLS[k])];
}
/** 戦闘でセットされる技（最大4）。未設定なら固有技→覚えた順で自動 */
export function activeMoves(m: MonsterAlly): string[] {
  const known = knownSkills(m);
  if (m.moves) return m.moves.filter(k => known.includes(k)).slice(0, MAX_MOVES);
  return known.slice(0, MAX_MOVES);
}
export function setMoves(s: GameState, uid: string, moves: string[]): string | null {
  const m = s.monsters.find(x => x.uid === uid); if (!m) return 'ない';
  const known = knownSkills(m);
  const mv = moves.filter((k, i, a) => known.includes(k) && a.indexOf(k) === i).slice(0, MAX_MOVES);
  if (!mv.length) return '技は1つ以上必要';
  m.moves = mv; return null;
}
export function nextLearn(m: MonsterAlly): { lv: number; skill: string } | null {
  return learnsetFor(MONSTERS[m.id], VARIANT_OF[m.id]).find(e => e.lv > m.level) ?? null;
}
export function memberKey(c: { kind: string; ref: string }): string { return (c.kind === 'hero' ? 'h:' : 'm:') + c.ref; }
export function autoModeOf(s: GameState, c: { kind: string; ref: string }): AutoMode { return (s.autoModes ??= {})[memberKey(c)] ?? 'balanced'; }
export function setAutoMode(s: GameState, key: string, mode: AutoMode): void { (s.autoModes ??= {})[key] = mode; }
export function createMonsterAlly(s: GameState, id: string, level: number, rareMult = 1, plus = false): MonsterAlly {
  const rng = rngOf(s);
  const rare = rng.chance(0.01 * (s.rebirths >= 2 ? 2 : 1) * rareMult);
  const iv: Stats = { hp: 1, mp: 1, str: 1, vit: 1, mag: 1, spr: 1, spd: 1, luck: 1 };
  for (const k of STAT_KEYS) iv[k] = Math.round(rng.range(0.9, 1.1) * 100) / 100;
  const natures = ['勇敢', '慎重', '狡猾', '穏やか', '好奇心', '気まぐれ'];
  const nature = rng.pick(natures);
  const boost: Record<string, keyof Stats> = { '勇敢': 'str', '慎重': 'vit', '狡猾': 'spd', '穏やか': 'spr', '好奇心': 'mag', '気まぐれ': 'luck' };
  iv[boost[nature]] += 0.1;
  if (plus) for (const k of STAT_KEYS) iv[k] = Math.round((iv[k] + 0.1) * 100) / 100;
  const traitPool = Object.values(AFFIXES).filter(a => a.cat === 'action' || a.cat === 'defense' || a.cat === 'farm' || a.cat === 'attack' || a.cat === 'monster');
  const n = rng.int(0, 2) + (rare ? 1 : 0) + (plus ? 1 : 0);
  const traits: AffixRoll[] = [];
  for (let i = 0; i < n; i++) { let a = rng.pick(traitPool); if (traits.some(x => x.id === a.id)) a = rng.pick(traitPool); if (traits.some(x => x.id === a.id)) continue; traits.push({ id: a.id, value: Math.round(a.base * (1 + 0.3 * (tierOf(s.run.floor) - 1)) * rng.range(0.7, 1.4) * 1000) / 1000 }); }
  const grade = plus && rare ? 'plus_rare' : plus ? 'plus' : rare ? 'rare' : 'normal';
  const m: MonsterAlly = { uid: nextUid(s), id, level, exp: 0, bond: 0, bondXp: 0, iv, nature, traits, rare, grade, learned: learnsetFor(MONSTERS[id], VARIANT_OF[id]).filter(e => e.lv <= level).map(e => e.skill), moves: null, acc: null, gambits: defaultGambits('ally'), hp: 99999, mp: 99999, food: {} };
  saveRng(s, rng);
  const c = buildAlly(s, m); m.hp = c.stats.hp; m.mp = c.stats.mp;
  return m;
}
// ---- 魔法書
export function readTome(s: GameState, heroId: string, tomeId: string): string | null {
  const hs = s.heroes[heroId]; if (!hs) return 'ない';
  if ((s.bag[tomeId] ?? 0) <= 0) return '持っていない';
  const spell = tomeSpell(tomeId);
  hs.tomes ??= [];
  if (hs.tomes.includes(spell)) return '読み終わっている';
  s.bag[tomeId]--; hs.tomes.push(spell);
  return null;
}
// ---- 合成屋
export function synthCost(kind: 'transplant' | 'reroll' | 'rankup' | 'unseal', it: ItemInstance): { gil: number; mats: Record<string, number> } {
  switch (kind) {
    case 'transplant': return { gil: 500 * it.tier, mats: { magicite: it.tier } };
    case 'reroll': return { gil: 300 * it.tier * (1 + ['normal', 'mithril', 'crystal', 'legend', 'ultima'].indexOf(it.rarity)), mats: { mithril: 1 } };
    case 'rankup': return { gil: 2000 * it.tier, mats: { orichalcum: it.tier } };
    case 'unseal': return { gil: 1000, mats: { phoenix_feather: 1 } };
  }
}
function pay(s: GameState, cost: { gil: number; mats: Record<string, number> }): string | null {
  if (s.gil < cost.gil) return 'ギル不足';
  for (const [m, n] of Object.entries(cost.mats)) if ((s.bag[m] ?? 0) < n) return `${ITEMS[m].name}×${n}が必要`;
  s.gil -= cost.gil; for (const [m, n] of Object.entries(cost.mats)) s.bag[m] -= n;
  return null;
}
export function transplant(s: GameState, fromUid: string, affixIdx: number, toUid: string, replaceIdx: number | null): string | null {
  const a = itemOf(s, fromUid), b = itemOf(s, toUid);
  if (!a || !b || a === b) return '無効';
  const roll = a.affixes[affixIdx]; if (!roll) return '付加がない';
  const def = AFFIXES[roll.id]; const bk = ITEMS[b.base].kind;
  if (!def.kinds.includes(bk)) return 'その部位には乗らない付加';
  if (b.affixes.some(x => x.id === roll.id)) return '同じ付加を持っている';
  const max = Math.max(1, { normal: 1, mithril: 1, crystal: 2, legend: 3, ultima: 4 }[b.rarity]);
  if (b.affixes.length >= max && replaceIdx === null) return `付加は${max}個まで。置き換える付加を選ぶ`;
  const e = pay(s, synthCost('transplant', b)); if (e) return e;
  if (b.affixes.length >= max && replaceIdx !== null) b.affixes.splice(replaceIdx, 1, { ...roll }); else b.affixes.push({ ...roll });
  s.inventory = s.inventory.filter(i => i.uid !== fromUid);
  for (const h of Object.values(s.heroes)) for (const sl of SLOTS) if (h.equip[sl] === fromUid) h.equip[sl] = null;
  addCodexItem(s, b);
  return null;
}
export function reroll(s: GameState, uid: string): string | null {
  const it = itemOf(s, uid); if (!it) return 'ない';
  if (!it.affixes.length) return '付加がない';
  const e = pay(s, synthCost('reroll', it)); if (e) return e;
  const rng = rngOf(s);
  it.affixes = rollAffixes(rng, ITEMS[it.base].kind, it.tier, it.affixes.length, it.rarity);
  saveRng(s, rng); addCodexItem(s, it);
  return null;
}
export function rankUp(s: GameState, uid: string): string | null {
  const it = itemOf(s, uid); if (!it) return 'ない';
  const maxT = tierOf(s.maxFloorEver);
  if (it.tier >= maxT) return `到達階のティア（T${maxT}）が上限`;
  const e = pay(s, synthCost('rankup', it)); if (e) return e;
  const oldT = it.tier; it.tier++;
  for (const a of it.affixes) a.value = Math.round(a.value * (1 + 0.3 * (it.tier - 1)) / (1 + 0.3 * (oldT - 1)) * 1000) / 1000;
  return null;
}
export function unseal(s: GameState, uid: string): string | null {
  const it = itemOf(s, uid); if (!it) return 'ない';
  if (it.unsealed) return '解除済み';
  const e = pay(s, synthCost('unseal', it)); if (e) return e;
  it.unsealed = true; return null;
}
export function dismantle(s: GameState, uid: string): string | null {
  const it = itemOf(s, uid); if (!it || isEquipped(s, uid)) return '装備中';
  const got: Record<string, number> = { mithril: 1 };
  if (it.rarity === 'crystal') got.magicite = 1;
  if (it.rarity === 'legend') { got.magicite = 2; got.orichalcum = 1; }
  if (it.rarity === 'ultima') { got.magicite = 3; got.orichalcum = 3; }
  for (const [k, v] of Object.entries(got)) s.bag[k] = (s.bag[k] ?? 0) + v;
  s.inventory = s.inventory.filter(i => i.uid !== uid);
  return Object.entries(got).map(([k, v]) => `${ITEMS[k].name}×${v}`).join('、');
}
export function feedMonster(s: GameState, uid: string, material: string): string | null {
  const m = s.monsters.find(x => x.uid === uid); if (!m) return 'ない';
  if ((s.bag[material] ?? 0) <= 0) return '素材がない';
  const map: Record<string, { stat: keyof Stats; amount: number }> = {
    goblin_ear: { stat: 'str', amount: 1 }, wolf_fang: { stat: 'spd', amount: 1 }, bomb_core: { stat: 'mag', amount: 1 }, slime_jelly: { stat: 'vit', amount: 1 },
    dragon_fang: { stat: 'str', amount: 5 }, phoenix_feather: { stat: 'hp', amount: 60 }, mithril: { stat: 'vit', amount: 2 }, magicite: { stat: 'mag', amount: 3 }, fire_shard: { stat: 'hp', amount: 20 },
  };
  const f = map[material]; if (!f) return 'エサにできない';
  const cap = f.stat === 'hp' ? 600 : 40;
  if ((m.food[f.stat] ?? 0) >= cap) return 'これ以上は上がらない';
  s.bag[material]--; m.food[f.stat] = Math.min(cap, (m.food[f.stat] ?? 0) + f.amount);
  return null;
}
export function releaseMonster(s: GameState, uid: string): void {
  const m = s.monsters.find(x => x.uid === uid); if (!m) return;
  const mat = MONSTERS[m.id].material; if (mat) s.bag[mat] = (s.bag[mat] ?? 0) + 2;
  s.monsters = s.monsters.filter(x => x.uid !== uid);
  s.party = s.party.filter(k => k !== 'm:' + uid); s.reserve = s.reserve.filter(k => k !== 'm:' + uid);
}
export function evolveReq(s: GameState, m: MonsterAlly): { to: string; level: number; material: string; count: number; ok: boolean; reason?: string } | null {
  const def = MONSTERS[m.id];
  if (!def.evolveTo) return null;
  const material = def.material ?? 'magicite';
  const level = 20, count = 5;
  const req = { to: def.evolveTo, level, material, count, ok: true as boolean, reason: undefined as string | undefined };
  if (m.level < level) { req.ok = false; req.reason = `Lv${level}必要`; }
  else if ((s.bag[material] ?? 0) < count) { req.ok = false; req.reason = `${ITEMS[material].name}×${count}必要`; }
  else if ((s.bag.magicite ?? 0) < 1) { req.ok = false; req.reason = '魔晶石×1必要'; }
  return req;
}
export function evolveMonster(s: GameState, uid: string): string | null {
  const m = s.monsters.find(x => x.uid === uid); if (!m) return 'ない';
  const req = evolveReq(s, m); if (!req) return '進化先がない';
  if (!req.ok) return req.reason ?? '条件未達';
  s.bag[req.material] -= req.count; s.bag.magicite!--;
  const before = MONSTERS[m.id].name;
  m.id = req.to;
  if (!s.codex.monsters.includes(m.id)) s.codex.monsters.push(m.id);
  learnMonsterSkills(s, m, '進化で');
  const c = buildAlly(s, m); m.hp = c.stats.hp; m.mp = c.stats.mp;
  return null;
}
export function fuseMonsters(s: GameState, a: string, b: string): string | null {
  if (s.rebirths < 5) return '転生5回で解放';
  const ma = s.monsters.find(x => x.uid === a), mb = s.monsters.find(x => x.uid === b);
  if (!ma || !mb || a === b) return '無効';
  if (ma.traits.length >= 4) return '特性が上限';
  if (mb.traits.length) ma.traits.push(mb.traits[0]);
  ma.bond = Math.min(10, ma.bond + Math.floor(mb.bond / 2));
  releaseMonster(s, b);
  return null;
}
// ---- 超ボス（試練の間）
export function superBossAvailable(s: GameState, id: string): { ok: boolean; reason?: string } {
  switch (id) {
    case 'omega': return s.maxFloorEver >= 1000 ? { ok: true } : { ok: false, reason: '1000階到達で挑戦可' };
    case 'ultima_weapon_true': return s.rebirths >= 10 ? { ok: true } : { ok: false, reason: '転生10回で挑戦可' };
    case 'shinryu': return s.maxDepthEver >= 100 ? { ok: true } : { ok: false, reason: '裏タワー地下100階到達で挑戦可' };
  }
  return { ok: false, reason: '?' };
}
export function superBossEvent(id: string): FloorEvent {
  const def = SUPER_BOSSES.find(b => b.id === id)!;
  return { type: 'guardian', enemies: [id], boss: 'area', done: false, scale: def.scale, superBoss: id };
}
function superBossReward(s: GameState, id: string): string[] {
  const lines: string[] = [];
  s.superBosses[id] = (s.superBosses[id] ?? 0) + 1;
  const first = s.superBosses[id] === 1;
  const tp = { omega: 100, ultima_weapon_true: 150, shinryu: 200 }[id] ?? 50;
  s.tp += first ? tp : Math.round(tp / 4);
  lines.push(`超ボス撃破！ TP+${first ? tp : Math.round(tp / 4)}`);
  const rng = rngOf(s); const area = areaFor(1000);
  const it = generateItem(rng, SUPER_BOSSES.find(b => b.id === id)!.scale, rng.pick(area.itemPool), 'ultima', nextUid(s)); saveRng(s, rng);
  if (s.inventory.length < maxStorage(s)) { s.inventory.push(it); addCodexItem(s, it); lines.push(`☆ ${itemName(it)} を手に入れた`); }
  if (id === 'omega' && first) lines.push('裏タワー（地下）が解放された！拠点から降りられる');
  if (id === 'shinryu' && first) lines.push('転生ボードの上限が+10された');
  return lines;
}
// ---- 編成
export function setParty(s: GameState, party: string[], reserve: string[]): string | null {
  const heroes = party.filter(k => k.startsWith('h:')).length, mons = party.length - heroes;
  if (party.length < 1) return '前線は1人以上';
  if (heroes > MAX_HERO_SLOTS) return `英雄は${MAX_HERO_SLOTS}人まで`;
  if (mons > maxMonsterSlots(s)) return `モンスター枠は${maxMonsterSlots(s)}まで`;
  if (reserve.length > maxReserve(s)) return '控えが多すぎる';
  if (s.trials.includes('solo') && (party.length > 1 || reserve.length > 0)) return '試練「孤高」中は1人のみ';
  s.party = party; s.reserve = reserve; return null;
}
// ---- 転生
export function doRebirth(s: GameState, blessing: string | null, trials: string[], startFloorN: number): string[] {
  const lines: string[] = [];
  const tp = computeTP(s) * (1 + partyMods(s).tp);
  const gained = Math.round(tp);
  s.tp += gained; s.rebirths++;
  s.stats.rebirthLog.push({ floor: s.run.maxFloor, tp: gained });
  lines.push(`転生ポイント +${gained}（累計 ${s.tp}）`);
  const startLv = 1 + boardValue(s, 'start_lv');
  for (const hs of Object.values(s.heroes)) {
    hs.level = startLv; hs.exp = 0; hs.limit = 0;
    for (const j of Object.values(hs.jobs)) if (j.lv < MAX_JOB_LEVEL) { j.lv = Math.max(1, Math.floor(j.lv / 2)); j.abp = 0; }
    for (const sl of SLOTS) { const it = itemOf(s, hs.equip[sl]); if (it && !canEquip(hs, it).ok) hs.equip[sl] = null; }
  }
  for (const m of s.monsters) { m.level = startLv; m.exp = 0; }
  s.gil = Math.floor(s.gil * (0.1 + boardValue(s, 'gil_keep')));
  const keepWarps = boardValue(s, 'warp_keep') > 0 ? s.run.warps.slice() : [];
  s.run = newRun(startFloorN);
  s.run.warps = keepWarps;
  s.blessing = blessing; s.trials = trials;
  if (s.trials.includes('solo')) { s.party = s.party.filter(k => k.startsWith('h:')).slice(0, 1); s.reserve = []; }
  if (s.trials.includes('nobeast')) { s.party = s.party.filter(k => k.startsWith('h:')); if (!s.party.length) s.party = ['h:' + Object.keys(s.heroes)[0]]; }
  startFloor(s, startFloorN);
  fullRestore(s);
  lines.push(...(joinHeroes(s) ? [joinHeroes(s)!] : []));
  lines.push(`${startFloorN}階・Lv${startLv}から再スタート`);
  return lines;
}
export { computeTP, trialMult, isAlive, isAreaBossFloor };
