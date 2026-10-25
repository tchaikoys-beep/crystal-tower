// データ拡張 第2弾：ジョブ＋15 の技（83）
import type { Skill, Element, Status } from '../core/types';
type Eff = Skill['effect']; type Tg = Skill['target'];
const tagOf = (effect: Eff, el?: Element): string | undefined =>
  effect === 'phys' ? (el === 'fire' ? 'fire' : 'physical') : effect === 'magic' || effect === 'drain' || effect === 'fixed' ? (el === 'fire' ? 'fire' : 'magic') : effect === 'heal' || effect === 'revive' ? 'heal' : effect === 'status' ? 'status' : undefined;
const K = (id: string, name: string, category: string, mp: number, target: Tg, effect: Eff, power: number, desc: string, x: Partial<Skill> = {}): Skill =>
  ({ id, name, kind: 'ability', category, mp, target, effect, power, tag: tagOf(effect, x.element), desc, ...x });
const st = (s: Status, chance: number) => ({ status: s, chance });
export const SKILLS3: Skill[] = [
  // モーグリナイト
  K('mog_attack', 'モグアタック', 'mogknight', 0, 'enemy', 'phys', 1.5, '体当たり'),
  K('mog_guard', 'モグガード', 'mogknight', 4, 'self', 'buff', 0, '自分にプロテス', { status: 'protect' }),
  K('mog_rush', 'モグラッシュ', 'mogknight', 6, 'enemy', 'phys', 0.9, '3連撃', { hits: 3 }),
  K('mog_peek', 'モグピーク', 'mogknight', 8, 'enemy', 'phys', 2.4, 'つるはしの一撃'),
  K('mog_aid', 'モグエイド', 'mogknight', 10, 'allies', 'heal', 220, 'モーグリの応援で全体回復'),
  K('ultima_charge', 'アルテマチャージ', 'mogknight', 24, 'enemy', 'phys', 3.6, '聖なる大技', { element: 'holy' }),
  // ガンナー
  K('vital_shot', '急所撃ち', 'gunner', 0, 'enemy', 'phys', 1.6, '急所を狙う'),
  K('fire_shot', '火炎弾', 'gunner', 4, 'enemy', 'phys', 1.4, '炎属性の弾', { element: 'fire' }),
  K('ice_shot', '冷凍弾', 'gunner', 4, 'enemy', 'phys', 1.4, '冷気属性の弾', { element: 'ice' }),
  K('thunder_shot', '電撃弾', 'gunner', 4, 'enemy', 'phys', 1.4, '雷属性の弾', { element: 'thunder' }),
  K('silence_shot', '封魔弾', 'gunner', 6, 'enemy', 'status', 0, '沈黙させる', st('silence', 0.8)),
  K('double_shot', 'ダブルショット', 'gunner', 8, 'enemy', 'phys', 1.1, '二連射', { hits: 2 }),
  K('ultima_shot', 'アルテマショット', 'gunner', 24, 'enemy', 'phys', 3.2, '渾身の一発'),
  // アサシン
  K('gale_slash', '疾風斬', 'assassin', 0, 'enemy', 'phys', 1.9, '一瞬の斬撃'),
  K('rock_seal', 'ロックシール', 'assassin', 6, 'enemy', 'status', 0, '麻痺させる', st('paralyze', 0.7)),
  K('nightmare_spell', '睡魔の呪文', 'assassin', 8, 'enemies', 'status', 0, '敵全体を眠らせる', st('sleep', 0.6)),
  K('yaksha', '夜叉', 'assassin', 14, 'enemy', 'fixed', -0.6, '敵HPの60%を奪う（ボス15%）', { tag: 'physical' }),
  K('ultima_slash', 'アルテマ斬り', 'assassin', 24, 'enemy', 'phys', 3.4, '必殺の斬撃'),
  // イリュージョニスト（全部全体）
  K('star_fall', 'スターフォール', 'illusion', 12, 'enemies', 'magic', 85, '星屑の全体魔法'),
  K('wild_fire', 'ワイルドファイア', 'illusion', 16, 'enemies', 'magic', 95, '炎の全体魔法', { element: 'fire' }),
  K('freeze_blast', 'フリーズブラスト', 'illusion', 16, 'enemies', 'magic', 95, '冷気の全体魔法', { element: 'ice' }),
  K('sky_bolt', 'スカイボルト', 'illusion', 16, 'enemies', 'magic', 95, '雷の全体魔法', { element: 'thunder' }),
  K('heavens_wrath', '天罰', 'illusion', 28, 'enemies', 'magic', 120, '聖の全体魔法', { element: 'holy' }),
  K('prominence', 'プロミネンス', 'illusion', 44, 'enemies', 'magic', 165, '太陽炎の全体魔法', { element: 'fire' }),
  // スナイパー
  K('snipe', '狙い撃ち', 'sniper', 0, 'enemy', 'phys', 2.0, '必中の狙撃'),
  K('armor_shot', '鎧破り', 'sniper', 4, 'enemy', 'status', 0, '敵をスロウに', st('slow', 0.8)),
  K('helm_shot', '兜割り', 'sniper', 4, 'enemy', 'status', 0, '敵を暗闇に', st('blind', 0.8)),
  K('magic_seal_shot', '魔封じの矢', 'sniper', 6, 'enemy', 'status', 0, '敵を沈黙に', st('silence', 0.8)),
  K('death_arrow', '死の矢', 'sniper', 14, 'enemy', 'fixed', -0.45, '敵HPの45%（ボス11%）', { tag: 'physical' }),
  K('twin_shot', 'ツインショット', 'sniper', 10, 'enemy', 'phys', 1.3, '二本同時に放つ', { hits: 2 }),
  // 聖騎士
  K('holy_blade', 'ホーリーブレード', 'paladin', 6, 'enemy', 'phys', 2.0, '聖属性の斬撃', { element: 'holy' }),
  K('paladin_prayer', '祈り', 'paladin', 8, 'allies', 'heal', 200, '味方全体を癒す'),
  K('saint_cross', 'セイントクロス', 'paladin', 12, 'enemies', 'phys', 1.5, '聖属性の全体斬撃', { element: 'holy' }),
  K('guardian_light', '守りの光', 'paladin', 12, 'allies', 'buff', 0, '味方全体にシェル', { status: 'shell' }),
  K('holy_explosion', '聖光爆裂破', 'paladin', 28, 'enemies', 'phys', 2.6, '聖なる爆発', { element: 'holy' }),
  // 暗黒騎士
  K('darkness', '暗黒', 'dark_knight', 0, 'enemy', 'phys', 2.0, '闇の斬撃', { element: 'dark' }),
  K('blood_blade', '吸血剣', 'dark_knight', 8, 'enemy', 'drain', 85, 'HPを吸う剣', { element: 'dark' }),
  K('soul_eater', 'ソウルイーター', 'dark_knight', 12, 'enemies', 'phys', 1.5, '闇の全体斬撃', { element: 'dark' }),
  K('dark_break', 'ダークブレイク', 'dark_knight', 8, 'enemy', 'status', 0, '敵をスロウに', st('slow', 0.8)),
  K('abyss_wave', '深淵の波動', 'dark_knight', 24, 'enemies', 'magic', 125, '闇の全体魔法', { element: 'dark' }),
  K('reaper_strike', '死神の一撃', 'dark_knight', 30, 'enemy', 'fixed', -0.5, '敵HPの50%（ボス12%）', { element: 'dark', tag: 'physical' }),
  // ジャグラー
  K('ring_toss', 'リング投げ', 'juggler', 0, 'enemy', 'phys', 1.3, 'リングを投げる'),
  K('dagger_toss', 'ダガー投げ', 'juggler', 4, 'enemy', 'phys', 1.1, '二本投げ', { hits: 2 }),
  K('fire_ball', '火炎玉', 'juggler', 6, 'enemies', 'magic', 75, '炎の玉を投げる', { element: 'fire' }),
  K('smoke_screen', 'スモーク', 'juggler', 4, 'enemies', 'status', 0, '敵全体を暗闇に', st('blind', 0.6)),
  K('lucky_coin', '幸運のコイン', 'juggler', 0, 'enemies', 'gil_toss', 1, 'ギルを投げて全体攻撃'),
  K('juggling', 'ジャグリング', 'juggler', 12, 'enemy', 'phys', 0.75, '4連投げ', { hits: 4 }),
  // 学者
  K('chapter_water', '水の章', 'scholar', 10, 'enemies', 'magic', 82, '水の全体魔法', { element: 'water' }),
  K('chapter_wind', '風の章', 'scholar', 10, 'enemies', 'magic', 82, '風の全体魔法', { element: 'wind' }),
  K('chapter_earth', '地の章', 'scholar', 10, 'enemies', 'magic', 82, '地の全体魔法', { element: 'earth' }),
  K('chapter_dark', '闇の章', 'scholar', 18, 'enemies', 'magic', 105, '闇の全体魔法', { element: 'dark' }),
  K('chapter_holy', '聖の章', 'scholar', 18, 'enemies', 'magic', 105, '聖の全体魔法', { element: 'holy' }),
  K('forbidden_chapter', '禁断の章', 'scholar', 50, 'enemies', 'magic', 175, '禁じられた無属性魔法'),
  // 剣聖
  K('swallow_return', '燕返し', 'swordmaster', 0, 'enemy', 'phys', 1.2, '二連の返し刀', { hits: 2 }),
  K('immovable', '不動', 'swordmaster', 4, 'self', 'buff', 0, '自分にプロテス', { status: 'protect' }),
  K('mind_eye', '心眼', 'swordmaster', 6, 'self', 'buff', 0, '自分にブリンク', { status: 'blink' }),
  K('crescent_slash', '円月斬', 'swordmaster', 10, 'enemies', 'phys', 1.6, '全体を薙ぐ'),
  K('musou', '無双', 'swordmaster', 14, 'enemy', 'phys', 2.6, '無双の一太刀'),
  K('issen', '一閃', 'swordmaster', 24, 'enemy', 'phys', 3.8, '必殺の一閃'),
  // ビショップ
  K('holy_ray', '聖光', 'bishop', 8, 'enemy', 'magic', 95, '聖属性の光', { element: 'holy' }),
  K('purify', '浄化', 'bishop', 10, 'allies', 'cure', 0, '味方全体の状態異常を治す'),
  K('guardian_ward', '守護', 'bishop', 12, 'allies', 'buff', 0, '味方全体にプロテス', { status: 'protect' }),
  K('holy_wind', '聖なる風', 'bishop', 14, 'allies', 'heal', 260, '味方全体を癒す'),
  K('resurrect', '復活', 'bishop', 20, 'dead_ally', 'revive', 0.5, 'HP50%で蘇生'),
  K('judgment', '裁き', 'bishop', 30, 'enemies', 'magic', 135, '聖属性の全体魔法', { element: 'holy' }),
  // フェンサー
  K('swarm_strike', 'スウォームストライク', 'fencer', 0, 'enemy', 'phys', 1.4, '毒を乗せた突き', st('poison', 0.5)),
  K('gale_thrust', '疾風突き', 'fencer', 4, 'enemy', 'phys', 1.5, '素早い突き'),
  K('seal_thrust', '封じ突き', 'fencer', 6, 'enemy', 'status', 0, '沈黙させる', st('silence', 0.7)),
  K('piercing_thrust', '鎧通し', 'fencer', 8, 'enemy', 'phys', 1.9, '防御を貫く突き'),
  K('flurry_thrust', '乱れ突き', 'fencer', 10, 'enemy', 'phys', 0.8, '3連突き', { hits: 3 }),
  K('fatal_thrust', '必殺突き', 'fencer', 18, 'enemy', 'phys', 2.9, '急所への一突き'),
  // 算術士（MP0・威力控えめ）
  K('math_fire', '算術：ファイア', 'arith', 0, 'enemies', 'magic', 70, 'MP0の炎の全体魔法', { element: 'fire' }),
  K('math_blizzard', '算術：ブリザド', 'arith', 0, 'enemies', 'magic', 70, 'MP0の冷気の全体魔法', { element: 'ice' }),
  K('math_thunder', '算術：サンダー', 'arith', 0, 'enemies', 'magic', 70, 'MP0の雷の全体魔法', { element: 'thunder' }),
  K('math_cure', '算術：ケアル', 'arith', 0, 'allies', 'heal', 150, 'MP0の全体回復'),
  K('math_slow', '算術：スロウ', 'arith', 0, 'enemies', 'status', 0, 'MP0で敵全体をスロウに', st('slow', 0.6)),
  K('math_flare', '算術：フレア', 'arith', 0, 'enemies', 'magic', 140, 'MP0の無属性全体魔法'),
  // エレメンタリスト
  K('fire_fang', '火竜の牙', 'element', 10, 'enemies', 'magic', 85, '炎の精霊魔法', { element: 'fire' }),
  K('ice_blade_e', '氷の刃', 'element', 10, 'enemies', 'magic', 85, '冷気の精霊魔法', { element: 'ice' }),
  K('thunder_roar', '雷鳴', 'element', 10, 'enemies', 'magic', 85, '雷の精霊魔法', { element: 'thunder' }),
  K('earth_heal_e', '大地', 'element', 10, 'enemies', 'magic', 85, '地の精霊魔法', { element: 'earth' }),
  K('white_breeze', '白の風', 'element', 12, 'allies', 'heal', 190, '風の精霊が癒す'),
  K('spirit_ward', '精霊の加護', 'element', 14, 'allies', 'buff', 0, '味方全体にシェル', { status: 'shell' }),
  K('spirit_wrath', '精霊の怒り', 'element', 36, 'enemies', 'magic', 155, '精霊の総攻撃'),
  // ガジェッティア
  K('blue_ray', 'ブルーの光線', 'gadget', 6, 'enemies', 'magic', 80, '冷気の光線', { element: 'ice' }),
  K('heal_device', '回復装置', 'gadget', 8, 'allies', 'heal', 200, '装置で全体回復'),
  K('paralyze_device', '麻痺装置', 'gadget', 8, 'enemies', 'status', 0, '敵全体を麻痺', st('paralyze', 0.5)),
  K('repair', '修理', 'gadget', 12, 'dead_ally', 'revive', 0.4, 'HP40%で蘇生'),
  K('bomb_device', '爆弾装置', 'gadget', 14, 'enemies', 'magic', 115, '炎の爆発', { element: 'fire' }),
  K('accel_device', '加速装置', 'gadget', 20, 'allies', 'buff', 0, '味方全体にヘイスト', { status: 'haste' }),
];
