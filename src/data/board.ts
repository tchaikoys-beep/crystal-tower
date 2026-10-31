import type { BoardNode } from '../core/types';
export const BOARD: BoardNode[] = [
  { id: 'start', name: '転生の祭壇', cat: '基礎', effect: { tag: 'none', value: 0 }, cost: 0, max: 1, adj: ['stat1', 'exp1', 'startlv', 'storage1', 'gambit1'], desc: '起点' },
  { id: 'stat1', name: '全ステ+2%', cat: '基礎', effect: { tag: 'stat_pct', value: 0.02 }, cost: 20, max: 100, adj: ['hp1', 'stat1'], desc: '全ステータス+2%（重ね買い可）' },
  { id: 'hp1', name: 'HP+5%', cat: '基礎', effect: { tag: 'hp_pct', value: 0.05 }, cost: 25, max: 100, adj: ['mp1'], desc: '最大HP+5%（重ね買い可）' },
  { id: 'mp1', name: 'MP+5%', cat: '基礎', effect: { tag: 'mp_pct', value: 0.05 }, cost: 25, max: 100, adj: [], desc: '最大MP+5%（重ね買い可）' },
  { id: 'exp1', name: 'EXP+10%', cat: '成長', effect: { tag: 'exp_pct', value: 0.10 }, cost: 30, max: 50, adj: ['abp1'], desc: '獲得EXP+10%（重ね買い可）' },
  { id: 'abp1', name: 'ABP+10%', cat: '成長', effect: { tag: 'abp_pct', value: 0.10 }, cost: 30, max: 50, adj: ['bond1'], desc: '獲得ABP+10%（重ね買い可）' },
  { id: 'bond1', name: '絆上昇+', cat: '成長', effect: { tag: 'bond_pct', value: 0.25 }, cost: 40, max: 10, adj: [], desc: '仲間モンスターの絆上昇+25%' },
  { id: 'startlv', name: '開始Lv+5', cat: '周回', effect: { tag: 'start_lv', value: 5 }, cost: 60, max: 6, adj: ['startfloor', 'gilkeep'], desc: '転生後の開始Lv+5（最大30）' },
  { id: 'startfloor', name: '開始階+100', cat: '周回', effect: { tag: 'start_floor', value: 100 }, cost: 150, max: 50, adj: ['warpkeep'], desc: '転生後に100階単位で開始階を選べる（最高到達の半分まで）' },
  { id: 'warpkeep', name: 'ワープ維持', cat: '周回', effect: { tag: 'warp_keep', value: 1 }, cost: 200, max: 1, adj: [], desc: '転生後も踏破済みワープ地点が残る' },
  { id: 'gilkeep', name: 'ギル維持+10%', cat: '周回', effect: { tag: 'gil_keep', value: 0.10 }, cost: 40, max: 4, adj: [], desc: '転生時に残るギルの割合+10%' },
  { id: 'storage1', name: '倉庫+50', cat: '収集', effect: { tag: 'storage', value: 50 }, cost: 30, max: 20, adj: ['drop1', 'ranch1'], desc: '倉庫の枠+50' },
  { id: 'drop1', name: 'ドロップ率+5%', cat: '収集', effect: { tag: 'drop_pct', value: 0.05 }, cost: 40, max: 20, adj: ['rare1'], desc: 'ドロップ率+5%' },
  { id: 'rare1', name: 'レア率+5%', cat: '収集', effect: { tag: 'rare_pct', value: 0.05 }, cost: 60, max: 20, adj: ['capture1'], desc: '高レアリティの出現率+5%' },
  { id: 'capture1', name: '捕獲率+5%', cat: '収集', effect: { tag: 'capture_pct', value: 0.05 }, cost: 40, max: 20, adj: [], desc: '捕獲率+5%' },
  { id: 'ranch1', name: '牧場+10', cat: '収集', effect: { tag: 'ranch', value: 10 }, cost: 30, max: 8, adj: [], desc: '魔獣牧場の収容+10' },
  { id: 'gambit1', name: '作戦行+1', cat: '戦闘', effect: { tag: 'gambit_rows', value: 1 }, cost: 50, max: 4, adj: ['abil1', 'reserve1', 'mslot'], desc: '作戦の行数+1' },
  { id: 'mslot', name: 'モンスター枠+1', cat: '戦闘', effect: { tag: 'monster_slots', value: 1 }, cost: 80, max: 2, adj: [], desc: '前線のモンスター枠+1（最大4）' },
  { id: 'abil1', name: 'サポート枠+1', cat: '戦闘', effect: { tag: 'ability_slots', value: 1 }, cost: 120, max: 1, adj: ['cmd1'], desc: 'サポートアビリティの装備枠を3に' },
  { id: 'cmd1', name: 'コマンド枠+1', cat: '戦闘', effect: { tag: 'cmd_slots', value: 1 }, cost: 120, max: 1, adj: [], desc: 'コマンドアビリティの装備枠を3に' },
  { id: 'reserve1', name: '控え枠+1', cat: '戦闘', effect: { tag: 'reserve', value: 1 }, cost: 60, max: 4, adj: ['midboss_capture'], desc: '控えの枠+1' },
  { id: 'midboss_capture', name: '中ボス捕獲', cat: '解放', effect: { tag: 'midboss_capture', value: 1 }, cost: 300, max: 1, adj: [], desc: '中ボスを捕獲できる' },
];
export const BLESSINGS = [
  { id: 'wind', name: '風のクリスタル', desc: '素早さ+10%、逃走確実' },
  { id: 'fire', name: '火のクリスタル', desc: '攻撃+15%、防御-10%' },
  { id: 'water', name: '水のクリスタル', desc: '回復量+20%、MP+20%' },
  { id: 'earth', name: '土のクリスタル', desc: '防御+15%、素早さ-10%' },
];
export const TRIALS = [
  { id: 'strong', name: '強敵', desc: '敵HP・攻撃×2', mult: 1.5 },
  { id: 'noitem', name: '無薬', desc: '戦闘中アイテム禁止', mult: 1.3 },
  { id: 'solo', name: '孤高', desc: '英雄1人、仲間なし', mult: 2.0 },
  { id: 'nobeast', name: '獣禁', desc: '仲間モンスター禁止', mult: 1.5 },
];

// ---- 転生ボード第2面（超ボス撃破で層ごとに解放）
BOARD.push(
  // I：ギルガメッシュ（真）
  { id: 'p2_root1', name: '第2面・I 起点', cat: '第2面・I', effect: { tag: 'none', value: 0 }, cost: 0, max: 1, adj: ['p2_stat', 'p2_drop', 'p2_exp', 'p2_start'], desc: 'ギルガメッシュ（真）の撃破で解放', req: 'gilgamesh_true', root: true },
  { id: 'p2_stat', name: '全ステ+3%', cat: '第2面・I', effect: { tag: 'stat_pct', value: 0.03 }, cost: 60, max: 50, adj: [], desc: '全ステータス+3%（重ね買い可）', req: 'gilgamesh_true' },
  { id: 'p2_drop', name: 'ドロップ率+5%', cat: '第2面・I', effect: { tag: 'drop_pct', value: 0.05 }, cost: 80, max: 10, adj: [], desc: 'ドロップ率+5%（重ね買い可）', req: 'gilgamesh_true' },
  { id: 'p2_exp', name: 'EXP+20%', cat: '第2面・I', effect: { tag: 'exp_pct', value: 0.20 }, cost: 80, max: 10, adj: [], desc: '獲得EXP+20%（重ね買い可）', req: 'gilgamesh_true' },
  { id: 'p2_start', name: '開始階+100（第2面）', cat: '第2面・I', effect: { tag: 'start_floor', value: 100 }, cost: 200, max: 30, adj: [], desc: '転生後の開始階の選択肢を増やす', req: 'gilgamesh_true' },
  // II：プロトバハムート
  { id: 'p2_root2', name: '第2面・II 起点', cat: '第2面・II', effect: { tag: 'none', value: 0 }, cost: 0, max: 1, adj: ['p2_mslot', 'p2_cmd', 'p2_stones', 'p2_reserve'], desc: 'プロトバハムートの撃破で解放', req: 'proto_bahamut', root: true },
  { id: 'p2_mslot', name: 'モンスター枠+1（第2面）', cat: '第2面・II', effect: { tag: 'monster_slots', value: 1 }, cost: 500, max: 1, adj: [], desc: '前線のモンスター枠+1（最大5）', req: 'proto_bahamut' },
  { id: 'p2_cmd', name: 'コマンド枠+1（第2面）', cat: '第2面・II', effect: { tag: 'cmd_slots', value: 1 }, cost: 500, max: 1, adj: [], desc: 'コマンドアビリティの装備枠+1', req: 'proto_bahamut' },
  { id: 'p2_stones', name: '魔石容量+4', cat: '第2面・II', effect: { tag: 'ability_slots', value: 1 }, cost: 400, max: 2, adj: [], desc: 'サポートアビリティの魔石容量+4（重ね買い可）', req: 'proto_bahamut' },
  { id: 'p2_reserve', name: '控え+2', cat: '第2面・II', effect: { tag: 'reserve', value: 2 }, cost: 300, max: 2, adj: [], desc: '控えの人数+2（重ね買い可）', req: 'proto_bahamut' },
  // III：ペナンス
  { id: 'p2_root3', name: '第2面・III 起点', cat: '第2面・III', effect: { tag: 'none', value: 0 }, cost: 0, max: 1, adj: ['p2_rare', 'p2_mastery', 'p2_tp', 'p2_moves'], desc: 'ペナンスの撃破で解放', req: 'penance', root: true },
  { id: 'p2_rare', name: 'レア個体率+1%', cat: '第2面・III', effect: { tag: 'rare_mon', value: 0.01 }, cost: 600, max: 3, adj: [], desc: '捕獲時の●レア個体率+1%（基本1%）', req: 'penance' },
  { id: 'p2_mastery', name: '熟練度上昇+50%', cat: '第2面・III', effect: { tag: 'mastery_pct', value: 0.5 }, cost: 500, max: 2, adj: [], desc: '武器・魔法の熟練度の上がりやすさ+50%', req: 'penance' },
  { id: 'p2_tp', name: '転生ポイント+20%', cat: '第2面・III', effect: { tag: 'tp_pct', value: 0.2 }, cost: 800, max: 5, adj: [], desc: '転生で得るTP+20%（重ね買い可）', req: 'penance' },
  { id: 'p2_moves', name: 'モンスター技枠+1', cat: '第2面・III', effect: { tag: 'moves', value: 1 }, cost: 700, max: 2, adj: [], desc: '仲間モンスターの技枠+1（最大6）', req: 'penance' },
);
