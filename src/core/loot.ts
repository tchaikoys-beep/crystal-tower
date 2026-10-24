import type { ItemInstance, Rarity, AffixRoll, ItemKind } from './types';
import { RARITY_AFFIXES } from './types';
import { Rng } from './rng';
import { tierOf, affixValue, enemyExp, enemyGil } from './formulas';
import { AFFIXES, UNIQUES } from '../data/affixes';
import { ITEMS, TOMES } from '../data/items';
import { SKILLS } from '../data/skills';
import { MONSTERS, areaFor } from '../data/monsters';

export interface DropContext { drop: number; rare: number; gil: number; exp: number; lawViolated: boolean; lawFavored: boolean; uid: () => string }
export interface DropResult { items: ItemInstance[]; bag: Record<string, number>; gil: number; exp: number }

const RARITY_W: Record<Rarity, number> = { normal: 60, mithril: 27, crystal: 10, legend: 2.7, ultima: 0.3 };
export function rollRarity(rng: Rng, rareBonus: number, boss: boolean, shiftDown: boolean): Rarity {
  const w = { ...RARITY_W };
  w.crystal *= 1 + rareBonus; w.legend *= (1 + rareBonus) * (boss ? 10 : 1); w.ultima *= (1 + rareBonus) * (boss ? 10 : 1);
  let r = rng.weighted(Object.keys(w) as Rarity[], k => w[k]);
  if (shiftDown) { const order: Rarity[] = ['normal', 'mithril', 'crystal', 'legend', 'ultima']; r = order[Math.max(0, order.indexOf(r) - 1)]; }
  return r;
}
export function rollAffixes(rng: Rng, kind: ItemKind, tier: number, count: number, rarity: Rarity): AffixRoll[] {
  const pool = Object.values(AFFIXES).filter(a => a.kinds.includes(kind));
  const rolls: AffixRoll[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count && pool.length; i++) {
    const cands = pool.filter(a => !used.has(a.id));
    if (!cands.length) break;
    const a = rng.weighted(cands, x => x.weight);
    used.add(a.id);
    const t = tier + (rarity === 'ultima' || rarity === 'legend' ? (rng.chance(0.3) ? 1 : 0) : 0);
    rolls.push({ id: a.id, value: Math.round(affixValue(a.base, t, rng.range(0.8, 1.2)) * 1000) / 1000 });
  }
  return rolls;
}
export function generateItem(rng: Rng, floor: number, baseId: string, rarity: Rarity, uid: string): ItemInstance {
  const base = ITEMS[baseId];
  const tier = tierOf(floor);
  const it: ItemInstance = { uid, base: baseId, rarity, tier, affixes: rollAffixes(rng, base.kind, tier, RARITY_AFFIXES[rarity], rarity), found: floor };
  if (rarity === 'ultima') it.unique = rng.pick(Object.keys(UNIQUES));
  return it;
}
export function rollDrops(rng: Rng, floor: number, enemies: { id: string; boss: boolean; captured: boolean; elite?: boolean }[], ctx: DropContext): DropResult {
  const res: DropResult = { items: [], bag: {}, gil: 0, exp: 0 };
  const area = areaFor(floor);
  for (const e of enemies) {
    const def = MONSTERS[e.id];
    const bossMult = e.boss ? 6 : 1;
    res.exp += Math.round(enemyExp(floor) * bossMult * (1 + ctx.exp) * (e.captured ? 0.5 : 1));
    res.gil += Math.round(enemyGil(floor) * bossMult * (1 + ctx.gil) * (ctx.lawFavored ? 1.2 : 1));
    if (e.captured) continue;
    const dropP = (e.boss ? 1.0 : 0.35) * (e.elite ? 2 : 1) * (1 + ctx.drop) * (ctx.lawFavored ? 1.2 : 1);
    if (rng.chance(dropP)) {
      const baseId = rng.pick(area.itemPool);
      res.items.push(generateItem(rng, floor, baseId, rollRarity(rng, ctx.rare + (e.elite ? 0.5 : 0), e.boss, ctx.lawViolated), ctx.uid()));
    }
    if (e.boss && rng.chance(0.5)) res.items.push(generateItem(rng, floor, rng.pick(area.itemPool), rollRarity(rng, ctx.rare + 0.5, true, false), ctx.uid()));
    if (def.material && rng.chance(e.boss ? 1 : 0.25 * (1 + ctx.drop))) res.bag[def.material] = (res.bag[def.material] ?? 0) + 1;
    if (rng.chance(0.2 * (1 + ctx.drop))) { const c = rng.weighted(['potion', 'hi_potion', 'ether', 'antidote', 'phoenix_down', 'magi_cage', 'bomb_fragment'], k => k === 'potion' ? 10 : k === 'magi_cage' ? 2 : 3); res.bag[c] = (res.bag[c] ?? 0) + 1; }
    // 魔法書：エリアに応じたLv。ボスは高確率
    const tomePool = TOMES.filter(id => (SKILLS[id.replace(/^tome_/, '')].level ?? 4) - 3 <= area.id);
    if (tomePool.length && rng.chance(e.boss ? 0.5 : 0.015 * (1 + ctx.drop))) { const tm = rng.pick(tomePool); res.bag[tm] = (res.bag[tm] ?? 0) + 1; }
    if (rng.chance(0.08)) res.bag.mithril = (res.bag.mithril ?? 0) + 1;
    if (rng.chance(0.03)) res.bag.magicite = (res.bag.magicite ?? 0) + 1;
  }
  return res;
}
