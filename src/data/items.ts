import type { BaseItem } from '../core/types';
import { SKILLS } from './skills';

import { ITEMS2 } from './items2';
export const ITEMS: Record<string, BaseItem> = {};
function add(...list: BaseItem[]) { for (const i of list) ITEMS[i.id] = i; }
// データ拡張 第1弾：装備＋100（art/items2_data.py）
add(...ITEMS2);
// 武器（エリア1〜2で出る範囲。後でエリアごとに追加）
add(
  { id: 'broadsword', name: 'ブロードソード', kind: 'weapon', wtype: 'sword', power: 12, price: 120, area: 1, learn: { skill: 'focus', ap: 60 } },
  { id: 'mithril_sword', name: 'ミスリルソード', kind: 'weapon', wtype: 'sword', power: 24, price: 800, area: 1, learn: { skill: 'two_slash', ap: 120 }, set: 'mithril' },
  { id: 'flametongue', name: 'フレイムタン', kind: 'weapon', wtype: 'sword', power: 34, element: 'fire', price: 2400, area: 1, learn: { skill: 'magic_sword_fire', ap: 150 } },
  { id: 'ice_brand', name: 'アイスブランド', kind: 'weapon', wtype: 'sword', power: 36, element: 'ice', price: 2600, area: 2, learn: { skill: 'magic_sword_ice', ap: 150 } },
  { id: 'blood_sword', name: 'ブラッドソード', kind: 'weapon', wtype: 'sword', power: 30, element: 'dark', price: 3000, area: 2, learn: { ability: 'auto_regen', ap: 200 } },
  { id: 'dagger', name: 'ダガー', kind: 'weapon', wtype: 'dagger', power: 9, price: 80, area: 1, learn: { skill: 'steal', ap: 80 } },
  { id: 'mithril_knife', name: 'ミスリルナイフ', kind: 'weapon', wtype: 'dagger', power: 18, price: 600, area: 1, learn: { ability: 'dash', ap: 100 }, set: 'mithril' },
  { id: 'main_gauche', name: 'メインゴーシュ', kind: 'weapon', wtype: 'dagger', power: 22, def: 4, price: 1500, area: 2, learn: { ability: 'counter', ap: 180 } },
  { id: 'spear', name: 'スピア', kind: 'weapon', wtype: 'spear', power: 16, price: 300, area: 1, learn: { skill: 'jump', ap: 120 } },
  { id: 'mithril_spear', name: 'ミスリルスピア', kind: 'weapon', wtype: 'spear', power: 28, price: 1200, area: 2, learn: { skill: 'lancer', ap: 160 }, set: 'mithril' },
  { id: 'battle_axe', name: 'バトルアックス', kind: 'weapon', wtype: 'axe', power: 22, price: 500, area: 1, learn: { ability: 'two_handed', ap: 150 } },
  { id: 'kaiser_knuckle', name: 'カイザーナックル', kind: 'weapon', wtype: 'fist', power: 20, price: 900, area: 1, learn: { ability: 'brawl', ap: 100 } },
  { id: 'staff', name: 'スタッフ', kind: 'weapon', wtype: 'staff', power: 6, stats: { spr: 3 }, price: 100, area: 1, learn: { skill: 'cure', ap: 80 } },
  { id: 'healing_staff', name: '癒しの杖', kind: 'weapon', wtype: 'staff', power: 10, stats: { spr: 8, mp: 10 }, price: 1200, area: 1, learn: { skill: 'cura', ap: 150 } },
  { id: 'rod', name: 'ロッド', kind: 'weapon', wtype: 'rod', power: 5, stats: { mag: 3 }, price: 100, area: 1, learn: { skill: 'fire', ap: 80 } },
  { id: 'fire_rod', name: '炎のロッド', kind: 'weapon', wtype: 'rod', power: 10, stats: { mag: 8 }, element: 'fire', price: 1200, area: 1, learn: { skill: 'fira', ap: 200 } },
  { id: 'whip', name: '鞭', kind: 'weapon', wtype: 'whip', power: 14, price: 400, area: 1, learn: { skill: 'capture', ap: 100 } },
  { id: 'great_bow', name: '大弓', kind: 'weapon', wtype: 'bow', power: 18, price: 700, area: 1, learn: { skill: 'aim', ap: 100 } },
);
// 盾・頭・体・アクセ
add(
  { id: 'buckler', name: 'バックラー', kind: 'shield', def: 4, price: 150, area: 1, learn: { ability: 'cover', ap: 80 } },
  { id: 'mithril_shield', name: 'ミスリルの盾', kind: 'shield', def: 9, mdef: 3, price: 900, area: 1, learn: { ability: 'hp10', ap: 120 }, set: 'mithril' },
  { id: 'flame_shield', name: '炎の盾', kind: 'shield', def: 12, mdef: 8, price: 2500, area: 2, learn: { ability: 'res_fire', ap: 120 } },
  { id: 'leather_cap', name: '革の帽子', kind: 'head', def: 2, price: 80, area: 1, learn: { ability: 'hp10', ap: 60 } },
  { id: 'bronze_helm', name: 'ブロンズヘルム', kind: 'head', def: 5, price: 300, area: 1, learn: { ability: 'cover', ap: 90 } },
  { id: 'mithril_helm', name: 'ミスリルヘルム', kind: 'head', def: 8, mdef: 2, price: 900, area: 1, learn: { ability: 'res_sleep', ap: 100 }, set: 'mithril' },
  { id: 'triangle_hat', name: '三角帽子', kind: 'head', def: 3, mdef: 6, stats: { mag: 4 }, price: 600, area: 1, learn: { ability: 'mp10', ap: 90 } },
  { id: 'green_beret', name: '緑のベレー', kind: 'head', def: 4, stats: { spd: 3, luck: 3 }, price: 800, area: 2, learn: { ability: 'steal_up', ap: 120 } },
  { id: 'leather_armor', name: '革の鎧', kind: 'body', def: 5, price: 150, area: 1, learn: { ability: 'hp10', ap: 80 } },
  { id: 'bronze_armor', name: 'ブロンズアーマー', kind: 'body', def: 10, price: 500, area: 1, learn: { ability: 'cover', ap: 100 } },
  { id: 'mithril_armor', name: 'ミスリルアーマー', kind: 'body', def: 16, mdef: 4, price: 1500, area: 1, learn: { ability: 'hp30', ap: 200 }, set: 'mithril' },
  { id: 'white_robe', name: '白のローブ', kind: 'body', def: 7, mdef: 12, stats: { spr: 5 }, price: 1800, area: 2, learn: { skill: 'curaga', ap: 220 } },
  { id: 'black_robe', name: '黒のローブ', kind: 'body', def: 6, mdef: 12, stats: { mag: 6 }, price: 1800, area: 2, learn: { skill: 'drain', ap: 220 } },
  { id: 'ninja_garb', name: '忍びの衣', kind: 'body', def: 9, stats: { spd: 5 }, price: 2000, area: 2, learn: { skill: 'bunshin', ap: 150 } },
  { id: 'power_ring', name: '力の腕輪', kind: 'acc', stats: { str: 5 }, price: 500, area: 1, learn: { ability: 'brawl', ap: 100 } },
  { id: 'guard_ring', name: '守りの指輪', kind: 'acc', def: 3, mdef: 3, price: 800, area: 1, learn: { ability: 'auto_regen', ap: 200 } },
  { id: 'star_pendant', name: '星のペンダント', kind: 'acc', price: 600, area: 1, learn: { ability: 'res_poison', ap: 80 } },
  { id: 'thief_glove', name: '盗賊の小手', kind: 'acc', stats: { luck: 5 }, price: 1200, area: 1, learn: { skill: 'mug', ap: 120 } },
  { id: 'hermes_shoes', name: 'エルメスの靴', kind: 'acc', stats: { spd: 8 }, price: 3000, area: 2, learn: { ability: 'dash', ap: 150 } },
  { id: 'ribbon', name: 'リボン', kind: 'acc', mdef: 5, price: 20000, area: 2, learn: { ability: 'ribbon', ap: 500 } },
  { id: 'gil_charm', name: '商人の護符', kind: 'acc', price: 1500, area: 1, learn: { ability: 'gil_up', ap: 120 } },
  { id: 'exp_egg', name: '経験値のたまご', kind: 'acc', price: 5000, area: 2, learn: { ability: 'exp_up', ap: 300 } },
);
// 消耗品・素材
add(
  { id: 'potion', name: 'ポーション', kind: 'consumable', price: 30, area: 1, effect: { kind: 'heal', power: 100, target: 'ally' } },
  { id: 'hi_potion', name: 'ハイポーション', kind: 'consumable', price: 200, area: 1, effect: { kind: 'heal', power: 500, target: 'ally' } },
  { id: 'x_potion', name: 'エクスポーション', kind: 'consumable', price: 1500, area: 2, effect: { kind: 'fullheal', target: 'ally' } },
  { id: 'ether', name: 'エーテル', kind: 'consumable', price: 300, area: 1, effect: { kind: 'mp', power: 40, target: 'ally' } },
  { id: 'phoenix_down', name: 'フェニックスの尾', kind: 'consumable', price: 400, area: 1, effect: { kind: 'revive', power: 0.25, target: 'ally' } },
  { id: 'antidote', name: '毒消し', kind: 'consumable', price: 30, area: 1, effect: { kind: 'cure', target: 'ally' } },
  { id: 'remedy', name: '万能薬', kind: 'consumable', price: 300, area: 1, effect: { kind: 'cure', target: 'ally' } },
  { id: 'bomb_fragment', name: 'ボムのかけら', kind: 'consumable', price: 150, area: 1, effect: { kind: 'damage', power: 120, element: 'fire', target: 'enemies' } },
  { id: 'arctic_wind', name: '南極の風', kind: 'consumable', price: 150, area: 1, effect: { kind: 'damage', power: 120, element: 'ice', target: 'enemies' } },
  { id: 'magi_cage', name: '魔石のケージ', kind: 'consumable', price: 500, area: 1, effect: { kind: 'capture', power: 1, target: 'enemy' } },
  { id: 'antilaw', name: 'アンチロウカード', kind: 'consumable', price: 2000, area: 1, effect: { kind: 'antilaw', target: 'self' } },
  { id: 'mithril', name: 'ミスリル', kind: 'material', price: 100, area: 1 },
  { id: 'orichalcum', name: 'オリハルコン', kind: 'material', price: 1000, area: 1 },
  { id: 'magicite', name: '魔晶石', kind: 'material', price: 300, area: 1 },
  { id: 'fire_shard', name: '炎のクリスタルのかけら', kind: 'material', price: 50, area: 1 },
  { id: 'goblin_ear', name: 'ゴブリンの耳', kind: 'material', price: 20, area: 1 },
  { id: 'wolf_fang', name: '狼の牙', kind: 'material', price: 25, area: 1 },
  { id: 'bomb_core', name: 'ボムの核', kind: 'material', price: 60, area: 1 },
  { id: 'slime_jelly', name: 'プリンのゼリー', kind: 'material', price: 40, area: 1 },
  { id: 'dragon_fang', name: '竜の牙', kind: 'material', price: 500, area: 1 },
  { id: 'phoenix_feather', name: '鳳凰の羽', kind: 'material', price: 800, area: 1 },
);

// ---- エリア3〜10の装備
add(
  // エリア3 浮遊大陸
  { id: 'ashura', name: 'あしゅら', kind: 'weapon', wtype: 'katana', power: 40, price: 4000, area: 3, learn: { skill: 'throw', ap: 150 } },
  { id: 'dragon_claw', name: 'ドラゴンクロー', kind: 'weapon', wtype: 'fist', power: 38, element: 'fire', price: 4200, area: 3, learn: { skill: 'earth_slash', ap: 160 } },
  { id: 'sage_staff', name: '賢者の杖', kind: 'weapon', wtype: 'staff', power: 18, stats: { spr: 12, mag: 6 }, price: 5000, area: 3, learn: { skill: 'esuna', ap: 180 } },
  { id: 'diamond_shield', name: 'ダイヤの盾', kind: 'shield', def: 18, mdef: 10, price: 5000, area: 3, learn: { ability: 'hp10', ap: 150 }, set: 'diamond' },
  { id: 'diamond_helm', name: 'ダイヤの兜', kind: 'head', def: 14, mdef: 6, price: 4500, area: 3, learn: { ability: 'res_sleep', ap: 150 }, set: 'diamond' },
  { id: 'diamond_armor', name: 'ダイヤの鎧', kind: 'body', def: 26, mdef: 10, price: 7000, area: 3, learn: { ability: 'hp30', ap: 260 }, set: 'diamond' },
  { id: 'elven_cloak', name: 'エルフのマント', kind: 'acc', mdef: 6, stats: { spd: 4 }, price: 3000, area: 3, learn: { skill: 'blink', ap: 150 } },
  { id: 'protect_ring', name: 'プロテスリング', kind: 'acc', def: 6, mdef: 6, price: 6000, area: 3, learn: { skill: 'protect', ap: 120 } },
  // エリア4 月
  { id: 'excalibur', name: 'エクスカリバー', kind: 'weapon', wtype: 'sword', power: 58, element: 'holy', price: 20000, area: 4, learn: { skill: 'holy_burst', ap: 300 } },
  { id: 'holy_lance', name: 'ホーリーランス', kind: 'weapon', wtype: 'spear', power: 52, element: 'holy', price: 15000, area: 4, learn: { skill: 'high_jump', ap: 300 } },
  { id: 'wizard_rod', name: 'ウィザードロッド', kind: 'weapon', wtype: 'rod', power: 20, stats: { mag: 16 }, price: 12000, area: 4, learn: { skill: 'blizzara', ap: 200 } },
  { id: 'crystal_shield', name: 'クリスタルの盾', kind: 'shield', def: 24, mdef: 16, price: 12000, area: 4, learn: { ability: 'res_fire', ap: 150 }, set: 'crystal' },
  { id: 'crystal_helm', name: 'クリスタルヘルム', kind: 'head', def: 20, mdef: 12, price: 10000, area: 4, learn: { ability: 'mp10', ap: 150 }, set: 'crystal' },
  { id: 'crystal_mail', name: 'クリスタルメイル', kind: 'body', def: 36, mdef: 18, price: 18000, area: 4, learn: { ability: 'cover', ap: 200 }, set: 'crystal' },
  { id: 'crystal_ring', name: 'クリスタルリング', kind: 'acc', mdef: 10, stats: { spr: 8 }, price: 8000, area: 4, learn: { skill: 'shell', ap: 120 } },
  { id: 'lunar_curtain', name: '月のカーテン', kind: 'acc', mdef: 12, price: 9000, area: 4, learn: { skill: 'dispel', ap: 200 } },
  // エリア5 次元の狭間
  { id: 'brave_blade', name: 'ブレイブブレイド', kind: 'weapon', wtype: 'sword', power: 70, price: 30000, area: 5, learn: { skill: 'brave_slash', ap: 300 } },
  { id: 'chicken_knife', name: 'チキンナイフ', kind: 'weapon', wtype: 'dagger', power: 60, stats: { spd: 10 }, price: 30000, area: 5, learn: { skill: 'escape', ap: 200 } },
  { id: 'fuma_shuriken', name: '風魔手裏剣', kind: 'weapon', wtype: 'dagger', power: 55, price: 25000, area: 5, learn: { skill: 'kagenui', ap: 300 } },
  { id: 'rune_blade', name: 'ルーンブレイド', kind: 'weapon', wtype: 'sword', power: 48, stats: { mag: 10 }, price: 16000, area: 5, learn: { skill: 'magic_sword_drain', ap: 250 } },
  { id: 'assassin_dagger', name: 'アサシンダガー', kind: 'weapon', wtype: 'dagger', power: 44, price: 14000, area: 5, learn: { skill: 'assassinate', ap: 300 } },
  { id: 'genji_shield', name: '源氏の盾', kind: 'shield', def: 30, mdef: 14, price: 25000, area: 5, learn: { ability: 'counter', ap: 300 }, set: 'genji' },
  { id: 'genji_helm', name: '源氏の兜', kind: 'head', def: 26, mdef: 10, price: 22000, area: 5, learn: { ability: 'hp30', ap: 300 }, set: 'genji' },
  { id: 'genji_armor', name: '源氏の鎧', kind: 'body', def: 44, mdef: 16, price: 35000, area: 5, learn: { ability: 'two_handed', ap: 350 }, set: 'genji' },
  { id: 'genji_glove', name: '源氏の小手', kind: 'acc', def: 8, stats: { str: 8 }, price: 20000, area: 5, learn: { ability: 'first_strike', ap: 300 }, set: 'genji' },
  { id: 'mirage_vest', name: 'ミラージュベスト', kind: 'body', def: 24, mdef: 20, stats: { spd: 6 }, price: 20000, area: 5, learn: { skill: 'bunshin', ap: 250 } },
  // エリア6 瓦礫の世界
  { id: 'ragnarok', name: 'ラグナロク', kind: 'weapon', wtype: 'sword', power: 86, price: 50000, area: 6, learn: { skill: 'magic_sword_flare', ap: 400 } },
  { id: 'illumina', name: 'ライトブリンガー', kind: 'weapon', wtype: 'sword', power: 90, element: 'holy', stats: { spr: 10, mag: 10 }, price: 60000, area: 6, learn: { skill: 'magic_sword_holy', ap: 400 } },
  { id: 'atma_weapon', name: 'アルテマウェポン', kind: 'weapon', wtype: 'sword', power: 80, stats: { str: 12 }, price: 50000, area: 6, learn: { skill: 'aura_cannon', ap: 400 } },
  { id: 'force_shield', name: 'フォースシールド', kind: 'shield', def: 32, mdef: 30, price: 30000, area: 6, learn: { skill: 'curaga', ap: 300 } },
  { id: 'oath_veil', name: '誓いのヴェール', kind: 'head', def: 22, mdef: 24, stats: { mag: 8 }, price: 28000, area: 6, learn: { skill: 'hastega', ap: 350 } },
  { id: 'force_armor', name: 'フォースアーマー', kind: 'body', def: 46, mdef: 30, price: 45000, area: 6, learn: { skill: 'comet', ap: 300 } },
  { id: 'minerva', name: 'ミネルバビスチェ', kind: 'body', def: 40, mdef: 36, stats: { mag: 10, spr: 10 }, price: 50000, area: 6, learn: { skill: 'arise', ap: 400 } },
  { id: 'hero_ring', name: '英雄の指輪', kind: 'acc', stats: { str: 10, mag: 10 }, price: 30000, area: 6, learn: { ability: 'brawl', ap: 200 } },
  // エリア7 ミッドガル
  { id: 'buster_sword', name: 'バスターソード', kind: 'weapon', wtype: 'sword', power: 96, price: 60000, area: 7, learn: { skill: 'brave_slash', ap: 300 } },
  { id: 'masamune', name: '正宗', kind: 'weapon', wtype: 'katana', power: 100, stats: { spd: 8 }, price: 70000, area: 7, learn: { skill: 'kagenui', ap: 400 } },
  { id: 'premium_heart', name: 'プレミアムハート', kind: 'weapon', wtype: 'fist', power: 92, price: 60000, area: 7, learn: { skill: 'vacuum_wave', ap: 350 } },
  { id: 'ziedrich', name: 'ジードリッヒ', kind: 'shield', def: 40, mdef: 40, price: 50000, area: 7, learn: { ability: 'hp30', ap: 350 } },
  { id: 'mystile', name: 'ミスティール', kind: 'body', def: 42, mdef: 42, stats: { spd: 10, luck: 10 }, price: 60000, area: 7, learn: { skill: 'blink', ap: 300 } },
  { id: 'escort_guard', name: 'エスコートガード', kind: 'body', def: 56, mdef: 30, price: 55000, area: 7, learn: { ability: 'cover', ap: 300 } },
  { id: 'tetra_elemental', name: 'テトラエレメント', kind: 'acc', mdef: 16, price: 40000, area: 7, learn: { ability: 'res_fire', ap: 300 } },
  // エリア8 アルティミシア城
  { id: 'lionheart', name: 'ライオンハート', kind: 'weapon', wtype: 'sword', power: 110, stats: { str: 10 }, price: 80000, area: 8, learn: { skill: 'holy_burst', ap: 400 } },
  { id: 'strange_vision', name: 'ストレンジビジョン', kind: 'weapon', wtype: 'whip', power: 96, price: 70000, area: 8, learn: { skill: 'roar', ap: 300 } },
  { id: 'exeter', name: 'エクセター', kind: 'weapon', wtype: 'bow', power: 100, price: 70000, area: 8, learn: { skill: 'rapid_fire', ap: 400 } },
  // エリア9 テラ
  { id: 'ultima_sword', name: 'アルテマソード', kind: 'weapon', wtype: 'sword', power: 120, price: 100000, area: 9, learn: { skill: 'magic_sword_flare', ap: 450 } },
  { id: 'excalibur2', name: 'エクスカリバーII', kind: 'weapon', wtype: 'sword', power: 130, element: 'holy', price: 150000, area: 9, learn: { skill: 'holy_burst', ap: 500 } },
  { id: 'tiger_fangs', name: 'タイガーファング', kind: 'weapon', wtype: 'fist', power: 108, price: 80000, area: 9, learn: { skill: 'aura_cannon', ap: 450 } },
  { id: 'robe_of_lords', name: 'ローブオブロード', kind: 'body', def: 48, mdef: 56, stats: { mag: 14, spr: 14 }, price: 100000, area: 9, learn: { skill: 'holy', ap: 450 } },
  { id: 'grand_armor', name: 'グランドアーマー', kind: 'body', def: 66, mdef: 36, price: 100000, area: 9, learn: { ability: 'counter', ap: 400 } },
  // エリア10 ザナルカンド
  { id: 'caladbolg', name: 'カラドボルグ', kind: 'weapon', wtype: 'sword', power: 140, price: 150000, area: 10, learn: { skill: 'brave_slash', ap: 500 } },
  { id: 'nirvana', name: 'ニルヴァーナ', kind: 'weapon', wtype: 'staff', power: 40, stats: { mag: 24, spr: 24 }, price: 150000, area: 10, learn: { skill: 'arise', ap: 500 } },
  { id: 'spirit_lance', name: 'スピリットランス', kind: 'weapon', wtype: 'spear', power: 136, price: 150000, area: 10, learn: { skill: 'high_jump', ap: 500 } },
  { id: 'masamune10', name: '正宗（改）', kind: 'weapon', wtype: 'katana', power: 138, stats: { spd: 12 }, price: 160000, area: 10, learn: { skill: 'kagenui', ap: 500 } },
  { id: 'onion_knight_w', name: 'オニオンソード', kind: 'weapon', wtype: 'sword', power: 150, stats: { str: 10, mag: 10, spd: 10 }, price: 200000, area: 10, learn: { skill: 'two_slash', ap: 300 } },
);
// 魔法書：Lv4以上の魔法は読まないと使えない
export const TOMES: string[] = [];
for (const sk of Object.values(SKILLS)) {
  if (sk.kind === 'spell' && (sk.level ?? 1) >= 4) {
    const id = 'tome_' + sk.id;
    ITEMS[id] = { id, name: `魔法書「${sk.name}」`, kind: 'tome', price: 3000 * ((sk.level ?? 4) - 3), area: Math.max(1, (sk.level ?? 4) - 3) };
    TOMES.push(id);
  }
}
export function tomeSpell(itemId: string): string { return itemId.replace(/^tome_/, ''); }
export function item(id: string): BaseItem { const i = ITEMS[id]; if (!i) throw new Error('unknown item ' + id); return i; }
