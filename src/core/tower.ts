import type { LawDef } from './types';
import type { FloorEvent } from './state';
import { Rng, hashStr } from './rng';
import { isMidBossFloor, isAreaBossFloor } from './formulas';
import { areaFor, LAWS, chaosPool, allMidBosses, allAreaBosses } from '../data/monsters';

export function lawBlock(floor: number): number { return Math.floor(floor / 10); }
export function lawForFloor(seed: number, floor: number, antilaw: number[]): LawDef | null {
  const block = lawBlock(floor);
  if (block === 0) return null;
  if (antilaw.includes(block)) return null;
  const h = hashStr(`${seed}:law:${block}`);
  if (h % 4 === 0) return null; // 4ブロックに1つはロウなし
  return LAWS[(h >>> 3) % LAWS.length];
}
export function groupSize(rng: Rng, floor: number): number {
  if (floor < 8) return rng.chance(0.7) ? 1 : 2;
  if (floor < 25) return rng.int(1, 3);
  if (floor < 150) return rng.int(2, 4);
  if (floor < 400) return rng.int(2, 5);
  return rng.int(3, 5);
}
export function subPool(floor: number): string[] {
  const area = areaFor(floor);
  const sub = area.subs.find(s => floor >= s.floors[0] && floor <= s.floors[1]) ?? area.subs[area.subs.length - 1];
  return sub.pool;
}
export function enemyGroup(rng: Rng, floor: number): string[] {
  const pool = subPool(floor);
  const n = groupSize(rng, floor);
  const out: string[] = [];
  const lead = rng.pick(pool);
  for (let i = 0; i < n; i++) out.push(rng.chance(0.6) ? lead : rng.pick(pool));
  // 強個体（＋）：5%で1体が強くなる
  if (rng.chance(0.05)) out[0] = out[0] + '+';
  return out;
}
export function generateFloor(rng: Rng, floor: number, treasureBonus: number): FloorEvent[] {
  const ev: FloorEvent[] = [];
  const battles = floor < 3 ? 1 : rng.int(2, 3);
  for (let i = 0; i < battles; i++) {
    ev.push({ type: 'battle', enemies: enemyGroup(rng, floor), done: false });
    if (rng.chance(0.12 * (1 + treasureBonus))) ev.push({ type: 'treasure', done: false });
  }
  if (rng.chance(0.08)) ev.push({ type: 'fountain', done: false });
  const area = areaFor(floor);
  if (isAreaBossFloor(floor)) ev.push({ type: 'guardian', enemies: [area.boss], boss: 'area', done: false });
  else if (isMidBossFloor(floor)) {
    const idx = Math.floor(((floor % 100) / 10) - 1) % area.midBosses.length;
    ev.push({ type: 'guardian', enemies: [area.midBosses[idx]], boss: 'mid', done: false });
  } else {
    const g = enemyGroup(rng, floor);
    ev.push({ type: 'guardian', enemies: g.slice(0, Math.max(1, Math.min(3, g.length))), boss: 'none', done: false });
  }
  return ev;
}

/** 裏タワー：全エリアの敵が混在。depth=地下の階、eff=スケーリング用の換算階 */
export function generateUndergroundFloor(rng: Rng, depth: number, treasureBonus: number): FloorEvent[] {
  const pool = chaosPool();
  const group = () => { const n = rng.int(3, 5); const lead = rng.pick(pool); const g = Array.from({ length: n }, () => rng.chance(0.5) ? lead : rng.pick(pool)); if (rng.chance(0.12)) g[0] = g[0] + '+'; return g; };
  const ev: FloorEvent[] = [];
  const battles = rng.int(2, 3);
  for (let i = 0; i < battles; i++) { ev.push({ type: 'battle', enemies: group(), done: false }); if (rng.chance(0.15 * (1 + treasureBonus))) ev.push({ type: 'treasure', done: false }); }
  if (rng.chance(0.08)) ev.push({ type: 'fountain', done: false });
  if (depth % 100 === 0) ev.push({ type: 'guardian', enemies: [rng.pick(allAreaBosses())], boss: 'area', done: false });
  else if (depth % 10 === 0) ev.push({ type: 'guardian', enemies: [rng.pick(allMidBosses())], boss: 'mid', done: false });
  else ev.push({ type: 'guardian', enemies: group().slice(0, 3), boss: 'none', done: false });
  return ev;
}
