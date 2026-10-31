// 自動生成：art/variants.py（色違い・上位種）
export interface VariantDef { base: string; id: string; name: string; skill: string; resist: Record<string, number> | null; mult: Record<string, number>; hue: number }
export const VARIANTS: VariantDef[] = [
{
"base": "goblin",
"id": "goblin_guard",
"name": "ゴブリンガード",
"skill": "shell_guard",
"resist": null,
"mult": {
"vit": 1.4
},
"hue": 200
},
{
"base": "wolf",
"id": "warg",
"name": "ワーグ",
"skill": "blind_dust",
"resist": null,
"mult": {
"str": 1.15
},
"hue": 30
},
{
"base": "bomb",
"id": "balloon",
"name": "バルーン",
"skill": "self_destruct",
"resist": {
"fire": -1,
"wind": 2
},
"mult": {
"spd": 1.3
},
"hue": 60
},
{
"base": "skeleton",
"id": "bone_knight",
"name": "ボーンナイト",
"skill": "brave_slash_m",
"resist": {
"holy": 2,
"dark": -1
},
"mult": {
"str": 1.3,
"vit": 1.3
},
"hue": 210
},
{
"base": "pudding",
"id": "yellow_jelly",
"name": "ブルージェリー",
"skill": "thunder_breath",
"resist": {
"thunder": -1,
"earth": 2
},
"mult": {
"mag": 1.3
},
"hue": 200
},
{
"base": "sahagin",
"id": "sahagin_chief",
"name": "サハギンチーフ",
"skill": "aqua_breath",
"resist": {
"water": -1,
"thunder": 2
},
"mult": {
"str": 1.2
},
"hue": 300
},
{
"base": "zombie",
"id": "ghoul",
"name": "グール",
"skill": "curse",
"resist": {
"holy": 2,
"poison": 0
},
"mult": {
"spd": 1.4
},
"hue": 90
},
{
"base": "cactuar",
"id": "gigantuar",
"name": "ギガンタウアー",
"skill": "needles",
"resist": null,
"mult": {
"hp": 2.5,
"str": 1.3
},
"hue": 25
},
{
"base": "coeurl",
"id": "coeurl_cat",
"name": "クアールキャット",
"skill": "blaster",
"resist": null,
"mult": {
"spd": 1.2
},
"hue": 180
},
{
"base": "tonberry",
"id": "master_tonberry",
"name": "マスタートンベリ",
"skill": "grudge",
"resist": null,
"mult": {
"hp": 1.8,
"str": 1.3
},
"hue": 210
},
{
"base": "unicorn",
"id": "nightmare",
"name": "ナイトメア",
"skill": "dark_wave",
"resist": {
"dark": -1,
"holy": 2
},
"mult": {
"mag": 1.3
},
"hue": 180
},
{
"base": "chocobo",
"id": "red_chocobo",
"name": "赤チョコボ",
"skill": "quake_stomp",
"resist": null,
"mult": {
"str": 1.3
},
"hue": 330
},
{
"base": "adamantoise",
"id": "land_turtle",
"name": "ランドタートル",
"skill": "quake_stomp",
"resist": {
"earth": 0
},
"mult": {
"vit": 1.3
},
"hue": 100
},
{
"base": "flan",
"id": "black_flan",
"name": "ブラックフラン",
"skill": "dark_wave",
"resist": {
"dark": -1,
"holy": 2
},
"mult": {
"mag": 1.3
},
"hue": 0
},
{
"base": "silver_wolf",
"id": "fenrir",
"name": "フェンリル",
"skill": "ice_breath",
"resist": {
"ice": -1,
"fire": 2
},
"mult": {
"str": 1.25,
"spd": 1.1
},
"hue": 210
},
{
"base": "black_goblin",
"id": "goblin_mage",
"name": "ゴブリンメイジ",
"skill": "mind_blast",
"resist": null,
"mult": {
"mag": 1.8
},
"hue": 260
},
{
"base": "lamia",
"id": "lamia_dancer",
"name": "ラミアダンサー",
"skill": "sleep_gas",
"resist": null,
"mult": {
"spd": 1.3
},
"hue": 60
},
{
"base": "mindflayer",
"id": "piscodemon",
"name": "ピスコディーモン",
"skill": "curse",
"resist": {
"water": 0.5
},
"mult": {
"mag": 1.3
},
"hue": 120
},
{
"base": "malboro",
"id": "malboro_bud",
"name": "モルボルの芽",
"skill": "poison_breath",
"resist": {
"poison": 0
},
"mult": {
"hp": 0.8,
"spd": 1.3
},
"hue": 60
},
{
"base": "gargoyle",
"id": "gargoyle_lord",
"name": "ガーゴイルロード",
"skill": "stone_gaze",
"resist": {
"earth": 0,
"wind": 0.5
},
"mult": {
"str": 1.3
},
"hue": 40
},
{
"base": "griffin",
"id": "hippogriff",
"name": "ヒポグリフ",
"skill": "blind_dust",
"resist": null,
"mult": {
"spd": 1.3
},
"hue": 150
},
{
"base": "medusa",
"id": "gorgon",
"name": "ゴーゴン",
"skill": "curse",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 280
},
{
"base": "vampire",
"id": "vampire_lord",
"name": "ヴァンパイアロード",
"skill": "dark_flare",
"resist": {
"holy": 2,
"dark": -1
},
"mult": {
"mag": 1.4
},
"hue": 220
},
{
"base": "hecatoncheir",
"id": "gigas",
"name": "ギガース",
"skill": "quake_stomp",
"resist": null,
"mult": {
"str": 1.3
},
"hue": 120
},
{
"base": "dragon_zombie",
"id": "bone_dragon",
"name": "ボーンドラゴン",
"skill": "ice_breath",
"resist": {
"holy": 2,
"ice": 0.5,
"poison": 0
},
"mult": {
"vit": 1.3
},
"hue": 180
},
{
"base": "lamia_queen",
"id": "lamia_empress",
"name": "ラミアエンプレス",
"skill": "silence_song",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 150
},
{
"base": "magitek_armor",
"id": "armored_weapon",
"name": "アーマードウェポン",
"skill": "laser",
"resist": {
"thunder": 2,
"poison": 0
},
"mult": {
"str": 1.3
},
"hue": 120
},
{
"base": "proto_armor",
"id": "crusher",
"name": "クラッシャー",
"skill": "quake_stomp",
"resist": {
"thunder": 2,
"poison": 0
},
"mult": {
"str": 1.35
},
"hue": 300
},
{
"base": "behemoth",
"id": "dark_behemoth",
"name": "ダークベヒーモス",
"skill": "dark_flare",
"resist": {
"dark": -1
},
"mult": {
"mag": 1.4
},
"hue": 180
},
{
"base": "blue_dragon",
"id": "ice_dragon",
"name": "アイスドラゴン",
"skill": "ice_breath",
"resist": {
"ice": -1,
"fire": 2
},
"mult": {
"mag": 1.3
},
"hue": 30
},
{
"base": "yellow_dragon",
"id": "green_dragon",
"name": "グリーンドラゴン",
"skill": "poison_breath",
"resist": {
"poison": 0,
"wind": 0.5
},
"mult": {
"vit": 1.2
},
"hue": 60
},
{
"base": "guardian",
"id": "sentinel",
"name": "センチネル",
"skill": "mighty_guard",
"resist": {
"thunder": 2,
"poison": 0
},
"mult": {
"vit": 1.3
},
"hue": 200
},
{
"base": "moon_flayer",
"id": "lunar_sage",
"name": "ルナセージ",
"skill": "holy_light",
"resist": {
"holy": 0.5
},
"mult": {
"mag": 1.3
},
"hue": 100
},
{
"base": "ahriman",
"id": "evil_eye",
"name": "イビルアイ",
"skill": "stone_gaze",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 140
},
{
"base": "iron_giant",
"id": "mithril_golem",
"name": "ミスリルゴーレム",
"skill": "mighty_guard",
"resist": {
"thunder": 2
},
"mult": {
"vit": 1.4
},
"hue": 190
},
{
"base": "great_malboro",
"id": "oscar",
"name": "オスカー",
"skill": "sleep_gas",
"resist": {
"poison": 0
},
"mult": {
"hp": 1.3
},
"hue": 90
},
{
"base": "jabotender",
"id": "jumbo_cactuar",
"name": "ジャンボサボテン",
"skill": "needles",
"resist": null,
"mult": {
"hp": 2.0
},
"hue": 300
},
{
"base": "deathgaze",
"id": "doom_gaze",
"name": "ドゥームゲイズ",
"skill": "gravija",
"resist": {
"dark": -1
},
"mult": {
"mag": 1.3
},
"hue": 200
},
{
"base": "tyrannosaur",
"id": "allosaurus",
"name": "アロサウルス",
"skill": "bite",
"resist": null,
"mult": {
"spd": 1.3
},
"hue": 150
},
{
"base": "doom_dragon",
"id": "skull_dragon",
"name": "スカルドラゴン",
"skill": "poison_breath",
"resist": {
"holy": 2,
"poison": 0
},
"mult": {
"vit": 1.3
},
"hue": 200
},
{
"base": "brachiosaur",
"id": "brachio_rex",
"name": "ブラキオレックス",
"skill": "meteor_strike",
"resist": null,
"mult": {
"hp": 1.4
},
"hue": 320
},
{
"base": "cherry",
"id": "cherry_blossom",
"name": "サクラ",
"skill": "silence_song",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 300
},
{
"base": "soldier",
"id": "soldier_2nd",
"name": "ソルジャー2nd",
"skill": "brave_slash_m",
"resist": null,
"mult": {
"str": 1.3
},
"hue": 120
},
{
"base": "guard_hound",
"id": "dark_nation",
"name": "ダークネイション",
"skill": "shell_guard",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 200
},
{
"base": "sweeper",
"id": "custom_sweeper",
"name": "カスタムスイーパー",
"skill": "laser",
"resist": {
"thunder": 2
},
"mult": {
"str": 1.3
},
"hue": 300
},
{
"base": "midgar_zolom",
"id": "sea_worm",
"name": "シーワーム",
"skill": "tidal_wave",
"resist": {
"water": -1,
"thunder": 2
},
"mult": {
"hp": 1.3
},
"hue": 150
},
{
"base": "ghost_ship",
"id": "phantom_ship",
"name": "ファントムシップ",
"skill": "curse",
"resist": {
"holy": 2,
"dark": -1
},
"mult": {
"mag": 1.3
},
"hue": 240
},
{
"base": "grendel",
"id": "anacondaur",
"name": "アナコンダウル",
"skill": "poison_breath",
"resist": {
"poison": 0
},
"mult": {
"str": 1.2
},
"hue": 120
},
{
"base": "imp8",
"id": "gayla",
"name": "ゲイラ",
"skill": "thunder_breath",
"resist": {
"thunder": -1
},
"mult": {
"spd": 1.3
},
"hue": 120
},
{
"base": "ruby_dragon",
"id": "hexadragon",
"name": "ヘキサドラゴン",
"skill": "poison_breath",
"resist": {
"poison": 0,
"fire": 0.5
},
"mult": {
"str": 1.3
},
"hue": 120
},
{
"base": "iron_giant2",
"id": "iron_giant_mk2",
"name": "アイアンジャイアント改",
"skill": "brave_slash_m",
"resist": null,
"mult": {
"str": 1.3,
"vit": 1.2
},
"hue": 60
},
{
"base": "torama",
"id": "torama_lord",
"name": "トラマロード",
"skill": "blaster",
"resist": null,
"mult": {
"mag": 1.3
},
"hue": 280
},
{
"base": "ring_leader",
"id": "amdusias",
"name": "アムドゥスキアス",
"skill": "thunder_breath",
"resist": {
"thunder": -1
},
"mult": {
"mag": 1.3
},
"hue": 250
},
{
"base": "gargant",
"id": "gargant_queen",
"name": "ガルガント女王",
"skill": "poison_breath",
"resist": {
"poison": 0
},
"mult": {
"hp": 1.4
},
"hue": 320
},
{
"base": "mover",
"id": "mover_x",
"name": "ムーバーX",
"skill": "self_destruct",
"resist": null,
"mult": {
"spd": 1.4
},
"hue": 120
},
{
"base": "yan",
"id": "yan_lord",
"name": "ヤーンロード",
"skill": "mighty_guard",
"resist": null,
"mult": {
"hp": 1.5,
"vit": 1.3
},
"hue": 180
},
{
"base": "sinscale",
"id": "sinspawn",
"name": "シンスポーン",
"skill": "aqua_breath",
"resist": {
"water": 0.5
},
"mult": {
"str": 1.3
},
"hue": 180
},
{
"base": "fafnir",
"id": "nidhogg",
"name": "ニーズヘッグ",
"skill": "dark_flare",
"resist": {
"dark": -1,
"holy": 2
},
"mult": {
"mag": 1.4
},
"hue": 200
},
{
"base": "great_malboro10",
"id": "malboro_menace",
"name": "モルボルメナス",
"skill": "bad_breath",
"resist": {
"poison": 0
},
"mult": {
"hp": 1.4
},
"hue": 90
},
{
"base": "varuna",
"id": "vidatu",
"name": "ヴィダトゥ",
"skill": "holy_light",
"resist": {
"holy": 0.5
},
"mult": {
"mag": 1.3
},
"hue": 120
},
{
"base": "nova_dragon_whelp",
"id": "nova_dragon",
"name": "ノヴァドラゴン",
"skill": "megaflare",
"resist": null,
"mult": {
"hp": 1.6,
"str": 1.3
},
"hue": 40
}
];
