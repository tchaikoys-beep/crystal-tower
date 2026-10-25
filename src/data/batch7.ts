// 自動生成：art/batch7_data.py（後半エリアの新規モンスター）
export interface NewMonster { id: string; name: string; area: number; family: string; role: string; mult: Record<string, number>; skills: string[]; captureRate: number; color: string; resist: Record<string, number> | null; material: string }
export const BATCH7: NewMonster[] = [
{
"id": "necrophobe",
"name": "ネクロフォビア",
"area": 5,
"family": "demon",
"role": "jammer",
"mult": {
"hp": 1.6,
"mag": 1.5,
"spr": 1.4
},
"skills": [
"holy_light",
"dark_flare",
"mighty_guard"
],
"captureRate": 0.08,
"color": "#dcd",
"resist": {
"holy": 0.5,
"dark": 0.5
},
"material": "magicite"
},
{
"id": "crystal_dragon",
"name": "クリスタルドラゴン",
"area": 5,
"family": "dragon",
"role": "attacker",
"mult": {
"hp": 2.4,
"str": 1.6,
"vit": 1.5,
"mag": 1.3
},
"skills": [
"ice_breath",
"holy_light",
"megaflare"
],
"captureRate": 0.06,
"color": "#9ef",
"resist": {
"ice": 0.5,
"holy": 0.5
},
"material": "dragon_fang"
},
{
"id": "belphegor",
"name": "ベルフェゴール",
"area": 5,
"family": "demon",
"role": "jammer",
"mult": {
"hp": 1.3,
"mag": 1.4,
"spd": 1.2
},
"skills": [
"sleep_gas",
"curse",
"thunder_breath"
],
"captureRate": 0.15,
"color": "#a6c",
"resist": null,
"material": "fire_shard"
},
{
"id": "land_crawler",
"name": "ランドクローラー",
"area": 5,
"family": "beast",
"role": "blocker",
"mult": {
"hp": 2.6,
"str": 1.3,
"vit": 1.8,
"spd": 0.5
},
"skills": [
"quake_stomp",
"shell_guard",
"poison_breath"
],
"captureRate": 0.15,
"color": "#a85",
"resist": {
"earth": 0
},
"material": "dragon_fang"
},
{
"id": "cerberus",
"name": "ケルベロス",
"area": 5,
"family": "beast",
"role": "attacker",
"mult": {
"hp": 1.6,
"str": 1.5,
"spd": 1.4
},
"skills": [
"bite",
"flame",
"bad_breath"
],
"captureRate": 0.12,
"color": "#633",
"resist": {
"fire": 0.5
},
"material": "wolf_fang"
},
{
"id": "mold_wind",
"name": "モールドウインド",
"area": 5,
"family": "plant",
"role": "jammer",
"mult": {
"hp": 1.4,
"mag": 1.3,
"spd": 1.1
},
"skills": [
"poison_breath",
"silence_song",
"sleep_gas"
],
"captureRate": 0.2,
"color": "#8a5",
"resist": {
"poison": 0,
"fire": 2
},
"material": "slime_jelly"
},
{
"id": "land_worm",
"name": "ランドウォーム",
"area": 6,
"family": "beast",
"role": "blocker",
"mult": {
"hp": 3.0,
"str": 1.5,
"vit": 1.6,
"spd": 0.5
},
"skills": [
"quake_stomp",
"poison_breath",
"self_heal"
],
"captureRate": 0.1,
"color": "#875",
"resist": {
"earth": 0
},
"material": "dragon_fang"
},
{
"id": "gigantos",
"name": "ギガントス",
"area": 6,
"family": "giant",
"role": "attacker",
"mult": {
"hp": 2.8,
"str": 1.9,
"vit": 1.4,
"spd": 0.6
},
"skills": [
"brave_slash_m",
"quake_stomp",
"meteor_strike"
],
"captureRate": 0.06,
"color": "#c96",
"resist": null,
"material": "orichalcum"
},
{
"id": "outsider",
"name": "アウトサイダー",
"area": 6,
"family": "demon",
"role": "jammer",
"mult": {
"hp": 1.4,
"mag": 1.5,
"spd": 1.3
},
"skills": [
"blaster",
"dark_wave",
"stone_gaze"
],
"captureRate": 0.1,
"color": "#669",
"resist": {
"dark": 0.5,
"holy": 2
},
"material": "magicite"
},
{
"id": "holy_dragon",
"name": "ホーリードラゴン",
"area": 6,
"family": "dragon",
"role": "healer",
"mult": {
"hp": 2.2,
"mag": 1.6,
"spr": 1.6,
"spd": 1.1
},
"skills": [
"holy_light",
"white_wind",
"self_heal"
],
"captureRate": 0.05,
"color": "#fec",
"resist": {
"holy": -1,
"dark": 2
},
"material": "phoenix_feather"
},
{
"id": "critic",
"name": "クリティック",
"area": 6,
"family": "bird",
"role": "jammer",
"mult": {
"hp": 1.1,
"mag": 1.3,
"spd": 1.5
},
"skills": [
"blind_dust",
"wing_attack",
"silence_song"
],
"captureRate": 0.2,
"color": "#b84",
"resist": null,
"material": "wolf_fang"
},
{
"id": "innocent",
"name": "イノセント",
"area": 6,
"family": "undead",
"role": "jammer",
"mult": {
"hp": 1.3,
"mag": 1.4,
"spr": 1.3
},
"skills": [
"curse",
"drain_touch",
"sleep_gas"
],
"captureRate": 0.12,
"color": "#dde",
"resist": {
"holy": 2,
"dark": -1,
"poison": 0
},
"material": "phoenix_feather"
},
{
"id": "hell_house",
"name": "ヘルハウス",
"area": 7,
"family": "machine",
"role": "blocker",
"mult": {
"hp": 2.6,
"str": 1.4,
"vit": 1.7,
"spd": 0.7
},
"skills": [
"quake_stomp",
"flame",
"mighty_guard"
],
"captureRate": 0.08,
"color": "#c75",
"resist": {
"fire": 0.5
},
"material": "orichalcum"
},
{
"id": "air_buster",
"name": "エアバスター",
"area": 7,
"family": "machine",
"role": "attacker",
"mult": {
"hp": 2.0,
"str": 1.6,
"vit": 1.3,
"spd": 1.2
},
"skills": [
"laser",
"thunder_breath",
"self_destruct"
],
"captureRate": 0.08,
"color": "#99b",
"resist": {
"thunder": 2,
"poison": 0
},
"material": "orichalcum"
},
{
"id": "guard_scorpion",
"name": "ガードスコーピオン",
"area": 7,
"family": "machine",
"role": "blocker",
"mult": {
"hp": 2.8,
"str": 1.5,
"vit": 1.8,
"spd": 0.8
},
"skills": [
"laser",
"mighty_guard",
"thunder_breath"
],
"captureRate": 0.06,
"color": "#b55",
"resist": {
"thunder": 2,
"poison": 0
},
"material": "orichalcum"
},
{
"id": "hedgehog_pie",
"name": "ヘッジホッグパイ",
"area": 7,
"family": "beast",
"role": "attacker",
"mult": {
"hp": 1.0,
"str": 1.1,
"mag": 1.4,
"spd": 1.3
},
"skills": [
"flame",
"needles",
"bite"
],
"captureRate": 0.35,
"color": "#e95",
"resist": {
"fire": 0.5
},
"material": "goblin_ear"
},
{
"id": "ghost7",
"name": "ゴースト",
"area": 7,
"family": "undead",
"role": "jammer",
"mult": {
"hp": 1.1,
"mag": 1.4,
"spd": 1.3
},
"skills": [
"drain_touch",
"curse",
"blind_dust"
],
"captureRate": 0.2,
"color": "#cce",
"resist": {
"holy": 2,
"dark": -1,
"poison": 0
},
"material": "phoenix_feather"
},
{
"id": "aps",
"name": "アプス",
"area": 7,
"family": "aquatic",
"role": "blocker",
"mult": {
"hp": 2.4,
"str": 1.5,
"vit": 1.5,
"spd": 0.9
},
"skills": [
"tidal_wave",
"bite",
"aqua_breath"
],
"captureRate": 0.1,
"color": "#5a8",
"resist": {
"water": 0.5,
"fire": 2
},
"material": "slime_jelly"
},
{
"id": "tri_face",
"name": "トライフェイス",
"area": 8,
"family": "demon",
"role": "jammer",
"mult": {
"hp": 1.6,
"mag": 1.5,
"spd": 1.2
},
"skills": [
"bad_breath",
"poison_breath",
"curse"
],
"captureRate": 0.12,
"color": "#8a6",
"resist": {
"poison": 0
},
"material": "magicite"
},
{
"id": "wendigo",
"name": "ウェンディゴ",
"area": 8,
"family": "beast",
"role": "attacker",
"mult": {
"hp": 2.2,
"str": 1.8,
"vit": 1.2,
"spd": 1.0
},
"skills": [
"quake_stomp",
"brave_slash_m",
"bite"
],
"captureRate": 0.12,
"color": "#ccd",
"resist": {
"ice": 0.5
},
"material": "wolf_fang"
},
{
"id": "abyss_worm",
"name": "アビスウォーム",
"area": 8,
"family": "beast",
"role": "blocker",
"mult": {
"hp": 3.0,
"str": 1.5,
"vit": 1.6,
"spd": 0.6
},
"skills": [
"quake_stomp",
"poison_breath",
"tidal_wave"
],
"captureRate": 0.08,
"color": "#a97",
"resist": {
"earth": 0,
"water": 2
},
"material": "dragon_fang"
},
{
"id": "elnoyle",
"name": "エルノーイル",
"area": 8,
"family": "demon",
"role": "attacker",
"mult": {
"hp": 2.0,
"str": 1.6,
"mag": 1.6,
"spd": 1.2
},
"skills": [
"dark_wave",
"blaster",
"thunder_breath"
],
"captureRate": 0.06,
"color": "#448",
"resist": {
"dark": 0.5
},
"material": "magicite"
},
{
"id": "forbidden",
"name": "フォービドゥン",
"area": 8,
"family": "undead",
"role": "attacker",
"mult": {
"hp": 1.8,
"str": 1.7,
"spd": 1.1
},
"skills": [
"brave_slash_m",
"drain_touch",
"curse"
],
"captureRate": 0.1,
"color": "#bba",
"resist": {
"holy": 2,
"dark": -1,
"poison": 0
},
"material": "phoenix_feather"
},
{
"id": "blitz",
"name": "ブリッツ",
"area": 8,
"family": "elemental",
"role": "attacker",
"mult": {
"hp": 1.4,
"mag": 1.7,
"spd": 1.5
},
"skills": [
"thunder_breath",
"blaster",
"self_destruct"
],
"captureRate": 0.12,
"color": "#ff6",
"resist": {
"thunder": -1,
"earth": 2
},
"material": "fire_shard"
},
{
"id": "grand_dragon",
"name": "グランドドラゴン",
"area": 9,
"family": "dragon",
"role": "attacker",
"mult": {
"hp": 3.0,
"str": 1.9,
"vit": 1.5,
"mag": 1.3
},
"skills": [
"thunder_breath",
"megaflare",
"quake_stomp"
],
"captureRate": 0.04,
"color": "#7b7",
"resist": {
"thunder": 0.5
},
"material": "dragon_fang"
},
{
"id": "shell_dragon",
"name": "シールドドラゴン",
"area": 9,
"family": "dragon",
"role": "blocker",
"mult": {
"hp": 3.2,
"str": 1.5,
"vit": 2.0,
"spd": 0.6
},
"skills": [
"shell_guard",
"flame",
"mighty_guard"
],
"captureRate": 0.05,
"color": "#b96",
"resist": null,
"material": "dragon_fang"
},
{
"id": "abadon",
"name": "アバドン",
"area": 9,
"family": "demon",
"role": "attacker",
"mult": {
"hp": 2.2,
"str": 1.6,
"mag": 1.5,
"spd": 1.2
},
"skills": [
"dark_flare",
"wing_attack",
"curse"
],
"captureRate": 0.06,
"color": "#636",
"resist": {
"dark": -1,
"holy": 2
},
"material": "magicite"
},
{
"id": "ash",
"name": "アッシュ",
"area": 9,
"family": "undead",
"role": "jammer",
"mult": {
"hp": 1.5,
"mag": 1.6,
"spd": 1.2
},
"skills": [
"curse",
"dark_wave",
"drain_touch"
],
"captureRate": 0.1,
"color": "#998",
"resist": {
"holy": 2,
"dark": -1,
"poison": 0
},
"material": "phoenix_feather"
},
{
"id": "iron_man",
"name": "アイアンマン",
"area": 9,
"family": "machine",
"role": "blocker",
"mult": {
"hp": 2.8,
"str": 1.8,
"vit": 1.9,
"spd": 0.6
},
"skills": [
"brave_slash_m",
"mighty_guard",
"quake_stomp"
],
"captureRate": 0.05,
"color": "#889",
"resist": {
"thunder": 2,
"poison": 0
},
"material": "orichalcum"
},
{
"id": "mistodon",
"name": "ミストドン",
"area": 9,
"family": "beast",
"role": "attacker",
"mult": {
"hp": 2.0,
"str": 1.7,
"spd": 1.1
},
"skills": [
"quake_stomp",
"bite",
"dark_wave"
],
"captureRate": 0.1,
"color": "#b9c",
"resist": {
"dark": 0.5
},
"material": "dragon_fang"
},
{
"id": "defender_z",
"name": "ディフェンダーZ",
"area": 10,
"family": "machine",
"role": "blocker",
"mult": {
"hp": 3.4,
"str": 1.7,
"vit": 2.2,
"spd": 0.6
},
"skills": [
"mighty_guard",
"laser",
"brave_slash_m"
],
"captureRate": 0.04,
"color": "#aab",
"resist": {
"thunder": 2,
"poison": 0
},
"material": "orichalcum"
},
{
"id": "bashura",
"name": "バシュラ",
"area": 10,
"family": "giant",
"role": "attacker",
"mult": {
"hp": 2.6,
"str": 2.0,
"vit": 1.3,
"spd": 1.0
},
"skills": [
"brave_slash_m",
"quake_stomp",
"meteor_strike"
],
"captureRate": 0.06,
"color": "#c63",
"resist": null,
"material": "orichalcum"
},
{
"id": "mandragora",
"name": "マンドラゴラ",
"area": 10,
"family": "plant",
"role": "jammer",
"mult": {
"hp": 1.8,
"mag": 1.6,
"spd": 1.1
},
"skills": [
"silence_song",
"bad_breath",
"self_heal"
],
"captureRate": 0.12,
"color": "#7a4",
"resist": {
"poison": 0,
"fire": 2
},
"material": "slime_jelly"
},
{
"id": "fallen_monk",
"name": "堕ちた僧",
"area": 10,
"family": "human",
"role": "attacker",
"mult": {
"hp": 1.8,
"str": 1.7,
"mag": 1.4,
"spd": 1.2
},
"skills": [
"flame",
"brave_slash_m",
"laser"
],
"captureRate": 0.08,
"color": "#766",
"resist": {
"holy": 2
},
"material": "phoenix_feather"
},
{
"id": "dark_flan",
"name": "ダークフラン",
"area": 10,
"family": "amorph",
"role": "blocker",
"mult": {
"hp": 2.4,
"vit": 4.0,
"mag": 1.8,
"spr": 0.5,
"spd": 0.7
},
"skills": [
"dark_wave",
"dark_flare",
"white_wind"
],
"captureRate": 0.08,
"color": "#324",
"resist": {
"dark": -1,
"holy": 2,
"fire": 0.5,
"ice": 0.5
},
"material": "slime_jelly"
},
{
"id": "chimera_brain",
"name": "キマイラブレイン",
"area": 10,
"family": "beast",
"role": "attacker",
"mult": {
"hp": 2.4,
"str": 1.7,
"mag": 1.7,
"spd": 1.1
},
"skills": [
"flame",
"thunder_breath",
"megaflare"
],
"captureRate": 0.05,
"color": "#a74",
"resist": null,
"material": "dragon_fang"
}
];
