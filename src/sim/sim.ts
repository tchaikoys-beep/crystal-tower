// バランス確認用シミュレータ: npm run sim [rebirths] [maxFloor]
import { newGame, startBattle, finishBattle, currentEvent, climb, resolveSimpleEvent, equip, toHub, warpTo, doRebirth, setParty, buyItem, partyCombatants, computeTP, maxMonsterSlots, changeJob, defaultGambits, readTome } from '../core/game';
import type { GameState } from '../core/state';
import { buyNode, canBuy } from '../core/rebirth';
import { ITEMS } from '../data/items';
import { itemOf, canEquip, slotForKind } from '../core/entity';
import { SLOTS } from '../core/types';
import { sellItem, isEquipped } from '../core/game';

const REBIRTHS = Number(process.argv[2] ?? 3);
const MAX_FLOOR = Number(process.argv[3] ?? 400);

function autoEquip(s: GameState) {
  for (const hs of Object.values(s.heroes)) {
    for (const it of s.inventory) {
      const base = ITEMS[it.base];
      const slots = slotForKind(base.kind); if (!slots.length) continue;
      if (!canEquip(hs, it).ok) continue;
      const pm = 1 + 0.02 * it.found;
      const score = ((base.power ?? 0) * (base.element ? 0 : 1) + (base.def ?? 0) * 2 + (base.mdef ?? 0)) * pm + it.affixes.length * 5 + it.tier * 10;
      for (const sl of slots) {
        const cur = itemOf(s, hs.equip[sl]);
        const curScore = cur ? ((ITEMS[cur.base].power ?? 0) * (ITEMS[cur.base].element ? 0 : 1) + (ITEMS[cur.base].def ?? 0) * 2 + (ITEMS[cur.base].mdef ?? 0)) * (1 + 0.02 * cur.found) + cur.affixes.length * 5 + cur.tier * 10 : -1;
        const inUse = Object.values(s.heroes).some(h => SLOTS.some(x => h.equip[x] === it.uid));
        if (!inUse && score > curScore) { equip(s, hs.id, it.uid, sl); break; }
      }
    }
  }
}
function shop(s: GameState) {
  for (const it of [...s.inventory]) if (!isEquipped(s, it.uid) && it.rarity === 'normal' || (!isEquipped(s, it.uid) && s.inventory.length > 150)) sellItem(s, it.uid);
  while (s.gil > 200 && (s.bag.potion ?? 0) < 15) if (buyItem(s, 'potion')) break;
  while (s.gil > 1000 && (s.bag.hi_potion ?? 0) < 5) if (buyItem(s, 'hi_potion')) break;
  while (s.gil > 1000 && (s.bag.phoenix_down ?? 0) < 3) if (buyItem(s, 'phoenix_down')) break;
  while (s.gil > 2000 && (s.bag.magi_cage ?? 0) < 5) if (buyItem(s, 'magi_cage')) break;
  while (s.gil > 20000 && (s.bag.x_potion ?? 0) < 10) if (buyItem(s, 'x_potion')) break;
  while (s.gil > 5000 && (s.bag.ether ?? 0) < 10) if (buyItem(s, 'ether')) break;
  // 回復役：フリオニールを白魔道士に
  const fir = s.heroes.firion;
  if (fir && fir.job !== 'whitemage') { changeJob(s, 'firion', 'whitemage'); fir.gambits = [{ cond: 'ally_dead', action: 'skill:raise', on: true }, { cond: 'ally_hp_lt_50', action: 'skill:curaja', on: true }, { cond: 'ally_hp_lt_50', action: 'skill:curaga', on: true }, { cond: 'ally_hp_lt_50', action: 'skill:cura', on: true }, { cond: 'ally_hp_lt_50', action: 'skill:cure', on: true }, { cond: 'ally_bad_status', action: 'skill:esuna', on: true }, { cond: 'self_hp_lt_30', action: 'item:ether', on: true }, { cond: 'always', action: 'attack', on: true }]; }
  for (const hs of Object.values(s.heroes)) {
    if (!hs.gambits.some(g => g.action === 'item:x_potion')) hs.gambits.splice(1, 0, { cond: 'ally_hp_lt_30', action: 'item:x_potion', on: true });
    for (const tm of Object.keys(s.bag)) if (tm.startsWith('tome_') && (s.bag[tm] ?? 0) > 0) readTome(s, hs.id, tm);
    if (hs.job === 'whitemage' && hs.mp < 20) { /* noop */ }
  }
  for (const hs of Object.values(s.heroes)) if (!hs.gambits.some(g => g.action === 'item:magi_cage')) hs.gambits.splice(1, 0, { cond: 'enemy_capturable', action: 'item:magi_cage', on: true });
}
function fightFloor(s: GameState): 'ok' | 'dead' {
  let guard = 0;
  while (true) {
    const ev = currentEvent(s);
    if (!ev) return 'ok';
    if (ev.type === 'treasure' || ev.type === 'fountain') { resolveSimpleEvent(s); continue; }
    const b = startBattle(s, ev);
    let t = 0;
    while (b.result === 'running' && t < 300) { b.tick(0.5); t += 0.5; if (b.pending) b.command({ cmd: b.pending.commands[0] }); }
    if (b.result === 'running') { b.result = 'lost'; }
    if (b.result === 'lost' && process.env.DEBUG) console.log('bag', JSON.stringify(s.bag), 'floor', s.run.floor, 'party', b.players.map(p => `${p.name}Lv${p.level} hp${p.stats.hp} atk${p.atk} def${p.def}`).join(' | '));
      console.log(b.log.slice(-25).map(l => l.text).join('\n'));
    finishBattle(s, b, ev);
    if (b.result === 'lost') return 'dead';
    if (++guard > 20) return 'ok';
  }
}
function runOnce(s: GameState, label: string) {
  let deaths = 0, battles0 = s.stats.battles, deathsHere = 0, deathFloor = 0;
  let lastPrint = 0;
  const t0 = Date.now();
  while (s.run.floor < MAX_FLOOR) {
    // 事前準備
    const party = partyCombatants(s);
    const hpRatio = party.reduce((a, c) => a + c.hp / c.stats.hp, 0) / party.length;
    if (hpRatio < 0.5 || party.some(c => c.hp <= 0)) { const f = s.run.floor; toHub(s); shop(s); autoEquip(s); warpTo(s, f); }
    const r = fightFloor(s);
    if (r === 'dead') { deaths++; if (s.run.maxFloor === deathFloor) deathsHere++; else { deathFloor = s.run.maxFloor; deathsHere = 1; } if (deathsHere > 3) break; const f = Math.max(1, s.run.maxFloor); shop(s); autoEquip(s); warpTo(s, f); continue; }
    climb(s);
    // 新英雄をパーティへ
    const heroes = Object.keys(s.heroes).map(k => 'h:' + k).slice(0, 4);
    const mons = [...s.monsters].sort((a, b) => b.level - a.level).slice(0, maxMonsterSlots(s)).map(m => 'm:' + m.uid);
    setParty(s, [...heroes, ...mons], []);
    if (s.run.floor - lastPrint >= 25) { lastPrint = s.run.floor; const p = partyCombatants(s); console.log(`  ${label} 階${s.run.floor} Lv${p.map(c => c.level).join('/')} HP${p.map(c => c.stats.hp).join('/')} atk${p.map(c => c.atk).join('/')} deaths${deaths} gil${s.gil} mons${s.monsters.length}`); }
  }
  console.log(`${label}: 到達${s.run.maxFloor}階 戦闘${s.stats.battles - battles0} 死亡${deaths} 捕獲${s.monsters.length} 倉庫${s.inventory.length} TP見込み${computeTP(s)} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
const s = newGame('bartz', 42);
for (let r = 0; r <= REBIRTHS; r++) {
  runOnce(s, `周回${r + 1}`);
  // 転生
  doRebirth(s, 'fire', [], 1);
  // ボードを買えるだけ買う
  let bought = true;
  while (bought) { bought = false; for (const id of ['stat1', 'hp1', 'mp1', 'exp1', 'abp1', 'startlv', 'drop1', 'rare1', 'gambit1', 'mslot', 'reserve1', 'capture1']) if (canBuy(s, id).ok) { buyNode(s, id); bought = true; } }
  autoEquip(s);
}
