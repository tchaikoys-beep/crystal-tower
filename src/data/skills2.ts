// データ拡張 第1弾：技＋80（既存11ジョブ＋新ジョブの追加技）と、ジョブごとの追加解放
import type { Skill, Element, Status } from '../core/types';
type Eff = Skill['effect']; type Tg = Skill['target'];
const tagOf = (effect: Eff, el?: Element): string | undefined =>
  effect === 'phys' ? (el === 'fire' ? 'fire' : 'physical') : effect === 'magic' || effect === 'drain' || effect === 'fixed' ? (el === 'fire' ? 'fire' : 'magic') : effect === 'heal' || effect === 'revive' ? 'heal' : effect === 'status' ? 'status' : effect === 'steal' ? 'steal' : undefined;
const K = (id: string, name: string, category: string, mp: number, target: Tg, effect: Eff, power: number, desc: string, x: Partial<Skill> = {}): Skill =>
  ({ id, name, kind: 'ability', category, mp, target, effect, power, tag: tagOf(effect, x.element), desc, ...x });
const st = (s: Status, chance: number) => ({ status: s, chance });
export const SKILLS2: Skill[] = [
  // ナイト
  K('provoke', '挑発', 'knight', 0, 'self', 'buff', 0, '自分にプロテス。敵の注意を引く', { status: 'protect' }),
  K('holy_shield', '聖なる盾', 'knight', 10, 'allies', 'buff', 0, '味方全体にプロテス', { status: 'protect' }),
  K('cleave', '薙ぎ払い', 'knight', 6, 'enemies', 'phys', 1.1, '敵全体を薙ぎ払う'),
  K('sword_of_light', '光の剣', 'knight', 10, 'enemy', 'phys', 2.0, '聖属性の斬撃', { element: 'holy' }),
  K('climhazzard', 'クライムハザード', 'knight', 14, 'enemy', 'phys', 3.0, '渾身の突き上げ'),
  K('shock', 'ショック', 'knight', 20, 'enemies', 'phys', 2.2, '衝撃波で全体攻撃'),
  // モンク
  K('iron_fist', '鉄拳', 'monk', 0, 'enemy', 'phys', 1.6, '重い正拳突き'),
  K('suplex', 'スープレックス', 'monk', 4, 'enemy', 'phys', 2.0, '投げ技'),
  K('mantra', 'マントラ', 'monk', 8, 'allies', 'heal', 160, '気で味方全体を癒す'),
  K('fire_dance', '火炎掌', 'monk', 8, 'enemy', 'phys', 1.6, '炎をまとった掌打', { element: 'fire' }),
  K('rising_phoenix', '鳳凰の舞', 'monk', 18, 'enemies', 'phys', 2.6, '炎の全体攻撃', { element: 'fire' }),
  // シーフ
  K('smoke_bomb', '煙玉', 'thief', 0, 'enemies', 'status', 0, '敵全体を暗闇に', st('blind', 0.6)),
  K('treasure_hunt', '宝探し', 'thief', 0, 'enemy', 'steal', 0.8, '成功率の高い盗み'),
  K('backstab', '背後斬り', 'thief', 6, 'enemy', 'phys', 2.2, '急所を突く'),
  K('shadow_fang', '影牙', 'thief', 8, 'enemy', 'phys', 1.4, '闇の二連撃', { element: 'dark', hits: 2 }),
  K('phantom_steal', '幻影盗み', 'thief', 10, 'enemy', 'steal', 1.0, 'ほぼ確実に盗む'),
  // 白魔道士（魔法扱い）
  K('protectga', 'プロテガ', 'white', 18, 'allies', 'buff', 0, '味方全体にプロテス', { status: 'protect', kind: 'spell', school: 'white', level: 3 }),
  K('shellga', 'シェルガ', 'white', 18, 'allies', 'buff', 0, '味方全体にシェル', { status: 'shell', kind: 'spell', school: 'white', level: 3 }),
  K('esunaga', 'エスナガ', 'white', 24, 'allies', 'cure', 0, '味方全体の状態異常を治す', { kind: 'spell', school: 'white', level: 3 }),
  K('full_cure', 'フルケア', 'white', 40, 'ally', 'heal', 9999, '味方1人を全回復', { kind: 'spell', school: 'white', level: 3 }),
  // 黒魔道士
  K('quake', 'クエイク', 'black', 16, 'enemies', 'magic', 80, '地属性の全体魔法', { element: 'earth', kind: 'spell', school: 'black', level: 3 }),
  K('waterga', 'ウォタガ', 'black', 30, 'enemies', 'magic', 115, '水属性の全体魔法', { element: 'water', kind: 'spell', school: 'black', level: 3 }),
  K('stonga', 'ストンガ', 'black', 30, 'enemies', 'magic', 115, '地属性の全体魔法', { element: 'earth', kind: 'spell', school: 'black', level: 3 }),
  K('aeroga', 'エアロガ', 'black', 30, 'enemies', 'magic', 115, '風属性の全体魔法', { element: 'wind', kind: 'spell', school: 'black', level: 3 }),
  K('dark', 'ダーク', 'black', 34, 'enemies', 'magic', 125, '闇属性の全体魔法', { element: 'dark', kind: 'spell', school: 'black', level: 3 }),
  K('ultima', 'アルテマ', 'black', 70, 'enemies', 'magic', 210, '究極の無属性魔法', { kind: 'spell', school: 'black', level: 3 }),
  // 魔獣使い
  K('whip_lash', '鞭打ち', 'beast', 0, 'enemy', 'phys', 1.3, '鞭で打ち据える'),
  K('calm', 'なだめる', 'beast', 4, 'enemy', 'status', 0, '敵を眠らせる', st('sleep', 0.7)),
  K('call_beast', 'けものよび', 'beast', 8, 'enemies', 'phys', 1.1, '獣の群れで全体攻撃'),
  K('taming', '手懐け', 'beast', 12, 'enemy', 'capture', 1, '捕獲。成功率が高い'),
  K('beast_roar', '獣王の咆哮', 'beast', 16, 'allies', 'buff', 0, '味方全体をバーサクに（攻撃×1.5）', { status: 'berserk' }),
  // 竜騎士
  K('spear_thrust', '突き', 'dragoon', 0, 'enemy', 'phys', 1.3, '素早い突き'),
  K('dragon_breath', '竜のブレス', 'dragoon', 10, 'enemies', 'magic', 75, '炎のブレス', { element: 'fire' }),
  K('wyvern_dive', 'ワイバーンダイブ', 'dragoon', 8, 'enemy', 'phys', 2.5, '急降下攻撃'),
  K('dragon_heart', '竜の心', 'dragoon', 6, 'self', 'buff', 0, '自分にリジェネ', { status: 'regen' }),
  K('holy_dive', '聖竜の一撃', 'dragoon', 18, 'enemy', 'phys', 3.6, '聖属性の最大ジャンプ', { element: 'holy' }),
  // 狩人
  K('barrage', '乱れ撃ち', 'ranger', 0, 'enemy', 'phys', 0.6, '3連射', { hits: 3 }),
  K('fire_arrow', '火矢', 'ranger', 4, 'enemy', 'phys', 1.4, '炎の矢', { element: 'fire' }),
  K('blind_shot', '目潰し矢', 'ranger', 4, 'enemy', 'status', 0, '敵を暗闇に', st('blind', 0.8)),
  K('slow_shot', '足止め矢', 'ranger', 6, 'enemy', 'status', 0, '敵をスロウに', st('slow', 0.8)),
  K('sidewinder', 'サイドワインダー', 'ranger', 10, 'enemy', 'phys', 2.3, '強弓の一撃'),
  K('arrow_rain', '矢の雨', 'ranger', 16, 'enemies', 'phys', 1.5, '全体に矢を降らせる'),
  // 忍者
  K('doton', '土遁', 'ninja', 8, 'enemies', 'magic', 80, '地の忍術', { element: 'earth' }),
  K('fuuton', '風遁', 'ninja', 8, 'enemies', 'magic', 80, '風の忍術', { element: 'wind' }),
  K('shuriken', '手裏剣', 'ninja', 4, 'enemy', 'phys', 1.4, '二連投げ', { hits: 2 }),
  K('smoke', '煙隠れ', 'ninja', 6, 'self', 'buff', 0, '自分にブリンク', { status: 'blink' }),
  K('shadow_bind', '影縛り', 'ninja', 10, 'enemy', 'status', 0, '敵を麻痺させる', st('paralyze', 0.6)),
  K('fuma', '風魔', 'ninja', 20, 'enemies', 'phys', 2.6, '風の全体斬り', { element: 'wind' }),
  // 魔法剣士
  K('magic_sword_water', 'ウォータ剣', 'msword', 6, 'enemy', 'phys', 1.3, '水属性の剣', { element: 'water' }),
  K('magic_sword_aero', 'エアロ剣', 'msword', 6, 'enemy', 'phys', 1.3, '風属性の剣', { element: 'wind' }),
  K('magic_sword_stone', 'ストーン剣', 'msword', 6, 'enemy', 'phys', 1.3, '地属性の剣', { element: 'earth' }),
  K('magic_sword_bio', 'バイオ剣', 'msword', 10, 'enemy', 'phys', 1.5, '毒属性の剣＋毒', { element: 'poison', ...st('poison', 0.6) }),
  K('magic_sword_break', 'ブレイク剣', 'msword', 12, 'enemy', 'phys', 1.4, '麻痺させる剣', st('paralyze', 0.5)),
  K('magic_sword_dark', 'ダーク剣', 'msword', 16, 'enemy', 'phys', 1.7, '闇属性の剣', { element: 'dark' }),
  // 時魔道士
  K('graviga', 'グラビガ', 'time', 24, 'enemies', 'fixed', -0.5, '敵全体のHP50%（ボス12%）', { kind: 'spell', school: 'time', level: 3 }),
  K('stopga', 'ストップガ', 'time', 26, 'enemies', 'status', 0, '敵全体を麻痺', { ...st('paralyze', 0.5), kind: 'spell', school: 'time', level: 3 }),
  K('meteorite', 'メテオライト', 'time', 36, 'enemies', 'magic', 150, '小隕石の雨', { kind: 'spell', school: 'time', level: 3 }),
  K('regenga', 'リジェガ', 'time', 20, 'allies', 'buff', 0, '味方全体にリジェネ', { status: 'regen', kind: 'spell', school: 'time', level: 3 }),
  K('quick', 'クイック', 'time', 30, 'self', 'buff', 0, '自分にヘイスト＋ブリンク相当（ヘイスト）', { status: 'haste', kind: 'spell', school: 'time', level: 3 }),
  // バーサーカー
  K('headbutt', '頭突き', 'rage', 0, 'enemy', 'status', 0, '麻痺させる', st('paralyze', 0.5)),
  K('blood_frenzy', '血の狂乱', 'rage', 6, 'enemy', 'phys', 1.9, '荒々しい連撃', { hits: 2, power: 1.0 }),
  K('berserk_howl', '狂戦士の咆哮', 'rage', 12, 'allies', 'buff', 0, '味方全体をバーサクに', { status: 'berserk' }),
  K('titan_smash', '巨神撃', 'rage', 18, 'enemy', 'phys', 3.4, '地を割る一撃', { element: 'earth' }),
  // 薬師
  K('mix_speed', '調合：スピードドリンク', 'mix', 6, 'ally', 'buff', 0, '味方1人にヘイスト', { status: 'haste' }),
  K('mix_holy', '調合：聖水', 'mix', 6, 'enemies', 'magic', 90, '聖属性で全体攻撃', { element: 'holy' }),
  K('mix_dark', '調合：闇の霧', 'mix', 6, 'enemies', 'status', 0, '敵全体を暗闇に', st('blind', 0.8)),
  K('mix_giant', '調合：巨人の薬', 'mix', 12, 'allies', 'buff', 0, '味方全体にリジェネ', { status: 'regen' }),
  // 風水士
  K('stalactite', '鍾乳石', 'geo', 0, 'enemy', 'magic', 95, '地属性の単体攻撃。MP0', { element: 'earth' }),
  K('sandstorm', '砂嵐', 'geo', 0, 'enemies', 'status', 0, '敵全体を暗闇に。MP0', st('blind', 0.6)),
  K('volcano', '火山', 'geo', 0, 'enemies', 'magic', 125, '炎の全体攻撃。MP0', { element: 'fire' }),
  // 侍
  K('meditate', '瞑想', 'samurai', 0, 'self', 'heal', 250, '心を静めてHPを回復'),
  K('kotetsu_slash', '虎徹斬り', 'samurai', 6, 'enemy', 'phys', 1.5, '二連の斬撃', { hits: 2 }),
  K('murasame_slash', '村雨', 'samurai', 10, 'enemy', 'phys', 2.1, '水属性の居合', { element: 'water' }),
  K('masamune_slash', '正宗', 'samurai', 18, 'enemy', 'phys', 2.5, '二連の大業物', { hits: 2 }),
  // 吟遊詩人
  K('swift_song', '霞の歌', 'song', 8, 'allies', 'buff', 0, '味方全体にブリンク', { status: 'blink' }),
  K('magic_song', '魔力の歌', 'song', 10, 'allies', 'buff', 0, '味方全体にシェル', { status: 'shell' }),
  K('angel_song', '天使の歌', 'song', 20, 'allies', 'heal', 320, '味方全体を癒す'),
  // 踊り子
  K('fire_dance_d', '炎の舞', 'dance', 0, 'enemies', 'magic', 70, '炎の全体攻撃', { element: 'fire' }),
  K('heal_dance', '癒しの舞', 'dance', 0, 'allies', 'heal', 200, '味方全体を癒す'),
  K('death_dance', '死の舞', 'dance', 16, 'enemies', 'fixed', -0.4, '敵全体のHP40%（ボス10%）', { element: 'dark' }),
];
export const EXTRA_UNLOCKS: Record<string, { lv: number; skill: string }[]> = {
  knight: [{ lv: 2, skill: 'provoke' }, { lv: 5, skill: 'cleave' }, { lv: 8, skill: 'holy_shield' }, { lv: 12, skill: 'sword_of_light' }, { lv: 18, skill: 'climhazzard' }, { lv: 20, skill: 'shock' }],
  monk: [{ lv: 4, skill: 'iron_fist' }, { lv: 8, skill: 'suplex' }, { lv: 12, skill: 'mantra' }, { lv: 16, skill: 'fire_dance' }, { lv: 18, skill: 'rising_phoenix' }],
  thief: [{ lv: 2, skill: 'smoke_bomb' }, { lv: 6, skill: 'treasure_hunt' }, { lv: 9, skill: 'backstab' }, { lv: 12, skill: 'shadow_fang' }, { lv: 18, skill: 'phantom_steal' }],
  whitemage: [{ lv: 10, skill: 'protectga' }, { lv: 12, skill: 'shellga' }, { lv: 15, skill: 'esunaga' }, { lv: 18, skill: 'full_cure' }],
  blackmage: [{ lv: 5, skill: 'quake' }, { lv: 11, skill: 'waterga' }, { lv: 13, skill: 'stonga' }, { lv: 14, skill: 'aeroga' }, { lv: 16, skill: 'dark' }, { lv: 20, skill: 'ultima' }],
  beastmaster: [{ lv: 2, skill: 'whip_lash' }, { lv: 5, skill: 'calm' }, { lv: 9, skill: 'call_beast' }, { lv: 15, skill: 'taming' }, { lv: 18, skill: 'beast_roar' }],
  dragoon: [{ lv: 2, skill: 'spear_thrust' }, { lv: 6, skill: 'dragon_breath' }, { lv: 10, skill: 'wyvern_dive' }, { lv: 14, skill: 'dragon_heart' }, { lv: 20, skill: 'holy_dive' }],
  ranger: [{ lv: 2, skill: 'barrage' }, { lv: 6, skill: 'fire_arrow' }, { lv: 7, skill: 'blind_shot' }, { lv: 10, skill: 'slow_shot' }, { lv: 15, skill: 'sidewinder' }, { lv: 20, skill: 'arrow_rain' }],
  ninja: [{ lv: 5, skill: 'doton' }, { lv: 6, skill: 'fuuton' }, { lv: 10, skill: 'shuriken' }, { lv: 12, skill: 'smoke' }, { lv: 17, skill: 'shadow_bind' }, { lv: 20, skill: 'fuma' }],
  mswordsman: [{ lv: 3, skill: 'magic_sword_water' }, { lv: 3, skill: 'magic_sword_aero' }, { lv: 6, skill: 'magic_sword_stone' }, { lv: 10, skill: 'magic_sword_bio' }, { lv: 14, skill: 'magic_sword_break' }, { lv: 18, skill: 'magic_sword_dark' }],
  timemage: [{ lv: 10, skill: 'graviga' }, { lv: 13, skill: 'stopga' }, { lv: 16, skill: 'regenga' }, { lv: 17, skill: 'meteorite' }, { lv: 19, skill: 'quick' }],
  redmage: [{ lv: 10, skill: 'esuna' }, { lv: 11, skill: 'raise' }, { lv: 13, skill: 'bio' }, { lv: 15, skill: 'regen' }],
  berserker: [{ lv: 4, skill: 'headbutt' }, { lv: 8, skill: 'blood_frenzy' }, { lv: 13, skill: 'berserk_howl' }, { lv: 19, skill: 'titan_smash' }],
  chemist: [{ lv: 5, skill: 'mix_speed' }, { lv: 9, skill: 'mix_holy' }, { lv: 14, skill: 'mix_dark' }, { lv: 16, skill: 'mix_giant' }],
  geomancer: [{ lv: 3, skill: 'stalactite' }, { lv: 12, skill: 'sandstorm' }, { lv: 18, skill: 'volcano' }],
  samurai: [{ lv: 4, skill: 'meditate' }, { lv: 8, skill: 'kotetsu_slash' }, { lv: 13, skill: 'murasame_slash' }, { lv: 19, skill: 'masamune_slash' }],
  bard: [{ lv: 5, skill: 'swift_song' }, { lv: 11, skill: 'magic_song' }, { lv: 18, skill: 'angel_song' }],
  dancer: [{ lv: 7, skill: 'fire_dance_d' }, { lv: 11, skill: 'heal_dance' }, { lv: 18, skill: 'death_dance' }],
};
