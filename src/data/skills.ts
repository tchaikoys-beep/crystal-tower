import type { Skill, Element } from '../core/types';

export const SKILLS: Record<string, Skill> = {};
function add(...list: Skill[]) { for (const s of list) SKILLS[s.id] = s; }
const S = (s: Skill) => s;
const W = (id: string, name: string, lv: number, mp: number, rest: Partial<Skill> & { target: Skill['target']; effect: Skill['effect']; power: number }, desc: string): Skill =>
  ({ id, name, kind: 'spell', category: 'white', school: 'white', level: lv, mp, tag: rest.effect === 'heal' || rest.effect === 'revive' ? 'heal' : 'magic', desc, ...rest });
const B = (id: string, name: string, lv: number, mp: number, power: number, el: Element, all = false, extra: Partial<Skill> = {}): Skill =>
  ({ id, name, kind: 'spell', category: 'black', school: 'black', level: lv, mp, target: all ? 'enemies' : 'enemy', effect: 'magic', power, element: el, tag: el === 'fire' ? 'fire' : 'magic', desc: `${all ? '全体に' : ''}${name}のダメージ`, ...extra });
const T = (id: string, name: string, lv: number, mp: number, rest: Partial<Skill> & { target: Skill['target']; effect: Skill['effect']; power: number }, desc: string): Skill =>
  ({ id, name, kind: 'spell', category: 'time', school: 'time', level: lv, mp, tag: 'magic', desc, ...rest });
const A = (id: string, name: string, category: string, mp: number, rest: Partial<Skill> & { target: Skill['target']; effect: Skill['effect']; power: number }, desc: string): Skill =>
  ({ id, name, kind: 'ability', category, mp, tag: rest.effect === 'phys' ? 'physical' : undefined, desc, ...rest });

// 白魔法
add(
  W('cure', 'ケアル', 1, 4, { target: 'ally', effect: 'heal', power: 40 }, '味方1人のHPを少し回復'),
  W('poisona', 'ポイゾナ', 1, 3, { target: 'ally', effect: 'cure', power: 0, status: 'poison' }, '毒を治す'),
  W('protect', 'プロテス', 1, 6, { target: 'ally', effect: 'buff', power: 30, status: 'protect' }, '物理被ダメ半減'),
  W('cura', 'ケアルラ', 2, 9, { target: 'ally', effect: 'heal', power: 120 }, '味方1人のHPを回復'),
  W('shell', 'シェル', 2, 6, { target: 'ally', effect: 'buff', power: 30, status: 'shell' }, '魔法被ダメ半減'),
  W('silence', 'サイレス', 2, 6, { target: 'enemy', effect: 'status', power: 0, status: 'silence', chance: 0.7, tag: 'status' }, '沈黙させる'),
  W('curaga', 'ケアルダ', 3, 18, { target: 'allies', effect: 'heal', power: 90 }, '味方全体のHPを回復'),
  W('raise', 'レイズ', 3, 20, { target: 'dead_ally', effect: 'revive', power: 0.3 }, '戦闘不能を回復'),
  W('esuna', 'エスナ', 3, 10, { target: 'ally', effect: 'cure', power: 0 }, '状態異常を全て治す'),
  W('blink', 'ブリンク', 3, 10, { target: 'ally', effect: 'buff', power: 30, status: 'blink' }, '回避率が大きく上がる'),
  W('curaja', 'ケアルガ', 4, 32, { target: 'allies', effect: 'heal', power: 260 }, '味方全体のHPを大回復'),
  W('dispel', 'ディスペル', 4, 12, { target: 'enemy', effect: 'cure', power: 1 }, '敵の強化を消す'),
  W('holy', 'ホーリー', 6, 48, { target: 'enemy', effect: 'magic', power: 220, element: 'holy' }, '聖属性の大ダメージ'),
  W('arise', 'アレイズ', 5, 40, { target: 'dead_ally', effect: 'revive', power: 1.0 }, '戦闘不能を全快で回復'),
);
// 黒魔法
add(
  B('fire', 'ファイア', 1, 5, 28, 'fire'), B('blizzard', 'ブリザド', 1, 5, 28, 'ice'), B('thunder', 'サンダー', 1, 5, 28, 'thunder'),
  S({ id: 'poison', name: 'ポイズン', kind: 'spell', category: 'black', school: 'black', level: 1, mp: 4, target: 'enemy', effect: 'status', power: 0, status: 'poison', chance: 0.8, tag: 'status', desc: '毒にする' }),
  S({ id: 'sleep', name: 'スリプル', kind: 'spell', category: 'black', school: 'black', level: 1, mp: 5, target: 'enemy', effect: 'status', power: 0, status: 'sleep', chance: 0.7, tag: 'status', desc: '眠らせる' }),
  B('water', 'ウォータ', 2, 8, 40, 'water'), B('aero', 'エアロ', 2, 8, 40, 'wind'), B('stone', 'ストーン', 2, 8, 40, 'earth'),
  B('fira', 'ファイラ', 3, 14, 70, 'fire', true), B('blizzara', 'ブリザラ', 3, 14, 70, 'ice', true), B('thundara', 'サンダラ', 3, 14, 70, 'thunder', true),
  B('bio', 'バイオ', 3, 14, 80, 'poison', false, { status: 'poison', chance: 0.6, tag: 'status', desc: '毒属性ダメージ＋毒' }),
  S({ id: 'break', name: 'ブレイク', kind: 'spell', category: 'black', school: 'black', level: 4, mp: 15, target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.5, tag: 'status', desc: '石化（麻痺扱い）させる' }),
  S({ id: 'drain', name: 'ドレイン', kind: 'spell', category: 'black', school: 'black', level: 4, mp: 16, target: 'enemy', effect: 'drain', power: 70, element: 'dark', tag: 'magic', desc: 'HPを吸い取る' }),
  B('firaga', 'ファイガ', 5, 28, 150, 'fire', true), B('blizzaga', 'ブリザガ', 5, 28, 150, 'ice', true), B('thundaga', 'サンダガ', 5, 28, 150, 'thunder', true),
  S({ id: 'death', name: 'デス', kind: 'spell', category: 'black', school: 'black', level: 5, mp: 30, target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.35, tag: 'status', desc: '即死（プロトでは強い麻痺）' }),
  B('tornado', 'トルネド', 6, 40, 90, 'wind', true, { desc: '全体の HP を大きく削る' }),
  S({ id: 'flare', name: 'フレア', kind: 'spell', category: 'black', school: 'black', level: 6, mp: 50, target: 'enemy', effect: 'magic', power: 280, element: 'none', tag: 'magic', desc: '無属性の大ダメージ' }),
);
// 時空魔法
add(
  T('slow', 'スロウ', 1, 5, { target: 'enemy', effect: 'status', power: 0, status: 'slow', chance: 0.8, tag: 'status' }, '行動速度を下げる'),
  T('regen', 'リジェネ', 1, 8, { target: 'ally', effect: 'buff', power: 40, status: 'regen' }, '徐々にHP回復'),
  T('haste', 'ヘイスト', 2, 8, { target: 'ally', effect: 'buff', power: 30, status: 'haste' }, '行動速度を上げる'),
  T('gravity', 'グラビデ', 3, 12, { target: 'enemy', effect: 'fixed', power: -0.25 }, '敵HPの25%を削る（ボスは効きにくい）'),
  T('stop', 'ストップ', 3, 14, { target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.6, tag: 'status' }, '時間を止める'),
  T('comet', 'コメット', 4, 20, { target: 'enemy', effect: 'magic', power: 130, element: 'none' }, '無属性のランダム威力'),
  T('slowga', 'スロウガ', 4, 18, { target: 'enemies', effect: 'status', power: 0, status: 'slow', chance: 0.7, tag: 'status' }, '全体スロウ'),
  T('hastega', 'ヘイスガ', 5, 30, { target: 'allies', effect: 'buff', power: 30, status: 'haste' }, '味方全体ヘイスト'),
  T('meteor', 'メテオ', 6, 60, { target: 'enemies', effect: 'magic', power: 240, element: 'none' }, '全体に無属性大ダメージ'),
);
// 基本
add(
  S({ id: 'attack', name: 'たたかう', kind: 'ability', mp: 0, target: 'enemy', effect: 'phys', power: 1.0, tag: 'physical', desc: '通常攻撃' }),
  S({ id: 'defend', name: 'ぼうぎょ', kind: 'ability', mp: 0, target: 'self', effect: 'defend', power: 0, tag: 'defend', desc: '次の行動まで被ダメ半減' }),
  S({ id: 'flee', name: 'にげる', kind: 'ability', mp: 0, target: 'self', effect: 'flee', power: 0, tag: 'flee', desc: '戦闘から逃げる' }),
);
// 剣技（ナイト）
add(
  A('guard', 'まもる', 'knight', 0, { target: 'self', effect: 'defend', power: 1, tag: 'defend' }, '次の行動まで被ダメ無効'),
  A('shield_bash', 'シールドバッシュ', 'knight', 0, { target: 'enemy', effect: 'phys', power: 1.1, status: 'paralyze', chance: 0.3 }, '盾で殴って麻痺させる'),
  A('two_slash', 'ぜんぎり', 'knight', 0, { target: 'enemies', effect: 'phys', power: 0.8 }, '敵全体を斬る'),
  A('brave_slash', 'ブレイブスラッシュ', 'knight', 6, { target: 'enemy', effect: 'phys', power: 1.9 }, '強い一撃'),
  A('holy_burst', '聖光爆裂破', 'knight', 14, { target: 'enemies', effect: 'phys', power: 1.4, element: 'holy' }, '聖属性の全体斬撃'),
);
// 拳術（モンク）
add(
  A('focus', 'ためる', 'monk', 0, { target: 'self', effect: 'focus', power: 2.0 }, '次の攻撃の威力2倍'),
  A('kick', 'けり', 'monk', 0, { target: 'enemies', effect: 'phys', power: 0.6 }, '敵全体に蹴り'),
  A('chakra', 'チャクラ', 'monk', 0, { target: 'self', effect: 'heal', power: 0, tag: 'heal' }, '自分のHPを25%回復し状態異常を治す'),
  A('earth_slash', '地裂斬', 'monk', 4, { target: 'enemies', effect: 'phys', power: 0.9, element: 'earth' }, '土属性の全体攻撃'),
  A('vacuum_wave', '真空波', 'monk', 6, { target: 'enemy', effect: 'phys', power: 1.7, element: 'wind' }, '風属性の強打'),
  A('aura_cannon', 'オーラキャノン', 'monk', 12, { target: 'enemy', effect: 'phys', power: 2.6, element: 'holy' }, '聖属性の大技'),
);
// 盗賊技（シーフ）
add(
  A('steal', 'ぬすむ', 'thief', 0, { target: 'enemy', effect: 'steal', power: 0.4, tag: 'steal' }, 'アイテムを盗む'),
  A('mug', 'ぶんどる', 'thief', 0, { target: 'enemy', effect: 'phys', power: 0.8, tag: 'steal' }, '攻撃しながら盗む'),
  A('escape', 'とんずら', 'thief', 0, { target: 'self', effect: 'flee', power: 1, tag: 'flee' }, '確実に逃げる'),
  A('gil_steal', 'ギルとる', 'thief', 0, { target: 'enemy', effect: 'steal', power: 0.6, tag: 'steal' }, 'ギルを盗む（アイテムの代わりにギル）'),
  A('assassinate', 'アサシネイト', 'thief', 10, { target: 'enemy', effect: 'phys', power: 2.2, status: 'paralyze', chance: 0.2 }, '急所攻撃'),
);
// 竜技（竜騎士）
add(
  A('jump', 'ジャンプ', 'dragoon', 0, { target: 'enemy', effect: 'phys', power: 2.2 }, '槍で2倍以上のダメージ'),
  A('lancet', '竜剣', 'dragoon', 0, { target: 'enemy', effect: 'drain', power: 50, element: 'none' }, 'HPとMPを吸い取る'),
  A('lancer', 'ランサー', 'dragoon', 5, { target: 'enemies', effect: 'phys', power: 0.9 }, '槍で全体を突く'),
  A('dragon_fang', '竜の牙', 'dragoon', 6, { target: 'enemy', effect: 'phys', power: 1.5, status: 'poison', chance: 0.6 }, '毒付きの一撃'),
  A('high_jump', 'ハイジャンプ', 'dragoon', 12, { target: 'enemy', effect: 'phys', power: 3.2 }, '超高跳び'),
);
// 魔獣技（魔獣使い）
add(
  A('capture', 'とらえる', 'beast', 0, { target: 'enemy', effect: 'capture', power: 1.0, tag: 'capture' }, '弱った敵を仲間にする'),
  A('manip', 'あやつる', 'beast', 0, { target: 'enemy', effect: 'status', power: 0, status: 'sleep', chance: 0.6, tag: 'status' }, '敵を眠らせる（プロト簡易版）'),
  A('roar', '咆哮', 'beast', 6, { target: 'enemies', effect: 'status', power: 0, status: 'slow', chance: 0.5, tag: 'status' }, '全体にスロウ'),
  A('bond_power', '絆の力', 'beast', 10, { target: 'allies', effect: 'heal', power: 150, tag: 'heal' }, '味方全体を回復'),
);
// 魔法剣
const MS = (id: string, name: string, mp: number, el: Element, extra: Partial<Skill> = {}) => A(id, name, 'msword', mp, { target: 'enemy', effect: 'phys', power: 1.3, element: el, tag: el === 'fire' ? 'fire' : 'physical', ...extra }, `${name}：属性つきの斬撃`);
add(
  MS('magic_sword_fire', 'ファイア剣', 6, 'fire'), MS('magic_sword_ice', 'ブリザド剣', 6, 'ice'), MS('magic_sword_thunder', 'サンダー剣', 6, 'thunder'),
  MS('magic_sword_poison', 'ポイズン剣', 6, 'poison', { status: 'poison', chance: 0.7 }), MS('magic_sword_sleep', 'スリプル剣', 8, 'none', { power: 1.0, status: 'sleep', chance: 0.6 }),
  A('magic_sword_drain', 'ドレイン剣', 'msword', 10, { target: 'enemy', effect: 'drain', power: 90, element: 'dark' }, 'HPを吸う斬撃'),
  MS('magic_sword_holy', 'ホーリー剣', 16, 'holy', { power: 1.8 }), MS('magic_sword_flare', 'フレア剣', 24, 'none', { power: 2.6 }),
);
// 弓技（狩人）
add(
  A('aim', 'ねらう', 'ranger', 0, { target: 'enemy', effect: 'phys', power: 1.5 }, '必中の一矢'),
  A('poison_arrow', '毒矢', 'ranger', 0, { target: 'enemy', effect: 'phys', power: 1.0, status: 'poison', chance: 0.8 }, '毒の矢'),
  A('animals', 'どうぶつ', 'ranger', 0, { target: 'allies', effect: 'heal', power: 60, tag: 'heal' }, '動物が味方を癒す'),
  A('rapid_fire', 'みだれうち', 'ranger', 8, { target: 'enemy', effect: 'phys', power: 0.55, hits: 4 }, '4連射'),
);
// 忍術（忍者）
add(
  A('throw', 'なげる', 'ninja', 0, { target: 'enemy', effect: 'phys', power: 1.6 }, '武器投げ'),
  A('katon', '火遁', 'ninja', 8, { target: 'enemies', effect: 'magic', power: 80, element: 'fire', tag: 'fire' }, '炎の忍術'),
  A('suiton', '水遁', 'ninja', 8, { target: 'enemies', effect: 'magic', power: 80, element: 'water', tag: 'magic' }, '水の忍術'),
  A('raiton', '雷遁', 'ninja', 8, { target: 'enemies', effect: 'magic', power: 80, element: 'thunder', tag: 'magic' }, '雷の忍術'),
  A('bunshin', '分身', 'ninja', 6, { target: 'self', effect: 'buff', power: 30, status: 'blink' }, '回避率が大きく上がる'),
  A('kagenui', '影縫い', 'ninja', 10, { target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.7, tag: 'status' }, '動きを止める'),
);
// リミット技
add(
  S({ id: 'limit_batsu', name: 'マスターミックス', kind: 'limit', mp: 0, target: 'enemies', effect: 'phys', power: 2.5, tag: 'limit', desc: '全体に強撃' }),
  S({ id: 'limit_terra', name: 'トランス', kind: 'limit', mp: 0, target: 'enemies', effect: 'magic', power: 320, element: 'none', tag: 'limit', desc: '全体に魔法大ダメージ' }),
  S({ id: 'limit_cloud', name: '超究武神覇斬', kind: 'limit', mp: 0, target: 'enemy', effect: 'phys', power: 1.0, hits: 7, tag: 'limit', desc: '7連続斬り' }),
  S({ id: 'limit_wol', name: 'シークエンスブレイド', kind: 'limit', mp: 0, target: 'enemy', effect: 'phys', power: 3.5, tag: 'limit', desc: '渾身の一撃' }),
  S({ id: 'limit_firion', name: 'フィンブリア', kind: 'limit', mp: 0, target: 'enemies', effect: 'phys', power: 2.2, tag: 'limit', desc: '全武器連撃' }),
  S({ id: 'limit_cecil', name: 'セイントダイブ', kind: 'limit', mp: 0, target: 'enemy', effect: 'phys', power: 3.0, element: 'holy', tag: 'limit', desc: '聖属性の急襲' }),
);
// モンスター固有技
add(
  S({ id: 'goblin_punch', name: 'ゴブリンパンチ', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 1.5, tag: 'physical', desc: '強めのパンチ' }),
  S({ id: 'bite', name: 'かみつき', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 1.2, tag: 'physical', desc: 'かみつく' }),
  S({ id: 'self_destruct', name: '自爆', kind: 'monster', mp: 0, target: 'enemy', effect: 'fixed', power: 1, element: 'fire', tag: 'fire', desc: '自分のHP分のダメージ、自分は戦闘不能' }),
  S({ id: 'flame', name: '火炎放射', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 50, element: 'fire', tag: 'fire', desc: '全体に炎' }),
  S({ id: 'aqua_breath', name: 'アクアブレス', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 45, element: 'water', tag: 'magic', desc: '全体に水' }),
  S({ id: 'bad_breath', name: 'くさい息', kind: 'monster', mp: 0, target: 'enemies', effect: 'status', power: 0, status: 'poison', chance: 0.7, tag: 'status', desc: '全体を毒に' }),
  S({ id: 'needles', name: '針千本', kind: 'monster', mp: 0, target: 'enemy', effect: 'fixed', power: 1000, tag: 'physical', desc: '固定1000ダメージ' }),
  S({ id: 'grudge', name: 'みんなのうらみ', kind: 'monster', mp: 0, target: 'enemy', effect: 'fixed', power: 0, tag: 'physical', desc: '倒した敵の数×ダメージ' }),
  S({ id: 'bone_throw', name: 'ほねなげ', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 1.1, tag: 'physical', desc: '骨を投げる' }),
  S({ id: 'drain_touch', name: '呪いの手', kind: 'monster', mp: 0, target: 'enemy', effect: 'drain', power: 40, element: 'dark', tag: 'magic', desc: 'HPを吸う' }),
  S({ id: 'lamia_kiss', name: '誘惑', kind: 'monster', mp: 0, target: 'enemy', effect: 'status', power: 0, status: 'sleep', chance: 0.5, tag: 'status', desc: '眠らせる' }),
  S({ id: 'shell_guard', name: '甲羅', kind: 'monster', mp: 0, target: 'self', effect: 'buff', power: 40, status: 'protect', tag: 'defend', desc: '自分にプロテス' }),
  S({ id: 'white_wind', name: 'ホワイトウィンド', kind: 'monster', mp: 10, target: 'allies', effect: 'heal', power: 80, tag: 'heal', desc: '味方全体回復' }),
  S({ id: 'blaster', name: 'ブラスター', kind: 'monster', mp: 0, target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.5, tag: 'status', desc: '麻痺させる' }),
  S({ id: 'choco_kick', name: 'チョコボキック', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 1.3, tag: 'physical', desc: '蹴り' }),
  S({ id: 'mind_blast', name: 'マインドブラスト', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 60, element: 'none', status: 'slow', chance: 0.4, tag: 'status', desc: '全体ダメージ＋スロウ' }),
  S({ id: 'quake_stomp', name: 'ぶんまわし', kind: 'monster', mp: 0, target: 'enemies', effect: 'phys', power: 0.9, tag: 'physical', desc: '全体に物理' }),
  S({ id: 'dark_wave', name: '闇の波動', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 90, element: 'dark', tag: 'magic', desc: 'ガーランドの全体闇攻撃' }),
);
// 追加のモンスター技（エリア3〜10）
add(
  S({ id: 'ice_breath', name: '冷気ブレス', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 70, element: 'ice', tag: 'magic', desc: '全体に冷気' }),
  S({ id: 'thunder_breath', name: '雷ブレス', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 70, element: 'thunder', tag: 'magic', desc: '全体に雷' }),
  S({ id: 'poison_breath', name: '毒ブレス', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 50, element: 'poison', status: 'poison', chance: 0.5, tag: 'status', desc: '全体に毒' }),
  S({ id: 'stone_gaze', name: '石の眼光', kind: 'monster', mp: 0, target: 'enemy', effect: 'status', power: 0, status: 'paralyze', chance: 0.4, tag: 'status', desc: '石化（麻痺）' }),
  S({ id: 'meteor_strike', name: 'メテオストライク', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 2.0, tag: 'physical', desc: '投げ飛ばす' }),
  S({ id: 'megaflare', name: 'メガフレア', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 160, element: 'none', tag: 'magic', desc: '全体に無属性大ダメージ' }),
  S({ id: 'curse', name: '呪い', kind: 'monster', mp: 0, target: 'enemies', effect: 'status', power: 0, status: 'slow', chance: 0.5, tag: 'status', desc: '全体スロウ' }),
  S({ id: 'self_heal', name: '自己再生', kind: 'monster', mp: 10, target: 'self', effect: 'heal', power: 300, tag: 'heal', desc: '自分を回復' }),
  S({ id: 'mighty_guard', name: 'マイティガード', kind: 'monster', mp: 12, target: 'allies', effect: 'buff', power: 30, status: 'protect', tag: 'defend', desc: '味方全体にプロテス' }),
  S({ id: 'laser', name: 'レーザー', kind: 'monster', mp: 0, target: 'enemy', effect: 'magic', power: 120, element: 'none', tag: 'magic', desc: '単体に無属性' }),
  S({ id: 'sleep_gas', name: '眠りの霧', kind: 'monster', mp: 0, target: 'enemies', effect: 'status', power: 0, status: 'sleep', chance: 0.4, tag: 'status', desc: '全体睡眠' }),
  S({ id: 'blind_dust', name: '暗闇の粉', kind: 'monster', mp: 0, target: 'enemies', effect: 'status', power: 0, status: 'blind', chance: 0.5, tag: 'status', desc: '全体暗闇' }),
  S({ id: 'silence_song', name: '沈黙の歌', kind: 'monster', mp: 0, target: 'enemies', effect: 'status', power: 0, status: 'silence', chance: 0.5, tag: 'status', desc: '全体沈黙' }),
  S({ id: 'holy_light', name: '聖なる光', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 110, element: 'holy', tag: 'magic', desc: '全体に聖' }),
  S({ id: 'dark_flare', name: 'ダークフレア', kind: 'monster', mp: 0, target: 'enemy', effect: 'magic', power: 220, element: 'dark', tag: 'magic', desc: '闇の大ダメージ' }),
  S({ id: 'tidal_wave', name: '大海嘯', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 150, element: 'water', tag: 'magic', desc: '全体に水の大ダメージ' }),
  S({ id: 'ultima_blast', name: 'アルテマ', kind: 'monster', mp: 0, target: 'enemies', effect: 'magic', power: 260, element: 'none', tag: 'magic', desc: '究極魔法' }),
  S({ id: 'heartless_angel', name: '心ない天使', kind: 'monster', mp: 0, target: 'enemies', effect: 'fixed', power: -0.9, tag: 'magic', desc: '全員のHPを1桁に' }),
  S({ id: 'gravija', name: 'グラビジャ', kind: 'monster', mp: 0, target: 'enemies', effect: 'fixed', power: -0.5, tag: 'magic', desc: '全員のHP半減' }),
  S({ id: 'brave_slash_m', name: '剛剣', kind: 'monster', mp: 0, target: 'enemy', effect: 'phys', power: 1.8, tag: 'physical', desc: '強い斬撃' }),
  S({ id: 'wing_attack', name: '翼撃', kind: 'monster', mp: 0, target: 'enemies', effect: 'phys', power: 0.8, element: 'wind', tag: 'physical', desc: '風の全体攻撃' }),
);
export function skill(id: string): Skill { const s = SKILLS[id]; if (!s) throw new Error('unknown skill ' + id); return s; }
export function skillsOfCategory(cat: string): Skill[] { return Object.values(SKILLS).filter(s => s.category === cat); }
