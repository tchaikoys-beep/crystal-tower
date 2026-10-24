// スケーリング式とダメージ式。全部ここに集約する（企画書 第3章・第9章）
import type { Stats } from './types';

export const FLOOR_PER_AREA = 100;
export const TIER_FLOORS = 250;

export function areaOf(floor: number): number { return Math.max(1, Math.ceil(floor / FLOOR_PER_AREA)); }
export function tierOf(floor: number): number { return Math.max(1, Math.ceil(floor / TIER_FLOORS)); }
export function isWarpFloor(f: number): boolean { return f % 10 === 0; }
export function isMidBossFloor(f: number): boolean { return f % 10 === 0 && f % 100 !== 0; }
export function isAreaBossFloor(f: number): boolean { return f % 100 === 0; }
export function isGateFloor(f: number): boolean { return f % 500 === 0; }

// 敵の階層スケール（シミュレータで調整する前提の初期値）
const EXP_K = 1.0006;
export function enemyBase(floor: number): Stats {
  const f = Math.max(1, floor);
  const e = Math.pow(EXP_K, f);
  return {
    hp: Math.round(15 * Math.pow(f, 1.04) * e + 10),
    mp: Math.round(10 + f),
    str: Math.round((2 + 0.55 * f) * e),
    vit: Math.round(1 + 0.7 * Math.pow(f, 0.9)),
    mag: Math.round((2 + 0.7 * f) * e),
    spr: Math.round(1 + 0.6 * Math.pow(f, 0.9)),
    spd: Math.round(5 + 0.3 * Math.pow(f, 0.8)),
    luck: Math.round(5 + f * 0.1),
  };
}
export function enemyExp(floor: number): number { return Math.round(8 * Math.pow(floor, 1.3)); }
export function enemyGil(floor: number): number { return Math.round(5 * Math.pow(floor, 1.15)); }

// 英雄のLvステータス
export function heroBase(level: number): Stats {
  const lv = level;
  return {
    hp: 40 + 24 * lv,
    mp: 10 + 4 * lv,
    str: 5 + lv,
    vit: 5 + lv,
    mag: 5 + lv,
    spr: 5 + lv,
    spd: 8 + lv * 0.5,
    luck: 5 + lv * 0.5,
  };
}
export function expToNext(level: number): number { return Math.round(30 * Math.pow(level, 2.3)); }
export function abpToNext(jobLv: number): number { return Math.round(10 * Math.pow(jobLv, 1.6)); }
export const MAX_LEVEL = 99;
export const MAX_JOB_LEVEL = 20;

// 装備の付加値
export function affixValue(base: number, tier: number, roll: number): number {
  return base * (1 + 0.3 * (tier - 1)) * roll;
}
// 装備の基礎値は入手階で伸びる（店売りは1階扱い）
export function itemPowerMult(found: number, tier: number): number { return (1 + 0.025 * Math.max(0, found - 1)) * (1 + 0.3 * (tier - 1)); }
export function equipLevelReq(tier: number): number { return tier <= 1 ? 1 : 5 * tier; }

// ダメージ
export function physDamage(atk: number, str: number, def: number, mult: number, rand: number): number {
  const base = (atk * 2 + str) * mult;
  return Math.max(1, Math.round(base * (100 / (100 + def)) * rand));
}
export function magicDamage(power: number, mag: number, mdef: number, mult: number, rand: number): number {
  const base = (power + mag * 1.6) * mult;
  return Math.max(1, Math.round(base * (100 / (100 + mdef)) * rand));
}
export function healAmount(power: number, mag: number, spr: number): number {
  return Math.round(power + (mag + spr) * 1.2);
}
// ATB: 1秒あたりのゲージ増加。spdで決まる
export function atbRate(spd: number): number { return 18 + spd * 0.6; }

// 転生ポイント
export function rebirthPoints(maxFloor: number, areaBossKills: number, gateKills: number, newFloors: number, maxDepth = 0): number {
  return Math.floor(maxFloor / 4) + 5 * areaBossKills + 20 * gateKills + 2 * newFloors + Math.floor(maxDepth / 2);
}
// 捕獲率
export function captureChance(baseRate: number, hpRatio: number, statusBonus: number, bonus: number): number {
  return Math.min(0.95, baseRate * (1 - hpRatio) * statusBonus * (1 + bonus));
}

// 熟練度（FF2式）：XP から Lv1〜16
export const MAX_MASTERY = 16;
export function masteryLevel(xp: number): number { return Math.min(MAX_MASTERY, Math.floor(Math.sqrt(xp / 6))); }
export function masteryNext(level: number): number { return 6 * (level + 1) * (level + 1); }
export function masteryGain(floor: number, maxFloorEver: number): number { return Math.max(0.05, Math.min(1, floor / Math.max(1, maxFloorEver))); }
