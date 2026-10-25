// 自動生成：art/batch8_data.py（英雄＋14）
export interface NewHero { id: string; name: string; title: string; mult: Record<string, number>; innateJob: string; joinFloor: number; limit: string; limitName: string; limitDef: Record<string, unknown> }
export const HEROES2: NewHero[] = [
{
"id": "kain",
"name": "カイン",
"title": "FF4",
"mult": {
"hp": 1.1,
"str": 1.25,
"vit": 1.1,
"mag": 0.7,
"spd": 1.05
},
"innateJob": "dragoon",
"joinFloor": 40,
"limit": "limit_kain",
"limitName": "ドラゴンダイブ",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 3.6
}
},
{
"id": "rosa",
"name": "ローザ",
"title": "FF4",
"mult": {
"hp": 0.9,
"mp": 1.3,
"str": 0.9,
"mag": 1.1,
"spr": 1.3,
"spd": 1.05
},
"innateJob": "ranger",
"joinFloor": 50,
"limit": "limit_rosa",
"limitName": "いのり",
"limitDef": {
"target": "allies",
"effect": "heal",
"power": 450,
"tag": "heal"
}
},
{
"id": "edge",
"name": "エッジ",
"title": "FF4",
"mult": {
"hp": 0.95,
"str": 1.15,
"vit": 0.9,
"spd": 1.4,
"luck": 1.1
},
"innateJob": "ninja",
"joinFloor": 60,
"limit": "limit_edge",
"limitName": "影縫い",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 1.1,
"hits": 4
}
},
{
"id": "rydia",
"name": "リディア",
"title": "FF4",
"mult": {
"hp": 0.8,
"mp": 1.5,
"str": 0.5,
"vit": 0.75,
"mag": 1.45,
"spr": 1.2
},
"innateJob": "summoner",
"joinFloor": 200,
"limit": "limit_rydia",
"limitName": "ミストドラゴン",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 380,
"element": "none"
}
},
{
"id": "lenna",
"name": "レナ",
"title": "FF5",
"mult": {
"hp": 0.95,
"mp": 1.2,
"str": 0.85,
"vit": 0.95,
"mag": 1.05,
"spr": 1.25,
"spd": 1.05
},
"innateJob": "chemist",
"joinFloor": 70,
"limit": "limit_lenna",
"limitName": "エリクサーの雨",
"limitDef": {
"target": "allies",
"effect": "heal",
"power": 650,
"tag": "heal"
}
},
{
"id": "faris",
"name": "ファリス",
"title": "FF5",
"mult": {
"hp": 1.1,
"str": 1.25,
"vit": 1.0,
"mag": 0.7,
"spd": 1.1
},
"innateJob": "berserker",
"joinFloor": 80,
"limit": "limit_faris",
"limitName": "海賊の一撃",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.1
}
},
{
"id": "galuf",
"name": "ガラフ",
"title": "FF5",
"mult": {
"hp": 1.2,
"str": 1.2,
"vit": 1.2,
"mag": 0.7,
"spd": 0.95
},
"innateJob": "samurai",
"joinFloor": 120,
"limit": "limit_galuf",
"limitName": "散りゆく者の意地",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 4.2
}
},
{
"id": "krile",
"name": "クルル",
"title": "FF5",
"mult": {
"hp": 0.8,
"mp": 1.35,
"str": 0.6,
"mag": 1.3,
"spr": 1.15,
"spd": 1.15
},
"innateJob": "timemage",
"joinFloor": 100,
"limit": "limit_krile",
"limitName": "メテオ",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 300,
"element": "none"
}
},
{
"id": "locke",
"name": "ロック",
"title": "FF6",
"mult": {
"hp": 0.95,
"str": 1.05,
"vit": 0.9,
"spd": 1.3,
"luck": 1.3
},
"innateJob": "thief",
"joinFloor": 90,
"limit": "limit_locke",
"limitName": "ミラージュダイブ",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 2.9
}
},
{
"id": "celes",
"name": "セリス",
"title": "FF6",
"mult": {
"hp": 1.0,
"mp": 1.15,
"str": 1.1,
"vit": 1.0,
"mag": 1.15
},
"innateJob": "mswordsman",
"joinFloor": 110,
"limit": "limit_celes",
"limitName": "ルーンの剣",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 2.8,
"element": "holy"
}
},
{
"id": "edgar",
"name": "エドガー",
"title": "FF6",
"mult": {
"hp": 1.05,
"str": 1.1,
"vit": 1.0,
"mag": 0.9,
"spd": 1.1
},
"innateJob": "ranger",
"joinFloor": 130,
"limit": "limit_edgar",
"limitName": "チェーンソー",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 3.2
}
},
{
"id": "sabin",
"name": "マッシュ",
"title": "FF6",
"mult": {
"hp": 1.3,
"str": 1.3,
"vit": 1.1,
"mag": 0.5,
"spd": 1.1
},
"innateJob": "monk",
"joinFloor": 140,
"limit": "limit_sabin",
"limitName": "夢幻闘舞",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.3
}
},
{
"id": "tifa",
"name": "ティファ",
"title": "FF7",
"mult": {
"hp": 1.15,
"str": 1.25,
"vit": 1.0,
"mag": 0.7,
"spd": 1.25
},
"innateJob": "monk",
"joinFloor": 160,
"limit": "limit_tifa",
"limitName": "ファイナルヘヴン",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 4.6
}
},
{
"id": "aerith",
"name": "エアリス",
"title": "FF7",
"mult": {
"hp": 0.85,
"mp": 1.45,
"str": 0.6,
"vit": 0.8,
"mag": 1.2,
"spr": 1.4
},
"innateJob": "whitemage",
"joinFloor": 150,
"limit": "limit_aerith",
"limitName": "大いなる福音",
"limitDef": {
"target": "allies",
"effect": "heal",
"power": 9999,
"tag": "heal"
}
}
];
