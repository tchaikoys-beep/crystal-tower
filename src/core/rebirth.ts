import type { GameState } from './state';
import { rebirthPoints } from './formulas';
import { BOARD, TRIALS } from '../data/board';
import { boardValue } from './entity';

export function trialMult(trials: string[]): number { return trials.reduce((m, t) => m * (TRIALS.find(x => x.id === t)?.mult ?? 1), 1); }
export function computeTP(s: GameState): number {
  const base = rebirthPoints(s.run.maxFloor, s.run.areaBossKills, s.run.gateKills, s.run.newFloors, s.run.maxDepth ?? 0);
  const penalty = 1 - 0.1 * s.run.redCards;
  return Math.max(0, Math.round(base * trialMult(s.trials) * Math.max(0.3, penalty)));
}
export function canBuy(s: GameState, id: string): { ok: boolean; reason?: string; cost: number } {
  const node = BOARD.find(b => b.id === id)!;
  const n = s.board[id] ?? 0;
  const cost = Math.round(node.cost * Math.pow(1.5, n));
  const maxN = node.max + ((s.superBosses?.shinryu ?? 0) > 0 && node.max > 1 ? 10 : 0);
  if (n >= maxN) return { ok: false, reason: '上限', cost };
  const adjacentOwned = node.id === 'start' || BOARD.some(b => (s.board[b.id] ?? 0) > 0 && b.adj.includes(id)) || (s.board[id] ?? 0) > 0;
  if (!adjacentOwned) return { ok: false, reason: '隣接マスが未開放', cost };
  if (s.tp < cost) return { ok: false, reason: 'TP不足', cost };
  if (node.id === 'startlv' && n >= 6) return { ok: false, reason: '上限', cost };
  return { ok: true, cost };
}
export function buyNode(s: GameState, id: string): boolean {
  const c = canBuy(s, id);
  if (!c.ok) return false;
  s.tp -= c.cost;
  s.board[id] = (s.board[id] ?? 0) + 1;
  return true;
}
export function startFloorOptions(s: GameState): number[] {
  const steps = boardValue(s, 'start_floor') / 100;
  const maxStart = Math.floor(s.maxFloorEver / 2 / 100) * 100;
  const out = [1];
  for (let f = 100; f <= Math.min(maxStart, steps * 100); f += 100) out.push(f + 1);
  return out;
}
