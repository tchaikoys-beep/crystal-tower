import type { AutoMode, AffixRoll, ItemInstance, Slot, Stats } from './types';

export interface Gambit { cond: string; action: string; on: boolean }
export const GAMBIT_CONDS: { id: string; name: string }[] = [
  { id: 'always', name: 'いつでも' },
  { id: 'ally_hp_lt_50', name: '味方HP<50%' },
  { id: 'ally_hp_lt_30', name: '味方HP<30%' },
  { id: 'self_hp_lt_30', name: '自分HP<30%' },
  { id: 'ally_dead', name: '味方が戦闘不能' },
  { id: 'ally_bad_status', name: '味方が状態異常' },
  { id: 'enemy_weak', name: '敵が弱点持ち' },
  { id: 'enemy_hp_lt_30', name: '敵HP<30%' },
  { id: 'enemy_capturable', name: '敵が捕獲圏内' },
  { id: 'enemy_boss', name: '敵がボス' },
  { id: 'enemy_count_ge_2', name: '敵が2体以上' },
  { id: 'enemy_count_ge_3', name: '敵が3体以上' },
  { id: 'mp_gt_10', name: '自分MP>10%' },
  { id: 'mp_gt_30', name: '自分MP>30%' },
  { id: 'mp_gt_60', name: '自分MP>60%' },
  { id: 'limit_ready', name: 'リミット可' },
  { id: 'not_buffed', name: '自分に強化なし' },
  { id: 'once', name: '1戦闘に1回' },
];

export interface HeroState {
  id: string;
  level: number;
  exp: number;
  job: string;
  jobs: Record<string, { lv: number; abp: number }>;
  learned: string[];
  equipped: string[];      // サポート枠
  equippedCmds: string[];  // コマンド枠（カテゴリid）
  learnedSkills: string[]; // 装備から覚えた技
  tomes: string[];         // 読んだ魔法書（魔法id）
  mastery: Record<string, number>;      // 武器熟練度XP（武器種別）
  spellMastery: Record<string, number>; // 魔法熟練度XP（魔法id）
  equip: Record<Slot, string | null>;
  itemAp: Record<string, number>;
  gambits: Gambit[];
  limit: number;
  hp: number;
  mp: number;
}
export interface MonsterAlly {
  uid: string;
  id: string;
  level: number;
  exp: number;
  bond: number;
  bondXp: number;
  iv: Stats;
  nature: string;
  traits: AffixRoll[];
  rare: boolean;
  grade: 'normal' | 'plus' | 'rare' | 'plus_rare';
  learned: string[];        // レベルアップで覚えた技
  moves: string[] | null;   // 戦闘で使う技（最大4）。null＝自動
  acc: string | null;
  gambits: Gambit[];
  hp: number;
  mp: number;
  food: Partial<Stats>;
}
export type FloorEvent =
  | { type: 'battle'; enemies: string[]; done: boolean }
  | { type: 'guardian'; enemies: string[]; boss: 'none' | 'mid' | 'area'; done: boolean; scale?: number; superBoss?: string }
  | { type: 'treasure'; done: boolean }
  | { type: 'fountain'; done: boolean };

export interface RunState {
  floor: number;
  maxFloor: number;
  warps: number[];
  areaBossKills: number;
  gateKills: number;
  newFloors: number;
  cards: Record<number, number>;   // 10階ブロック → イエローカード枚数
  redCards: number;
  antilaw: number[];                // ロウを消したブロック
  events: FloorEvent[];
  eventIndex: number;
  cleared: boolean;                 // この階の守護者を倒した
  underground: boolean;             // 裏タワー（地下）にいる
  undergroundWarps: number[];
  maxDepth: number;
}
export type MissionType = 'kill' | 'capture' | 'treasure' | 'law' | 'reach' | 'collect';
export interface Mission {
  id: string; type: MissionType; target?: string; count: number; progress: number; floorMin: number;
  reward: { gil: number; item?: 'crystal' | 'legend' | 'ultima'; bag?: Record<string, number>; tp?: number }; title: string;
}
export interface MissionState { offers: Mission[]; active: Mission[]; completed: number }
export interface GameState {
  missions: MissionState;
  version: number;
  seed: number;
  rngState: number;
  heroes: Record<string, HeroState>;
  party: string[];      // 'h:<heroId>' | 'm:<uid>'
  reserve: string[];
  monsters: MonsterAlly[];
  inventory: ItemInstance[];
  bag: Record<string, number>;
  gil: number;
  run: RunState;
  maxFloorEver: number;
  maxDepthEver: number;
  superBosses: Record<string, number>; // 超ボス撃破回数
  autoModes: Record<string, AutoMode>; // おまかせ作戦のモード（メンバーごと）
  rebirths: number;
  tp: number;
  board: Record<string, number>;
  blessing: string | null;
  trials: string[];
  codex: { items: string[]; affixes: string[]; monsters: string[]; captured: Record<string, Partial<Record<'normal' | 'plus' | 'rare' | 'plus_rare', number>>> };
  stats: { battles: number; kills: number; captures: number; rebirthLog: { floor: number; tp: number }[] };
  uidCounter: number;
  settings: { auto: boolean; speed: number; autoGambit: boolean; hand: 'right' | 'left' };
}
export const SAVE_VERSION = 1;
