import type { Element, MonsterDef, AreaDef, LawDef } from '../core/types';

export const MONSTERS: Record<string, MonsterDef> = {};
function add(...l: MonsterDef[]) { for (const m of l) MONSTERS[m.id] = m; }
add(
  { id: 'goblin', name: 'ゴブリン', family: 'beast', role: 'attacker', mult: { hp: 0.9, str: 1.0, spd: 1.0 }, skills: ['goblin_punch'], captureRate: 0.6, material: 'goblin_ear', evolveTo: 'black_goblin', color: '#6a4' },
  { id: 'black_goblin', name: 'ブラックゴブリン', family: 'beast', role: 'attacker', mult: { hp: 1.1, str: 1.2, spd: 1.1 }, skills: ['goblin_punch'], captureRate: 0.4, material: 'goblin_ear', color: '#353' },
  { id: 'wolf', name: 'ウルフ', family: 'beast', role: 'attacker', mult: { hp: 0.8, str: 1.1, spd: 1.4 }, skills: ['bite'], captureRate: 0.5, material: 'wolf_fang', evolveTo: 'silver_wolf', color: '#999' },
  { id: 'silver_wolf', name: 'シルバーウルフ', family: 'beast', role: 'attacker', mult: { hp: 1.0, str: 1.35, spd: 1.6 }, skills: ['bite', 'quake_stomp'], captureRate: 0.3, material: 'wolf_fang', color: '#ccd' },
  { id: 'bomb', name: 'ボム', family: 'elemental', role: 'attacker', mult: { hp: 0.7, mag: 1.3, spd: 1.0 }, resist: { fire: -1, ice: 2 }, skills: ['flame', 'self_destruct'], captureRate: 0.45, material: 'bomb_core', evolveTo: 'grenade', color: '#e63' },
  { id: 'grenade', name: 'グレネード', family: 'elemental', role: 'attacker', mult: { hp: 1.0, mag: 1.6, spd: 1.1 }, resist: { fire: -1, ice: 2 }, skills: ['flame', 'self_destruct'], captureRate: 0.3, material: 'bomb_core', evolveTo: 'bomb_king', color: '#f94' },
  { id: 'skeleton', name: 'スケルトン', family: 'undead', role: 'jammer', mult: { hp: 1.0, str: 1.0, vit: 1.2 }, resist: { holy: 2, fire: 2, dark: -1, poison: 0 }, skills: ['bone_throw'], captureRate: 0.35, material: 'magicite', evolveTo: 'lich', color: '#eee' },
  { id: 'zombie', name: 'ゾンビ', family: 'undead', role: 'blocker', mult: { hp: 1.6, str: 1.1, vit: 1.1, spd: 0.6 }, resist: { holy: 2, fire: 2, dark: -1, poison: 0 }, skills: ['drain_touch'], captureRate: 0.3, color: '#595' },
  { id: 'pudding', name: 'プリン', family: 'amorph', role: 'blocker', mult: { hp: 1.2, vit: 3.0, mag: 1.2, spr: 0.3, spd: 0.7 }, resist: { thunder: 2 }, skills: ['aqua_breath'], captureRate: 0.4, material: 'slime_jelly', evolveTo: 'flan', color: '#fc4' },
  { id: 'flan', name: 'フラン', family: 'amorph', role: 'blocker', mult: { hp: 1.6, vit: 3.5, mag: 1.5, spr: 0.4, spd: 0.7 }, resist: { thunder: 2, fire: 0.5 }, skills: ['aqua_breath', 'white_wind'], captureRate: 0.25, material: 'slime_jelly', color: '#f8c' },
  { id: 'sahagin', name: 'サハギン', family: 'aquatic', role: 'attacker', mult: { hp: 1.0, str: 1.1 }, resist: { thunder: 2, water: 0.5 }, skills: ['aqua_breath'], captureRate: 0.45, color: '#3bc' },
  { id: 'lamia', name: 'ラミア', family: 'demon', role: 'jammer', mult: { hp: 0.9, mag: 1.2, spd: 1.1 }, skills: ['lamia_kiss'], captureRate: 0.35, color: '#c5a' },
  { id: 'mindflayer', name: 'マインドフレア', family: 'demon', role: 'jammer', mult: { hp: 0.9, mag: 1.4, spr: 1.3 }, resist: { thunder: 0.5 }, skills: ['mind_blast'], captureRate: 0.3, color: '#96c' },
  { id: 'tonberry', name: 'トンベリ', family: 'demon', role: 'attacker', mult: { hp: 1.5, str: 1.3, vit: 1.3, spd: 0.5 }, skills: ['grudge'], captureRate: 0.2, color: '#4a6' },
  { id: 'cactuar', name: 'サボテンダー', family: 'plant', role: 'attacker', mult: { hp: 0.3, vit: 2.0, spd: 2.5, luck: 2 }, skills: ['needles'], captureRate: 0.15, color: '#5c5' },
  { id: 'malboro', name: 'モルボル', family: 'plant', role: 'jammer', mult: { hp: 1.8, str: 1.0, vit: 1.2, spd: 0.6 }, resist: { fire: 2, poison: 0 }, skills: ['bad_breath'], captureRate: 0.25, color: '#7a3' },
  { id: 'adamantoise', name: 'アダマンタイマイ', family: 'beast', role: 'blocker', mult: { hp: 2.2, str: 1.1, vit: 2.5, spd: 0.4 }, resist: { ice: 2 }, skills: ['shell_guard', 'quake_stomp'], captureRate: 0.2, color: '#875' },
  { id: 'coeurl', name: 'クアール', family: 'beast', role: 'jammer', mult: { hp: 0.9, str: 1.2, spd: 1.5 }, skills: ['blaster'], captureRate: 0.3, color: '#a8c' },
  { id: 'chocobo', name: 'チョコボ', family: 'bird', role: 'support', mult: { hp: 0.9, str: 1.0, spd: 1.6 }, skills: ['choco_kick'], captureRate: 0.5, material: 'wolf_fang', evolveTo: 'black_chocobo', color: '#fd3' },
  { id: 'black_chocobo', name: '黒チョコボ', family: 'bird', role: 'support', mult: { hp: 1.1, str: 1.2, spd: 1.9 }, skills: ['choco_kick', 'white_wind'], captureRate: 0.3, material: 'wolf_fang', color: '#333' },
  { id: 'unicorn', name: 'ユニコーン', family: 'beast', role: 'healer', mult: { hp: 1.0, mag: 1.2, spr: 1.5, spd: 1.2 }, resist: { holy: 0.5, dark: 2 }, skills: ['white_wind'], captureRate: 0.25, color: '#eef' },
  { id: 'red_dragon', name: 'レッドドラゴン', family: 'dragon', role: 'attacker', mult: { hp: 2.0, str: 1.4, vit: 1.3, mag: 1.2 }, resist: { fire: -1, ice: 2 }, skills: ['flame'], captureRate: 0.1, material: 'dragon_fang', evolveTo: 'gold_dragon', color: '#c33' },
  { id: 'gold_dragon', name: 'ゴールドドラゴン', family: 'dragon', role: 'attacker', mult: { hp: 2.6, str: 1.7, vit: 1.5, mag: 1.4, spd: 1.1 }, resist: { fire: 0.5, ice: 0.5, thunder: 0.5 }, skills: ['flame', 'quake_stomp', 'dark_wave'], captureRate: 0.05, material: 'dragon_fang', color: '#fc3' },
  // ボス
  { id: 'goblin_prince', name: 'ゴブリンプリンス', family: 'beast', role: 'attacker', mult: { hp: 6, str: 1.3, vit: 1.2, spd: 1.1 }, skills: ['goblin_punch'], captureRate: 0, boss: true, material: 'fire_shard', color: '#4a2' },
  { id: 'bomb_king', name: 'ボムキング', family: 'elemental', role: 'attacker', mult: { hp: 7, mag: 1.5, spd: 1.0 }, resist: { fire: -1, ice: 2 }, skills: ['flame', 'flame', 'self_destruct'], captureRate: 0, boss: true, material: 'fire_shard', color: '#f62' },
  { id: 'lich', name: 'リッチ', family: 'undead', role: 'jammer', mult: { hp: 8, mag: 1.6, spr: 1.4 }, resist: { holy: 2, fire: 2, dark: -1, poison: 0 }, skills: ['drain_touch', 'mind_blast'], captureRate: 0, boss: true, material: 'fire_shard', color: '#aac' },
  { id: 'garland', name: 'ガーランド', family: 'boss', role: 'attacker', mult: { hp: 14, str: 1.6, vit: 1.5, mag: 1.4, spr: 1.3, spd: 1.2 }, resist: { dark: 0, holy: 1.5 }, skills: ['dark_wave', 'quake_stomp'], captureRate: 0, boss: true, material: 'phoenix_feather', color: '#334' },
);

// ---- エリア3〜10の敵（M: 簡易定義）
const M = (id: string, name: string, family: string, role: MonsterDef['role'], mult: MonsterDef['mult'], skills: string[], captureRate: number, color: string, extra: Partial<MonsterDef> = {}): MonsterDef =>
  ({ id, name, family, role, mult, skills, captureRate, color, ...extra });
add(
  // エリア3 浮遊大陸（FF3）
  M('gargoyle', 'ガーゴイル', 'bird', 'attacker', { hp: 1.0, str: 1.2, spd: 1.3 }, ['wing_attack'], 0.35, '#889', { resist: { earth: 0, wind: 0.5 } }),
  M('griffin', 'グリフォン', 'bird', 'attacker', { hp: 1.2, str: 1.3, spd: 1.4 }, ['wing_attack', 'bite'], 0.3, '#da6'),
  M('lamia_queen', 'ラミアクイーン', 'demon', 'jammer', { hp: 1.1, mag: 1.4, spd: 1.2 }, ['lamia_kiss', 'silence_song'], 0.25, '#e6b'),
  M('medusa', 'メデューサ', 'demon', 'jammer', { hp: 1.0, mag: 1.3 }, ['stone_gaze', 'bite'], 0.25, '#5a5'),
  M('dragon_zombie', 'ドラゴンゾンビ', 'undead', 'attacker', { hp: 2.0, str: 1.4, vit: 1.2, spd: 0.6 }, ['poison_breath', 'drain_touch'], 0.15, '#575', { resist: { holy: 2, fire: 2, dark: -1, poison: 0 }, material: 'dragon_fang' }),
  M('vampire', 'バンパイア', 'undead', 'jammer', { hp: 1.2, str: 1.1, mag: 1.3, spd: 1.2 }, ['drain_touch', 'sleep_gas'], 0.2, '#636', { resist: { holy: 2, dark: -1 } }),
  M('hecatoncheir', 'ヘカトンケイル', 'giant', 'blocker', { hp: 2.4, str: 1.5, vit: 1.6, spd: 0.5 }, ['quake_stomp', 'meteor_strike'], 0.15, '#986'),
  M('magic_pot', 'マジックポット', 'amorph', 'support', { hp: 0.5, vit: 4, spr: 4, spd: 1.5 }, ['white_wind', 'self_heal'], 0.1, '#fe8', { resist: { fire: 0.5, ice: 0.5, thunder: 0.5 }, material: 'magicite' }),
  // エリア4 月（FF4）
  M('magitek_armor', '魔導アーマー', 'machine', 'blocker', { hp: 1.8, str: 1.3, vit: 1.8, spd: 0.7 }, ['laser', 'thunder_breath'], 0.2, '#79b', { resist: { thunder: 2, poison: 0 } }),
  M('proto_armor', 'プロトアーマー', 'machine', 'attacker', { hp: 1.4, str: 1.5, vit: 1.4 }, ['laser', 'quake_stomp'], 0.2, '#9ab', { resist: { thunder: 2, poison: 0 } }),
  M('guardian', 'ガーディアン', 'machine', 'blocker', { hp: 2.6, str: 1.2, vit: 2.2, spd: 0.5 }, ['mighty_guard', 'laser'], 0.1, '#bbc', { resist: { thunder: 2, poison: 0 } }),
  M('behemoth', 'ベヒーモス', 'beast', 'attacker', { hp: 2.2, str: 1.6, vit: 1.3, spd: 0.9 }, ['meteor_strike'], 0.12, '#a4c', { material: 'dragon_fang', evolveTo: 'king_behemoth' }),
  M('king_behemoth', 'キングベヒーモス', 'beast', 'attacker', { hp: 3.0, str: 2.0, vit: 1.6, mag: 1.3 }, ['meteor_strike', 'megaflare'], 0.05, '#c3c', { material: 'dragon_fang' }),
  M('blue_dragon', 'ブルードラゴン', 'dragon', 'attacker', { hp: 2.0, str: 1.4, vit: 1.3, mag: 1.2 }, ['ice_breath'], 0.1, '#36c', { resist: { ice: -1, fire: 2 }, material: 'dragon_fang' }),
  M('yellow_dragon', 'イエロードラゴン', 'dragon', 'attacker', { hp: 2.0, str: 1.4, vit: 1.3, mag: 1.2 }, ['thunder_breath'], 0.1, '#cc3', { resist: { thunder: -1, earth: 2 }, material: 'dragon_fang' }),
  M('moon_flayer', 'ルナフレア', 'demon', 'jammer', { hp: 1.0, mag: 1.6, spr: 1.4 }, ['mind_blast', 'curse'], 0.2, '#a7d'),
  // エリア5 次元の狭間（FF5）
  M('great_malboro', 'モルボルグレート', 'plant', 'jammer', { hp: 2.2, str: 1.1, vit: 1.4, spd: 0.6 }, ['bad_breath', 'poison_breath'], 0.15, '#6a2', { resist: { fire: 2, poison: 0 } }),
  M('tonberry_king', 'トンベリキング', 'demon', 'attacker', { hp: 2.2, str: 1.6, vit: 1.5, spd: 0.5 }, ['grudge', 'curse'], 0.08, '#283'),
  M('ahriman', 'アーリマン', 'demon', 'jammer', { hp: 1.1, mag: 1.5, spd: 1.3 }, ['stone_gaze', 'blind_dust', 'curse'], 0.2, '#86a'),
  M('jabotender', 'ジャボテンダー', 'plant', 'attacker', { hp: 0.6, vit: 2.5, spd: 2.5, luck: 2 }, ['needles', 'needles'], 0.08, '#3c3'),
  M('iron_giant', 'アイアンジャイアント', 'giant', 'blocker', { hp: 2.8, str: 1.7, vit: 2.0, spd: 0.5 }, ['quake_stomp', 'meteor_strike'], 0.1, '#667', { resist: { thunder: 2, poison: 0 }, material: 'orichalcum' }),
  M('deathgaze', 'デスゲイズ', 'demon', 'jammer', { hp: 1.6, mag: 1.6, spd: 1.4 }, ['stone_gaze', 'ice_breath', 'curse'], 0.08, '#448'),
  M('shinryu_whelp', '神竜の仔', 'dragon', 'attacker', { hp: 2.4, str: 1.6, mag: 1.5, spd: 1.1 }, ['tidal_wave', 'ice_breath'], 0.05, '#8cf', { resist: { water: -1 }, material: 'dragon_fang' }),
  // エリア6 瓦礫の世界（FF6）
  M('magitek_armor2', '魔導アーマー改', 'machine', 'attacker', { hp: 2.0, str: 1.6, vit: 1.8 }, ['laser', 'megaflare'], 0.12, '#9ac', { resist: { thunder: 2, poison: 0 } }),
  M('tyrannosaur', 'ティラノサウルス', 'beast', 'attacker', { hp: 2.6, str: 1.9, vit: 1.4, spd: 0.8 }, ['bite', 'meteor_strike'], 0.08, '#8a4', { material: 'dragon_fang' }),
  M('brachiosaur', 'ブラキオレイドス', 'dragon', 'blocker', { hp: 3.4, str: 1.8, vit: 1.8, mag: 1.6, spd: 0.6 }, ['quake_stomp', 'megaflare', 'ultima_blast'], 0.03, '#486', { material: 'dragon_fang' }),
  M('ultima_weapon_lesser', 'アルテマウェポン', 'machine', 'attacker', { hp: 3.0, str: 1.8, mag: 1.8 }, ['laser', 'megaflare'], 0.03, '#bcf', { resist: { poison: 0 } }),
  M('doom_dragon', 'ドゥームドラゴン', 'dragon', 'attacker', { hp: 2.4, str: 1.6, mag: 1.5 }, ['dark_flare', 'poison_breath'], 0.06, '#424', { resist: { dark: -1, holy: 2 }, material: 'dragon_fang' }),
  M('cherry', 'チェリー', 'demon', 'jammer', { hp: 1.2, mag: 1.4, spd: 1.3 }, ['sleep_gas', 'silence_song'], 0.2, '#f7a'),
  // エリア7 ミッドガル（FF7）
  M('soldier', 'ソルジャー', 'human', 'attacker', { hp: 1.3, str: 1.5, vit: 1.2, spd: 1.2 }, ['brave_slash_m'], 0.25, '#46c'),
  M('guard_hound', 'ガードハウンド', 'beast', 'attacker', { hp: 1.0, str: 1.3, spd: 1.6 }, ['bite'], 0.35, '#a66', { material: 'wolf_fang' }),
  M('midgar_zolom', 'ミドガルズオルム', 'dragon', 'attacker', { hp: 3.0, str: 1.7, vit: 1.5, spd: 0.8 }, ['poison_breath', 'bite'], 0.05, '#4a8', { material: 'dragon_fang' }),
  M('proud_clod', 'プラウド・クラッド', 'machine', 'blocker', { hp: 3.0, str: 1.6, vit: 2.2 }, ['laser', 'mighty_guard'], 0.05, '#88a', { resist: { thunder: 2, poison: 0 } }),
  M('sweeper', 'スイーパー', 'machine', 'attacker', { hp: 1.4, str: 1.4, vit: 1.5 }, ['laser'], 0.25, '#aa8', { resist: { thunder: 2, poison: 0 } }),
  M('ghost_ship', 'ゴーストシップ', 'undead', 'jammer', { hp: 1.8, mag: 1.4 }, ['curse', 'drain_touch'], 0.1, '#79a', { resist: { holy: 2, dark: -1 } }),
  // エリア8 アルティミシア城（FF8）
  M('ruby_dragon', 'ルブルムドラゴン', 'dragon', 'attacker', { hp: 2.6, str: 1.8, mag: 1.5 }, ['flame', 'ice_breath', 'megaflare'], 0.05, '#d33', { resist: { fire: -1 }, material: 'dragon_fang' }),
  M('grendel', 'グレンデル', 'dragon', 'attacker', { hp: 1.8, str: 1.5, spd: 1.1 }, ['bite', 'thunder_breath'], 0.12, '#5b5', { material: 'dragon_fang' }),
  M('iron_giant2', 'アイアンジャイアント', 'giant', 'blocker', { hp: 3.2, str: 1.9, vit: 2.2, spd: 0.5 }, ['meteor_strike', 'quake_stomp'], 0.08, '#778', { material: 'orichalcum' }),
  M('malboro_worst', 'モルボルワースト', 'plant', 'jammer', { hp: 2.6, vit: 1.5 }, ['bad_breath', 'poison_breath', 'sleep_gas'], 0.1, '#582', { resist: { fire: 2, poison: 0 } }),
  M('torama', 'トラマ', 'beast', 'jammer', { hp: 1.4, str: 1.5, spd: 1.7 }, ['blaster', 'bite'], 0.15, '#c9b'),
  M('imp8', 'インプ', 'demon', 'jammer', { hp: 0.9, mag: 1.5, spd: 1.5 }, ['curse', 'blind_dust'], 0.25, '#a5f'),
  // エリア9 テラ（FF9）
  M('yan', 'ヤーン', 'beast', 'attacker', { hp: 2.2, str: 2.2, vit: 1.6, spd: 1.3 }, ['meteor_strike', 'quake_stomp'], 0.05, '#fdd'),
  M('ring_leader', 'リングリーダー', 'demon', 'jammer', { hp: 1.5, mag: 1.6, spr: 1.5 }, ['curse', 'silence_song', 'laser'], 0.12, '#ccf'),
  M('gargant', 'ガルガント', 'beast', 'attacker', { hp: 1.8, str: 1.6, spd: 1.2 }, ['bite', 'poison_breath'], 0.15, '#a94'),
  M('mover', 'ムーバー', 'elemental', 'attacker', { hp: 0.8, mag: 1.8, spd: 1.8 }, ['self_destruct', 'flame'], 0.15, '#f66', { resist: { fire: -1 } }),
  M('behemoth9', 'ベヒーモス', 'beast', 'attacker', { hp: 2.4, str: 1.8, vit: 1.4 }, ['meteor_strike', 'megaflare'], 0.08, '#b4b', { material: 'dragon_fang' }),
  M('nova_dragon_whelp', 'ノヴァドラゴン', 'dragon', 'attacker', { hp: 3.0, str: 1.8, mag: 1.8, spd: 1.1 }, ['tidal_wave', 'thunder_breath', 'megaflare'], 0.03, '#3cf', { material: 'dragon_fang' }),
  // エリア10 ザナルカンド（FF10）
  M('sinscale', 'シンのコケラ', 'aquatic', 'attacker', { hp: 0.9, str: 1.3, spd: 1.5 }, ['bite', 'tidal_wave'], 0.3, '#5ab'),
  M('behemoth_king10', 'ベヒーモスキング', 'beast', 'attacker', { hp: 3.2, str: 2.1, vit: 1.6, mag: 1.4 }, ['meteor_strike', 'megaflare'], 0.04, '#d4d', { material: 'dragon_fang' }),
  M('great_malboro10', 'グレートモルボル', 'plant', 'jammer', { hp: 2.8, vit: 1.6 }, ['bad_breath', 'poison_breath', 'sleep_gas', 'blind_dust'], 0.08, '#4a1', { resist: { fire: 2, poison: 0 } }),
  M('varuna', 'ヴァルナ', 'demon', 'jammer', { hp: 1.8, mag: 1.8, spr: 1.5 }, ['laser', 'curse', 'dark_flare'], 0.08, '#86c'),
  M('adamantoise10', 'アダマンタイマイ', 'beast', 'blocker', { hp: 3.5, str: 1.5, vit: 3.0, spd: 0.4 }, ['shell_guard', 'quake_stomp'], 0.08, '#875'),
  M('fafnir', 'ファフニール', 'dragon', 'attacker', { hp: 2.8, str: 1.9, mag: 1.6 }, ['flame', 'ice_breath', 'thunder_breath'], 0.04, '#c84', { material: 'dragon_fang' }),
  // 中ボス・エリアボス（3〜10）
  M('garuda', 'ガルーダ', 'bird', 'attacker', { hp: 8, str: 1.4, spd: 1.3 }, ['wing_attack', 'thunder_breath'], 0, '#fc6', { boss: true, material: 'fire_shard' }),
  M('kraken', 'クラーケン', 'aquatic', 'blocker', { hp: 9, str: 1.3, vit: 1.4 }, ['tidal_wave', 'bite'], 0, '#36a', { boss: true, resist: { thunder: 2 }, material: 'fire_shard' }),
  M('titan_boss', 'タイタン', 'giant', 'blocker', { hp: 10, str: 1.6, vit: 1.6 }, ['quake_stomp', 'meteor_strike'], 0, '#a85', { boss: true, resist: { wind: 2 }, material: 'fire_shard' }),
  M('cloud_of_darkness', '暗闇の雲', 'boss', 'jammer', { hp: 16, str: 1.4, mag: 1.8, spr: 1.4, spd: 1.2 }, ['dark_flare', 'laser', 'curse'], 0, '#324', { boss: true, resist: { dark: 0, holy: 1.5 }, material: 'phoenix_feather' }),
  M('scarmiglione', 'スカルミリョーネ', 'undead', 'jammer', { hp: 8, mag: 1.5 }, ['curse', 'drain_touch', 'poison_breath'], 0, '#584', { boss: true, resist: { holy: 2, fire: 2, dark: -1 }, material: 'fire_shard' }),
  M('cagnazzo', 'カイナッツォ', 'aquatic', 'blocker', { hp: 9, str: 1.4, vit: 1.5 }, ['tidal_wave', 'shell_guard'], 0, '#3ab', { boss: true, resist: { thunder: 2, water: -1 }, material: 'fire_shard' }),
  M('barbariccia', 'バルバリシア', 'demon', 'attacker', { hp: 9, str: 1.4, mag: 1.4, spd: 1.5 }, ['wing_attack', 'curse'], 0, '#9cf', { boss: true, resist: { wind: -1 }, material: 'fire_shard' }),
  M('zeromus', 'ゼロムス', 'boss', 'attacker', { hp: 18, str: 1.6, mag: 1.9, vit: 1.5, spr: 1.5 }, ['megaflare', 'dark_flare', 'curse'], 0, '#415', { boss: true, resist: { dark: 0 }, material: 'phoenix_feather' }),
  M('gilgamesh', 'ギルガメッシュ', 'boss', 'attacker', { hp: 12, str: 1.8, vit: 1.5, spd: 1.3 }, ['brave_slash_m', 'quake_stomp', 'meteor_strike'], 0, '#c66', { boss: true, material: 'orichalcum' }),
  M('atomos', 'アトモス', 'demon', 'jammer', { hp: 10, mag: 1.7 }, ['gravija', 'laser'], 0, '#335', { boss: true, material: 'fire_shard' }),
  M('catoblepas', 'カトブレパス', 'beast', 'jammer', { hp: 9, str: 1.4 }, ['stone_gaze', 'quake_stomp'], 0, '#654', { boss: true, material: 'fire_shard' }),
  M('exdeath', 'エクスデス', 'boss', 'attacker', { hp: 20, str: 1.7, mag: 2.0, vit: 1.6, spr: 1.6 }, ['ultima_blast', 'dark_flare', 'curse', 'self_heal'], 0, '#236', { boss: true, resist: { dark: 0 }, material: 'phoenix_feather' }),
  M('goddess', '女神', 'boss', 'jammer', { hp: 10, mag: 1.8, spd: 1.3 }, ['holy_light', 'thunder_breath', 'sleep_gas'], 0, '#fef', { boss: true, resist: { holy: 0 }, material: 'fire_shard' }),
  M('fiend', '鬼神', 'boss', 'attacker', { hp: 11, str: 1.9, vit: 1.5 }, ['meteor_strike', 'quake_stomp', 'ice_breath'], 0, '#a33', { boss: true, material: 'fire_shard' }),
  M('demon_god', '魔神', 'boss', 'attacker', { hp: 11, str: 1.6, mag: 1.8 }, ['megaflare', 'dark_flare'], 0, '#633', { boss: true, material: 'fire_shard' }),
  M('kefka', 'ケフカ', 'boss', 'attacker', { hp: 22, str: 1.6, mag: 2.2, vit: 1.6, spr: 1.8, spd: 1.3 }, ['heartless_angel', 'holy_light', 'ultima_blast', 'megaflare'], 0, '#eda', { boss: true, resist: { holy: 0.5 }, material: 'phoenix_feather' }),
  M('jenova', 'ジェノバ', 'boss', 'jammer', { hp: 12, mag: 1.9, spd: 1.2 }, ['laser', 'curse', 'tidal_wave', 'self_heal'], 0, '#8cc', { boss: true, material: 'fire_shard' }),
  M('rufus_mecha', 'プラウドクラッド改', 'machine', 'blocker', { hp: 12, str: 1.7, vit: 2.2 }, ['laser', 'mighty_guard', 'megaflare'], 0, '#99b', { boss: true, resist: { thunder: 2, poison: 0 }, material: 'fire_shard' }),
  M('sephiroth', 'セフィロス', 'boss', 'attacker', { hp: 24, str: 2.2, mag: 2.0, vit: 1.6, spr: 1.6, spd: 1.5 }, ['brave_slash_m', 'heartless_angel', 'megaflare', 'dark_flare'], 0, '#ccc', { boss: true, material: 'phoenix_feather' }),
  M('tiamat', 'ティアマット', 'dragon', 'attacker', { hp: 12, str: 1.7, mag: 1.7 }, ['flame', 'ice_breath', 'thunder_breath', 'megaflare'], 0, '#a4a', { boss: true, material: 'dragon_fang' }),
  M('sphinxara', 'スフィンクサラ', 'demon', 'jammer', { hp: 11, mag: 1.8 }, ['sleep_gas', 'laser', 'curse'], 0, '#dc8', { boss: true, material: 'fire_shard' }),
  M('ultimecia', 'アルティミシア', 'boss', 'jammer', { hp: 26, mag: 2.3, spr: 1.8, vit: 1.5, spd: 1.4 }, ['gravija', 'ultima_blast', 'curse', 'dark_flare'], 0, '#a3a', { boss: true, material: 'phoenix_feather' }),
  M('soulcage', 'ソウルケージ', 'undead', 'jammer', { hp: 11, mag: 1.9 }, ['curse', 'dark_flare', 'self_heal'], 0, '#a86', { boss: true, resist: { holy: 2, fire: 2, dark: -1 }, material: 'fire_shard' }),
  M('kuja', 'クジャ', 'boss', 'attacker', { hp: 28, mag: 2.4, str: 1.5, spr: 1.8, spd: 1.5 }, ['ultima_blast', 'flame', 'ice_breath', 'thunder_breath', 'holy_light'], 0, '#ddd', { boss: true, material: 'phoenix_feather' }),
  M('yunalesca', 'ユウナレスカ', 'boss', 'jammer', { hp: 14, mag: 2.0, spd: 1.3 }, ['curse', 'heartless_angel', 'holy_light', 'self_heal'], 0, '#fcd', { boss: true, material: 'fire_shard' }),
  M('seymour', 'シーモア', 'boss', 'attacker', { hp: 13, mag: 2.0 }, ['flame', 'ice_breath', 'thunder_breath', 'dark_flare'], 0, '#68c', { boss: true, material: 'fire_shard' }),
  M('sin', 'シン', 'boss', 'attacker', { hp: 34, str: 2.2, mag: 2.4, vit: 2.0, spr: 2.0, spd: 1.2 }, ['gravija', 'tidal_wave', 'megaflare', 'ultima_blast'], 0, '#224', { boss: true, material: 'phoenix_feather' }),
);
// 超ボス
add(
  M('omega', 'オメガ', 'machine', 'attacker', { hp: 14, str: 2.0, vit: 1.6, mag: 2.0, spr: 1.6, spd: 1.5 }, ['laser', 'megaflare', 'ultima_blast', 'mighty_guard', 'blaster'], 0, '#ddd', { boss: true, resist: { thunder: 2, fire: 0.5, ice: 0.5, poison: 0, dark: 0.5, holy: 0.5 }, material: 'orichalcum' }),
  M('shinryu', '神竜', 'dragon', 'attacker', { hp: 16, str: 2.2, vit: 1.6, mag: 2.2, spr: 1.6, spd: 1.5 }, ['tidal_wave', 'ice_breath', 'thunder_breath', 'megaflare', 'curse', 'self_heal'], 0, '#9ef', { boss: true, resist: { water: -1, holy: 2 }, material: 'dragon_fang' }),
  M('ultima_weapon_true', 'アルテマウェポン（真）', 'machine', 'attacker', { hp: 12, str: 2.4, vit: 1.5, mag: 2.0, spd: 1.4 }, ['laser', 'meteor_strike', 'ultima_blast', 'gravija'], 0, '#aaf', { boss: true, resist: { poison: 0 }, material: 'orichalcum' }),
);
export const SUPER_BOSSES: { id: string; name: string; scale: number; cond: string; rewardText: string }[] = [
  { id: 'omega', name: 'オメガ', scale: 1000, cond: '1000階到達', rewardText: 'アルテマ装備確定＋TP100＋裏タワー解放。召喚獣：アレクサンダー（1回目）／フェンリル（3回目）／アーク（5回目）' },
  { id: 'ultima_weapon_true', name: 'アルテマウェポン（真）', scale: 1300, cond: '転生10回', rewardText: 'アルテマ装備確定＋TP150。召喚獣：ディアボロス（1回目）／シルドラ（3回目）／ナイツオブラウンド（5回目）' },
  { id: 'shinryu', name: '神竜', scale: 1600, cond: '裏タワー地下100階到達', rewardText: 'アルテマ装備確定＋TP200＋転生ボードの全上限+10。召喚獣：カトブレパス（1回目）／ハーデス（3回目）／クルセイダー（5回目）' },
];
export function chaosPool(): string[] {
  const set = new Set<string>();
  for (const a of AREAS) for (const sub of a.subs) for (const m of sub.pool) set.add(m);
  return [...set];
}
export function allMidBosses(): string[] { return [...new Set(AREAS.flatMap(a => a.midBosses))]; }
export function allAreaBosses(): string[] { return AREAS.map(a => a.boss); }
export function monster(id: string): MonsterDef { const m = MONSTERS[id]; if (!m) throw new Error('unknown monster ' + id); return m; }

// ---- バッチ7：後半エリアの新規モンスター（art/batch7_data.py で生成）
import { BATCH7 } from './batch7';
for (const n of BATCH7) MONSTERS[n.id] = { id: n.id, name: n.name, family: n.family, role: n.role as MonsterDef['role'], mult: n.mult as MonsterDef['mult'], skills: n.skills, captureRate: n.captureRate, color: n.color, material: n.material, ...(n.resist ? { resist: n.resist as MonsterDef['resist'] } : {}) };

// ---- 色違い・上位種（art/variants.py で生成。基礎種より一回り強く、技が1つ多い）
import { VARIANTS } from './variants';
for (const v of VARIANTS) {
  const b = MONSTERS[v.base]; if (!b) continue;
  const mult: MonsterDef['mult'] = { ...b.mult };
  for (const k of Object.keys(mult) as (keyof typeof mult)[]) mult[k] = Math.round((mult[k] ?? 1) * 1.15 * 100) / 100;
  for (const [k, f] of Object.entries(v.mult)) (mult as any)[k] = Math.round(((mult as any)[k] ?? 1) * f * 100) / 100;
  MONSTERS[v.id] = { ...b, id: v.id, name: v.name, mult, skills: [...b.skills, v.skill].filter((x, i, a) => a.indexOf(x) === i), resist: v.resist ? { ...(b.resist ?? {}), ...(v.resist as any) } : b.resist, captureRate: Math.round(b.captureRate * 0.8 * 100) / 100, evolveTo: undefined, color: b.color };
}
export const VARIANT_OF: Record<string, string> = Object.fromEntries(VARIANTS.map(v => [v.id, v.base]));

export const AREAS: AreaDef[] = [
  {
    id: 1, name: 'コーネリア', motif: 'FF1', floors: [1, 100],
    subs: [
      { floors: [1, 25], pool: ['goblin', 'wolf', 'bomb', 'pudding'] },
      { floors: [26, 50], pool: ['goblin', 'wolf', 'bomb', 'skeleton', 'sahagin', 'chocobo'] },
      { floors: [51, 75], pool: ['black_goblin', 'skeleton', 'zombie', 'lamia', 'pudding', 'cactuar'] },
      { floors: [76, 100], pool: ['zombie', 'lamia', 'coeurl', 'mindflayer', 'tonberry', 'malboro', 'unicorn'] },
    ],
    midBosses: ['goblin_prince', 'bomb_king', 'lich'],
    boss: 'garland',
    itemPool: ['broadsword', 'mithril_sword', 'flametongue', 'dagger', 'mithril_knife', 'spear', 'battle_axe', 'kaiser_knuckle', 'staff', 'healing_staff', 'rod', 'fire_rod', 'whip', 'great_bow',
      'buckler', 'mithril_shield', 'leather_cap', 'bronze_helm', 'mithril_helm', 'triangle_hat', 'leather_armor', 'bronze_armor', 'mithril_armor', 'power_ring', 'guard_ring', 'star_pendant', 'thief_glove', 'gil_charm'],
    key: 'fire_shard',
  },
  {
    id: 2, name: 'パラメキア', motif: 'FF2', floors: [101, 200],
    subs: [
      { floors: [101, 150], pool: ['black_goblin', 'sahagin', 'coeurl', 'adamantoise', 'lamia', 'unicorn'] },
      { floors: [151, 200], pool: ['malboro', 'tonberry', 'red_dragon', 'mindflayer', 'silver_wolf', 'flan', 'grenade'] },
    ],
    midBosses: ['bomb_king', 'lich', 'goblin_prince'],
    boss: 'garland',
    itemPool: ['ice_brand', 'blood_sword', 'main_gauche', 'mithril_spear', 'flame_shield', 'green_beret', 'white_robe', 'black_robe', 'ninja_garb', 'hermes_shoes', 'ribbon', 'exp_egg', 'mithril_sword', 'mithril_armor', 'mithril_helm'],
    key: 'fire_shard',
  },
  {
    id: 3, name: '浮遊大陸', motif: 'FF3', floors: [201, 300],
    subs: [{ floors: [201, 250], pool: ['gargoyle', 'griffin', 'lamia_queen', 'medusa', 'flan', 'silver_wolf', 'magic_pot'] }, { floors: [251, 300], pool: ['dragon_zombie', 'vampire', 'hecatoncheir', 'medusa', 'griffin', 'malboro', 'magic_pot'] }],
    midBosses: ['garuda', 'kraken', 'titan_boss'], boss: 'cloud_of_darkness',
    itemPool: ['ashura', 'dragon_claw', 'sage_staff', 'diamond_shield', 'diamond_helm', 'diamond_armor', 'elven_cloak', 'ice_brand', 'blood_sword', 'main_gauche', 'white_robe', 'black_robe', 'hermes_shoes', 'exp_egg', 'protect_ring'],
    key: 'fire_shard',
  },
  {
    id: 4, name: '月', motif: 'FF4', floors: [301, 400],
    subs: [{ floors: [301, 350], pool: ['magitek_armor', 'proto_armor', 'behemoth', 'blue_dragon', 'moon_flayer', 'gargoyle'] }, { floors: [351, 400], pool: ['guardian', 'king_behemoth', 'yellow_dragon', 'blue_dragon', 'moon_flayer', 'proto_armor', 'red_dragon'] }],
    midBosses: ['scarmiglione', 'cagnazzo', 'barbariccia'], boss: 'zeromus',
    itemPool: ['excalibur', 'holy_lance', 'wizard_rod', 'crystal_shield', 'crystal_helm', 'crystal_mail', 'crystal_ring', 'lunar_curtain', 'ashura', 'dragon_claw', 'sage_staff', 'diamond_armor', 'ribbon', 'protect_ring'],
    key: 'fire_shard',
  },
  {
    id: 5, name: '次元の狭間', motif: 'FF5', floors: [401, 500],
    subs: [{ floors: [401, 450], pool: ['great_malboro', 'ahriman', 'jabotender', 'iron_giant', 'tonberry', 'coeurl', 'magic_pot'] }, { floors: [451, 500], pool: ['tonberry_king', 'deathgaze', 'iron_giant', 'shinryu_whelp', 'ahriman', 'great_malboro'] }],
    midBosses: ['atomos', 'catoblepas', 'gilgamesh'], boss: 'exdeath',
    itemPool: ['brave_blade', 'chicken_knife', 'fuma_shuriken', 'rune_blade', 'assassin_dagger', 'genji_shield', 'genji_helm', 'genji_armor', 'genji_glove', 'excalibur', 'holy_lance', 'wizard_rod', 'crystal_mail', 'mirage_vest'],
    key: 'orichalcum',
  },
  {
    id: 6, name: '瓦礫の世界', motif: 'FF6', floors: [501, 600],
    subs: [{ floors: [501, 550], pool: ['magitek_armor2', 'tyrannosaur', 'cherry', 'doom_dragon', 'deathgaze', 'iron_giant'] }, { floors: [551, 600], pool: ['brachiosaur', 'ultima_weapon_lesser', 'tyrannosaur', 'doom_dragon', 'cherry', 'king_behemoth'] }],
    midBosses: ['goddess', 'fiend', 'demon_god'], boss: 'kefka',
    itemPool: ['ragnarok', 'illumina', 'atma_weapon', 'force_shield', 'oath_veil', 'force_armor', 'minerva', 'genji_glove', 'ribbon', 'brave_blade', 'rune_blade', 'genji_armor', 'hero_ring', 'exp_egg'],
    key: 'fire_shard',
  },
  {
    id: 7, name: 'ミッドガル', motif: 'FF7', floors: [601, 700],
    subs: [{ floors: [601, 650], pool: ['soldier', 'guard_hound', 'sweeper', 'ghost_ship', 'magitek_armor2'] }, { floors: [651, 700], pool: ['midgar_zolom', 'proud_clod', 'soldier', 'ghost_ship', 'tyrannosaur', 'sweeper'] }],
    midBosses: ['jenova', 'rufus_mecha', 'gilgamesh'], boss: 'sephiroth',
    itemPool: ['buster_sword', 'masamune', 'premium_heart', 'ziedrich', 'mystile', 'escort_guard', 'ribbon', 'ragnarok', 'force_armor', 'hero_ring', 'tetra_elemental', 'minerva'],
    key: 'fire_shard',
  },
  {
    id: 8, name: 'アルティミシア城', motif: 'FF8', floors: [701, 800],
    subs: [{ floors: [701, 750], pool: ['grendel', 'torama', 'imp8', 'malboro_worst', 'iron_giant2'] }, { floors: [751, 800], pool: ['ruby_dragon', 'iron_giant2', 'malboro_worst', 'torama', 'behemoth9'] }],
    midBosses: ['tiamat', 'sphinxara', 'catoblepas'], boss: 'ultimecia',
    itemPool: ['lionheart', 'strange_vision', 'exeter', 'ribbon', 'buster_sword', 'masamune', 'ziedrich', 'mystile', 'tetra_elemental', 'force_shield', 'oath_veil', 'hero_ring'],
    key: 'fire_shard',
  },
  {
    id: 9, name: 'テラ', motif: 'FF9', floors: [801, 900],
    subs: [{ floors: [801, 850], pool: ['yan', 'ring_leader', 'gargant', 'mover', 'behemoth9'] }, { floors: [851, 900], pool: ['nova_dragon_whelp', 'yan', 'ring_leader', 'mover', 'ruby_dragon', 'behemoth9'] }],
    midBosses: ['soulcage', 'tiamat', 'gilgamesh'], boss: 'kuja',
    itemPool: ['ultima_sword', 'excalibur2', 'tiger_fangs', 'protect_ring', 'ribbon', 'lionheart', 'strange_vision', 'exeter', 'robe_of_lords', 'grand_armor', 'genji_helm', 'hero_ring'],
    key: 'fire_shard',
  },
  {
    id: 10, name: 'ザナルカンド', motif: 'FF10', floors: [901, 1000],
    subs: [{ floors: [901, 950], pool: ['sinscale', 'varuna', 'great_malboro10', 'adamantoise10', 'nova_dragon_whelp'] }, { floors: [951, 1000], pool: ['behemoth_king10', 'fafnir', 'varuna', 'great_malboro10', 'adamantoise10', 'sinscale'] }],
    midBosses: ['seymour', 'yunalesca', 'gilgamesh'], boss: 'sin',
    itemPool: ['caladbolg', 'nirvana', 'spirit_lance', 'masamune10', 'onion_knight_w', 'genji_shield', 'ribbon', 'ultima_sword', 'robe_of_lords', 'grand_armor', 'hero_ring', 'tetra_elemental', 'exp_egg'],
    key: 'orichalcum',
  },
];
// ---- 25階ごとの敵テーブル：エリアの出現順に色違いを差し込み、4つの帯に分けて少しずつ入れ替える
function expandBands(area: AreaDef): void {
  const seq: string[] = [];
  for (const sub of area.subs) for (const m of sub.pool) if (!seq.includes(m)) seq.push(m);
  for (const v of VARIANTS) { const bi = seq.indexOf(v.base); if (bi < 0 || seq.includes(v.id)) continue; seq.splice(Math.min(seq.length, bi + 3), 0, v.id); }
  const n = seq.length, win = Math.max(5, Math.ceil(n * 0.4));
  const starts = [0, Math.round(n * 0.2), Math.round(n * 0.4), Math.max(0, n - win)];
  const f0 = area.floors[0], len = Math.round((area.floors[1] - area.floors[0] + 1) / 4);
  area.subs = starts.map((st, k) => ({ floors: [f0 + k * len, k === 3 ? area.floors[1] : f0 + (k + 1) * len - 1] as [number, number], pool: seq.slice(st, st + win) }));
}
import { ITEMS2 } from './items2';
for (const a of AREAS) {
  for (const it of ITEMS2) if ((it.area === a.id || it.area === a.id - 1) && !a.itemPool.includes(it.id)) a.itemPool.push(it.id);
  const mine = BATCH7.filter(n => n.area === a.id);
  mine.forEach((n, i) => { const sub = a.subs[Math.min(a.subs.length - 1, Math.floor(i * a.subs.length / Math.max(1, mine.length)))]; if (!sub.pool.includes(n.id)) sub.pool.push(n.id); });
  expandBands(a);
}

/** 風水士「ちけい」用：階層の属性 */
export function areaElement(floor: number): Element {
  const table: Element[] = ['earth', 'fire', 'wind', 'holy', 'dark', 'poison', 'thunder', 'ice', 'dark', 'water'];
  return table[(areaFor(floor).id - 1) % table.length];
}
export function areaFor(floor: number): AreaDef {
  return AREAS.find(a => floor >= a.floors[0] && floor <= a.floors[1]) ?? AREAS[AREAS.length - 1];
}

export const LAWS: LawDef[] = [
  { id: 'no_item', name: 'アイテム禁止／盗む推奨', forbid: 'item', favor: 'steal' },
  { id: 'no_magic', name: '魔法禁止／弱点攻撃推奨', forbid: 'magic', favor: 'weak' },
  { id: 'no_phys', name: '物理禁止／捕獲推奨', forbid: 'physical', favor: 'capture' },
  { id: 'no_fire', name: '炎禁止／リミット推奨', forbid: 'fire', favor: 'limit' },
  { id: 'no_heal', name: '回復禁止／防御推奨', forbid: 'heal', favor: 'defend' },
  { id: 'no_item2', name: 'アイテム禁止／リミット推奨', forbid: 'item', favor: 'limit' },
  { id: 'no_flee', name: '逃走禁止／弱点攻撃推奨', forbid: 'flee', favor: 'weak' },
  { id: 'no_status', name: '状態異常禁止／捕獲推奨', forbid: 'status', favor: 'capture' },
];
export const LAW_TAG_JP: Record<string, string> = {
  item: 'アイテム', magic: '魔法', physical: '物理攻撃', fire: '炎属性', heal: '回復', monster: '仲間モンスター', flee: '逃走', status: '状態異常付与',
  steal: '盗む', capture: '捕獲', weak: '弱点攻撃', limit: 'リミット技', defend: '防御',
};
