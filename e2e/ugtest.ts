// 裏タワーと超ボスの動作確認（ロジックのみ）
import { newGame, enterUnderground, startBattle, finishBattle, currentEvent, climb, superBossEvent, superBossAvailable, undergroundUnlocked, effFloor, setParty } from '/home/user/crystal-tower/src/core/game';
const s = newGame('bartz', 7);
s.maxFloorEver = 1000; s.rebirths = 10;
for (const h of Object.values(s.heroes)) h.level = 99;
console.log('omega available', superBossAvailable(s, 'omega'), 'ug unlocked', undergroundUnlocked(s));
const ev = superBossEvent('omega');
const b = startBattle(s, ev);
console.log('omega hp', b.enemies[0].stats.hp, 'atk', b.enemies[0].atk, 'law', b.opt.law);
// 強制勝利して報酬確認
for (const e of b.enemies) e.hp = 0; b.result = 'won';
const sum = finishBattle(s, b, ev);
console.log(sum.lines.join(' / '));
console.log('ug unlocked now', undergroundUnlocked(s), 'tp', s.tp);
enterUnderground(s, 1);
console.log('underground floor', s.run.floor, 'eff', effFloor(s), 'events', s.run.events.map(e => e.type + ':' + ('enemies' in e ? e.enemies.join(',') : '')).join(' | '));
let e2 = currentEvent(s)!;
const b2 = startBattle(s, e2);
console.log('ug enemy', b2.enemies.map(e => `${e.name} hp${e.stats.hp}`).join(', '), 'law', b2.opt.law?.name);
s.run.cleared = true; climb(s); console.log('after climb depth', s.run.floor, 'maxDepth', s.run.maxDepth, s.maxDepthEver);
