// 自動生成：art/batch8_data.py（英雄＋14）
export interface NewHero3 { id: string; name: string; title: string; mult: Record<string, number>; innateJob: string; joinFloor: number; joinRebirth: number; limit: string; limitName: string; limitDef: Record<string, unknown> }
export const HEROES3: NewHero3[] = [
{
"id": "maria",
"name": "マリア",
"title": "FF2",
"mult": {
"hp": 0.95,
"mp": 1.1,
"str": 1.0,
"mag": 1.1,
"spd": 1.1
},
"innateJob": "ranger",
"joinFloor": 220,
"joinRebirth": 0,
"limit": "limit_maria",
"limitName": "魔導の矢",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 260,
"element": "none"
}
},
{
"id": "guy",
"name": "ガイ",
"title": "FF2",
"mult": {
"hp": 1.35,
"str": 1.35,
"vit": 1.2,
"mag": 0.4,
"spd": 0.85
},
"innateJob": "berserker",
"joinFloor": 240,
"joinRebirth": 0,
"limit": "limit_guy",
"limitName": "獣の怒り",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.4
}
},
{
"id": "luneth",
"name": "ルーネス",
"title": "FF3",
"mult": {
"hp": 1.0,
"mp": 1.1,
"str": 1.05,
"mag": 1.05,
"spd": 1.1
},
"innateJob": "geomancer",
"joinFloor": 260,
"joinRebirth": 0,
"limit": "limit_luneth",
"limitName": "大地の怒り",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 280,
"element": "earth"
}
},
{
"id": "squall",
"name": "スコール",
"title": "FF8",
"mult": {
"hp": 1.1,
"mp": 1.05,
"str": 1.25,
"vit": 1.0,
"mag": 1.05
},
"innateJob": "mswordsman",
"joinFloor": 280,
"joinRebirth": 0,
"limit": "limit_squall",
"limitName": "エンドオブハート",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 1.3,
"hits": 5
}
},
{
"id": "rinoa",
"name": "リノア",
"title": "FF8",
"mult": {
"hp": 0.95,
"mp": 1.2,
"str": 0.9,
"mag": 1.15,
"spr": 1.1,
"luck": 1.2
},
"innateJob": "beastmaster",
"joinFloor": 300,
"joinRebirth": 0,
"limit": "limit_rinoa",
"limitName": "アンジェロキャノン",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.2
}
},
{
"id": "quistis",
"name": "キスティス",
"title": "FF8",
"mult": {
"hp": 0.95,
"mp": 1.3,
"str": 0.85,
"mag": 1.2,
"spr": 1.15,
"spd": 1.05
},
"innateJob": "bluemage",
"joinFloor": 320,
"joinRebirth": 0,
"limit": "limit_quistis",
"limitName": "ショックウェーブパルサー",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 340,
"element": "none"
}
},
{
"id": "selphie",
"name": "セルフィ",
"title": "FF8",
"mult": {
"hp": 0.9,
"mp": 1.3,
"str": 0.8,
"mag": 1.2,
"spr": 1.15,
"spd": 1.15,
"luck": 1.3
},
"innateJob": "redmage",
"joinFloor": 340,
"joinRebirth": 0,
"limit": "limit_selphie",
"limitName": "ジ・エンド",
"limitDef": {
"target": "enemies",
"effect": "fixed",
"power": -0.7
}
},
{
"id": "zidane",
"name": "ジタン",
"title": "FF9",
"mult": {
"hp": 1.0,
"str": 1.1,
"vit": 0.9,
"spd": 1.35,
"luck": 1.3
},
"innateJob": "thief",
"joinFloor": 360,
"joinRebirth": 0,
"limit": "limit_zidane",
"limitName": "グランドリーサル",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.5
}
},
{
"id": "vivi",
"name": "ビビ",
"title": "FF9",
"mult": {
"hp": 0.7,
"mp": 1.5,
"str": 0.4,
"vit": 0.7,
"mag": 1.5,
"spr": 1.0
},
"innateJob": "blackmage",
"joinFloor": 380,
"joinRebirth": 0,
"limit": "limit_vivi",
"limitName": "ダブルフレア",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 360,
"element": "fire"
}
},
{
"id": "garnet",
"name": "ガーネット",
"title": "FF9",
"mult": {
"hp": 0.85,
"mp": 1.4,
"str": 0.6,
"vit": 0.8,
"mag": 1.2,
"spr": 1.35
},
"innateJob": "whitemage",
"joinFloor": 400,
"joinRebirth": 0,
"limit": "limit_garnet",
"limitName": "聖なる祈り",
"limitDef": {
"target": "allies",
"effect": "heal",
"power": 9999,
"tag": "heal"
}
},
{
"id": "steiner",
"name": "スタイナー",
"title": "FF9",
"mult": {
"hp": 1.3,
"str": 1.25,
"vit": 1.3,
"mag": 0.6,
"spd": 0.85
},
"innateJob": "knight",
"joinFloor": 420,
"joinRebirth": 0,
"limit": "limit_steiner",
"limitName": "ショック",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 4.0
}
},
{
"id": "freya",
"name": "フライヤ",
"title": "FF9",
"mult": {
"hp": 1.1,
"str": 1.2,
"vit": 1.05,
"mag": 0.8,
"spd": 1.15
},
"innateJob": "dragoon",
"joinFloor": 440,
"joinRebirth": 0,
"limit": "limit_freya",
"limitName": "竜の紋章",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 300,
"element": "none"
}
},
{
"id": "tidus",
"name": "ティーダ",
"title": "FF10",
"mult": {
"hp": 1.05,
"mp": 1.1,
"str": 1.1,
"vit": 0.95,
"mag": 0.9,
"spd": 1.3
},
"innateJob": "timemage",
"joinFloor": 460,
"joinRebirth": 0,
"limit": "limit_tidus",
"limitName": "エース・オブ・ザ・ブリッツ",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 1.1,
"hits": 6
}
},
{
"id": "yuna",
"name": "ユウナ",
"title": "FF10",
"mult": {
"hp": 0.85,
"mp": 1.5,
"str": 0.5,
"vit": 0.8,
"mag": 1.35,
"spr": 1.3
},
"innateJob": "summoner",
"joinFloor": 480,
"joinRebirth": 0,
"limit": "limit_yuna",
"limitName": "グランドサモン",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 400,
"element": "none"
}
},
{
"id": "auron",
"name": "アーロン",
"title": "FF10",
"mult": {
"hp": 1.25,
"str": 1.35,
"vit": 1.15,
"mag": 0.6,
"spd": 0.9
},
"innateJob": "samurai",
"joinFloor": 500,
"joinRebirth": 0,
"limit": "limit_auron",
"limitName": "牙竜断",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 4.4
}
},
{
"id": "rikku",
"name": "リュック",
"title": "FF10",
"mult": {
"hp": 0.95,
"str": 0.95,
"vit": 0.85,
"spd": 1.4,
"luck": 1.4
},
"innateJob": "chemist",
"joinFloor": 520,
"joinRebirth": 0,
"limit": "limit_rikku",
"limitName": "調合：究極",
"limitDef": {
"target": "allies",
"effect": "heal",
"power": 9999,
"tag": "heal"
}
},
{
"id": "penelo",
"name": "パンネロ",
"title": "FF12",
"mult": {
"hp": 0.9,
"mp": 1.2,
"str": 0.85,
"mag": 1.1,
"spr": 1.1,
"spd": 1.3
},
"innateJob": "dancer",
"joinFloor": 540,
"joinRebirth": 0,
"limit": "limit_penelo",
"limitName": "天使の舞",
"limitDef": {
"target": "allies",
"effect": "buff",
"status": "haste",
"power": 0
}
},
{
"id": "fran",
"name": "フラン",
"title": "FF12",
"mult": {
"hp": 0.95,
"mp": 1.2,
"str": 1.0,
"mag": 1.1,
"spr": 1.1,
"spd": 1.2
},
"innateJob": "bard",
"joinFloor": 560,
"joinRebirth": 0,
"limit": "limit_fran",
"limitName": "神の弓",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.4
}
},
{
"id": "lightning",
"name": "ライトニング",
"title": "FF13",
"mult": {
"hp": 1.1,
"str": 1.25,
"vit": 1.0,
"mag": 1.1,
"spd": 1.2
},
"innateJob": "knight",
"joinFloor": 0,
"joinRebirth": 2,
"limit": "limit_lightning",
"limitName": "閃光",
"limitDef": {
"target": "enemy",
"effect": "phys",
"power": 1.0,
"hits": 8
}
},
{
"id": "noctis",
"name": "ノクティス",
"title": "FF15",
"mult": {
"hp": 1.05,
"str": 1.2,
"vit": 0.95,
"mag": 1.0,
"spd": 1.3
},
"innateJob": "ninja",
"joinFloor": 0,
"joinRebirth": 4,
"limit": "limit_noctis",
"limitName": "ファントムソード",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.6
}
},
{
"id": "clive",
"name": "クライヴ",
"title": "FF16",
"mult": {
"hp": 1.2,
"str": 1.3,
"vit": 1.1,
"mag": 1.0,
"spd": 0.95
},
"innateJob": "berserker",
"joinFloor": 0,
"joinRebirth": 3,
"limit": "limit_clive",
"limitName": "イフリートの業火",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 330,
"element": "fire"
}
},
{
"id": "ramza",
"name": "ラムザ",
"title": "FFT",
"mult": {
"hp": 1.05,
"mp": 1.05,
"str": 1.05,
"vit": 1.05,
"mag": 1.05,
"spd": 1.05
},
"innateJob": "freelancer",
"joinFloor": 0,
"joinRebirth": 1,
"limit": "limit_ramza",
"limitName": "アルテマ",
"limitDef": {
"target": "enemies",
"effect": "magic",
"power": 320,
"element": "none"
}
},
{
"id": "marche",
"name": "マーシュ",
"title": "FFTA",
"mult": {
"hp": 1.1,
"str": 1.15,
"vit": 1.1,
"mag": 0.9,
"spd": 1.05
},
"innateJob": "knight",
"joinFloor": 580,
"joinRebirth": 0,
"limit": "limit_marche",
"limitName": "聖光爆裂破",
"limitDef": {
"target": "enemies",
"effect": "phys",
"power": 2.4,
"element": "holy"
}
}
];
