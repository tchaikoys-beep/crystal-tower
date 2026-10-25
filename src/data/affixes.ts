import type { AffixDef } from '../core/types';
import { ELEMENT_JP, STATUS_JP } from '../core/types';
const pct = (v: number) => `${Math.round(v * 100)}%`;
const W: AffixDef['kinds'] = ['weapon'];
const A: AffixDef['kinds'] = ['shield', 'head', 'body'];
const ACC: AffixDef['kinds'] = ['acc'];
const ANY: AffixDef['kinds'] = ['weapon', 'shield', 'head', 'body', 'acc'];
export const AFFIXES: Record<string, AffixDef> = {};
function add(...l: AffixDef[]) { for (const a of l) AFFIXES[a.id] = a; }
add(
  { id: 'strong', name: '強者の', cat: 'attack', kinds: W, base: 0.12, perTier: 0.3, weight: 10, desc: v => `物理攻撃+${pct(v)}` },
  { id: 'sage', name: '賢者の', cat: 'attack', kinds: W, base: 0.12, perTier: 0.3, weight: 8, desc: v => `魔法攻撃+${pct(v)}` },
  { id: 'crit', name: '必殺の', cat: 'attack', kinds: W, base: 0.08, perTier: 0.3, weight: 6, desc: v => `クリティカル率+${pct(v)}` },
  { id: 'multi', name: '連撃の', cat: 'attack', kinds: W, base: 0.10, perTier: 0.3, weight: 4, desc: v => `追加攻撃率${pct(v)}` },
  { id: 'pierce', name: '貫通の', cat: 'attack', kinds: W, base: 0.15, perTier: 0.3, weight: 4, desc: v => `防御無視${pct(v)}` },
);
for (const el of ['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'holy', 'dark', 'poison'] as const) {
  add({ id: 'el_' + el, name: ELEMENT_JP[el] + 'の', cat: 'element', kinds: W, base: 0.15, perTier: 0.3, weight: 5, element: el, desc: v => `攻撃に${ELEMENT_JP[el]}属性、${ELEMENT_JP[el]}ダメ+${pct(v)}` });
  add({ id: 'res_' + el, name: ELEMENT_JP[el] + '耐性の', cat: 'resist', kinds: [...A, ...ACC], base: 0.25, perTier: 0.2, weight: 4, element: el, desc: v => `${ELEMENT_JP[el]}被ダメ-${pct(Math.min(1, v))}` });
}
add(
  { id: 'slay_beast', name: '獣殺しの', cat: 'slayer', kinds: W, base: 0.3, perTier: 0.3, weight: 4, family: 'beast', desc: v => `獣族へダメ+${pct(v)}` },
  { id: 'slay_undead', name: '不死殺しの', cat: 'slayer', kinds: W, base: 0.3, perTier: 0.3, weight: 4, family: 'undead', desc: v => `不死族へダメ+${pct(v)}` },
  { id: 'slay_dragon', name: '竜殺しの', cat: 'slayer', kinds: W, base: 0.3, perTier: 0.3, weight: 3, family: 'dragon', desc: v => `竜族へダメ+${pct(v)}` },
  { id: 'slay_boss', name: 'ボス殺しの', cat: 'slayer', kinds: W, base: 0.15, perTier: 0.3, weight: 2, family: 'boss', desc: v => `ボスへダメ+${pct(v)}` },
);
for (const st of ['poison', 'sleep', 'slow', 'blind', 'paralyze'] as const) {
  add({ id: 'st_' + st, name: STATUS_JP[st] + 'の', cat: 'status', kinds: W, base: 0.15, perTier: 0.25, weight: 3, status: st, desc: v => `攻撃時${pct(v)}で${STATUS_JP[st]}` });
  add({ id: 'immune_' + st, name: STATUS_JP[st] + '避けの', cat: 'resist', kinds: [...A, ...ACC], base: 0.5, perTier: 0.3, weight: 3, status: st, desc: v => `${STATUS_JP[st]}耐性${pct(Math.min(1, v))}` });
}
add(
  { id: 'sturdy', name: '堅牢な', cat: 'defense', kinds: A, base: 0.12, perTier: 0.3, weight: 10, desc: v => `物理防御+${pct(v)}` },
  { id: 'warded', name: '魔防の', cat: 'defense', kinds: A, base: 0.12, perTier: 0.3, weight: 8, desc: v => `魔法防御+${pct(v)}` },
  { id: 'vital', name: '生命の', cat: 'defense', kinds: [...A, ...ACC], base: 0.08, perTier: 0.3, weight: 8, desc: v => `最大HP+${pct(v)}` },
  { id: 'arcane', name: '魔力の', cat: 'defense', kinds: [...A, ...ACC], base: 0.08, perTier: 0.3, weight: 6, desc: v => `最大MP+${pct(v)}` },
  { id: 'evasive', name: '回避の', cat: 'defense', kinds: A, base: 0.06, perTier: 0.3, weight: 5, desc: v => `回避率+${pct(v)}` },
  { id: 'swift', name: '疾風の', cat: 'action', kinds: ANY, base: 0.08, perTier: 0.3, weight: 6, desc: v => `素早さ+${pct(v)}` },
  { id: 'first', name: '先制の', cat: 'action', kinds: ANY, base: 0.15, perTier: 0.3, weight: 4, desc: v => `先制率+${pct(v)}` },
  { id: 'regen', name: '再生の', cat: 'action', kinds: ANY, base: 0.02, perTier: 0.3, weight: 4, desc: v => `毎ターンHP${pct(v)}回復` },
  { id: 'vamp', name: '吸血の', cat: 'action', kinds: W, base: 0.05, perTier: 0.3, weight: 4, desc: v => `与ダメの${pct(v)}吸収` },
  { id: 'thief', name: '盗賊の', cat: 'farm', kinds: ACC, base: 0.15, perTier: 0.3, weight: 5, desc: v => `盗む率+${pct(v)}` },
  { id: 'merchant', name: '商人の', cat: 'farm', kinds: ACC, base: 0.15, perTier: 0.3, weight: 6, desc: v => `ギル+${pct(v)}` },
  { id: 'scholar', name: '学者の', cat: 'farm', kinds: ACC, base: 0.10, perTier: 0.3, weight: 6, desc: v => `EXP+${pct(v)}` },
  { id: 'master', name: '師匠の', cat: 'farm', kinds: ACC, base: 0.15, perTier: 0.3, weight: 5, desc: v => `ABP+${pct(v)}` },
  { id: 'lucky', name: '幸運の', cat: 'farm', kinds: ACC, base: 0.08, perTier: 0.3, weight: 5, desc: v => `ドロップ率+${pct(v)}` },
  { id: 'tamer', name: '獣使いの', cat: 'farm', kinds: ACC, base: 0.15, perTier: 0.3, weight: 4, desc: v => `捕獲率+${pct(v)}` },
  { id: 'reborn', name: '転生者の', cat: 'farm', kinds: ACC, base: 0.05, perTier: 0.3, weight: 2, desc: v => `転生ポイント+${pct(v)}` },
);
// モンスター専用の特性（装備には付かない）
add(
  { id: 'm_hp', name: '頑丈な', cat: 'monster', kinds: [], base: 0.12, perTier: 0.3, weight: 6, desc: v => `最大HP+${pct(v)}` },
  { id: 'm_atk', name: '荒ぶる', cat: 'monster', kinds: [], base: 0.10, perTier: 0.3, weight: 6, desc: v => `攻撃+${pct(v)}` },
  { id: 'm_mag', name: '霊感の', cat: 'monster', kinds: [], base: 0.10, perTier: 0.3, weight: 4, desc: v => `魔力+${pct(v)}` },
  { id: 'm_def', name: '鉄壁の', cat: 'monster', kinds: [], base: 0.10, perTier: 0.3, weight: 5, desc: v => `防御+${pct(v)}` },
  { id: 'm_spd', name: '俊足の', cat: 'monster', kinds: [], base: 0.08, perTier: 0.3, weight: 5, desc: v => `素早さ+${pct(v)}` },
  { id: 'm_regen', name: '再生の', cat: 'monster', kinds: [], base: 0.02, perTier: 0.3, weight: 3, desc: v => `毎ターンHP${pct(v)}回復` },
  { id: 'm_crit', name: '狩人の', cat: 'monster', kinds: [], base: 0.06, perTier: 0.3, weight: 4, desc: v => `クリティカル率+${pct(v)}` },
  { id: 'm_eva', name: '霧の', cat: 'monster', kinds: [], base: 0.06, perTier: 0.3, weight: 4, desc: v => `回避+${pct(v)}` },
  { id: 'm_barrier', name: '魔障の', cat: 'monster', kinds: [], base: 0.10, perTier: 0.3, weight: 3, desc: v => `魔法被ダメ-${pct(v)}` },
  { id: 'm_allres', name: '竜鱗の', cat: 'monster', kinds: [], base: 0.08, perTier: 0.3, weight: 2, desc: v => `全属性被ダメ-${pct(v)}` },
  { id: 'm_bond', name: '人懐こい', cat: 'monster', kinds: [], base: 0.25, perTier: 0.2, weight: 3, desc: v => `絆の上がりやすさ+${pct(v)}` },
  { id: 'm_growth', name: '早熟の', cat: 'monster', kinds: [], base: 0.10, perTier: 0.2, weight: 3, desc: v => `獲得EXP+${pct(v)}` },
);
export const UNIQUES: Record<string, { name: string; desc: string }> = {
  brave: { name: 'ブレイブ', desc: 'HP満タン時に攻撃×1.5' },
  genji: { name: '源氏', desc: '常時2回攻撃' },
  ribbon: { name: 'リボン', desc: '全状態異常無効' },
  hermes: { name: 'エルメス', desc: '常時ヘイスト' },
  phoenix: { name: 'フェニックス', desc: '1戦闘1回自動蘇生' },
  cactuar: { name: 'サボテンダー', desc: 'ダメージ固定1000×ティア' },
};
export function affix(id: string): AffixDef { const a = AFFIXES[id]; if (!a) throw new Error('unknown affix ' + id); return a; }

// セット効果：同じセットの装備を規定数つけると発動
export interface SetDef { id: string; name: string; pieces: number; desc: string }
export const SETS: Record<string, SetDef> = {
  mithril: { id: 'mithril', name: 'ミスリル', pieces: 3, desc: '3点：素早さ+15%' },
  diamond: { id: 'diamond', name: 'ダイヤ', pieces: 3, desc: '3点：魔法被ダメ-30%' },
  crystal: { id: 'crystal', name: 'クリスタル', pieces: 3, desc: '3点：全属性被ダメ半減' },
  genji: { id: 'genji', name: '源氏', pieces: 3, desc: '3点：追撃率+30%／4点：常時2回攻撃' },
  onion: { id: 'onion', name: 'たまねぎ', pieces: 3, desc: '3点：全ステ+10%／4点：全ステ+25%' },
  thief: { id: 'thief', name: '盗賊', pieces: 3, desc: '3点：盗む+30%・先制+20%／4点：ドロップ率+20%' },
  mage: { id: 'mage', name: '魔導師', pieces: 3, desc: '3点：魔力+15%／4点：MP消費半減' },
};
