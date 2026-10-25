# バッチ8：英雄＋14（FF4〜7）。データ（heroes2.ts）・仮スプライト（既存英雄の色替え）・プロンプト（batch8.md）を生成
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'public', 'sprites')
# (id, 名前, 作品, 倍率, 固有ジョブ, 加入階, リミットid, リミット名, リミット定義, 仮スプライト元, 色相, 英語の外見, 武器の英語)
H = [
  # (id, 名前, 作品, 倍率, 固有ジョブ, 加入, リミットid, リミット名, リミット定義, 仮スプライト元, 色相, 外見, 武器)
  ('maria', 'マリア', 'FF2', {'hp': 0.95, 'mp': 1.1, 'str': 1.0, 'mag': 1.1, 'spd': 1.1}, 'ranger', 220, 'limit_maria', '魔導の矢', {'target': 'enemies', 'effect': 'magic', 'power': 260, 'element': 'none'}, 'terra', 280,
   'MARIA from Final Fantasy II, archer with long purple hair, white and purple dress with a cape', 'a longbow'),
  ('guy', 'ガイ', 'FF2', {'hp': 1.35, 'str': 1.35, 'vit': 1.2, 'mag': 0.4, 'spd': 0.85}, 'berserker', 240, 'limit_guy', '獣の怒り', {'target': 'enemies', 'effect': 'phys', 'power': 2.4}, 'wol', 30,
   'GUY from Final Fantasy II, huge muscular man with wild brown hair, brown leather vest and a giant axe', 'a giant axe'),
  ('luneth', 'ルーネス', 'FF3', {'hp': 1.0, 'mp': 1.1, 'str': 1.05, 'mag': 1.05, 'spd': 1.1}, 'geomancer', 260, 'limit_luneth', '大地の怒り', {'target': 'enemies', 'effect': 'magic', 'power': 280, 'element': 'earth'}, 'bartz', 240,
   'LUNETH from Final Fantasy III, young onion knight with silver hair, purple tunic with a white hood and a bell', 'a bell and a short sword'),
  ('squall', 'スコール', 'FF8', {'hp': 1.1, 'mp': 1.05, 'str': 1.25, 'vit': 1.0, 'mag': 1.05}, 'mswordsman', 280, 'limit_squall', 'エンドオブハート', {'target': 'enemy', 'effect': 'phys', 'power': 1.3, 'hits': 5}, 'cloud', 300,
   'SQUALL LEONHART from Final Fantasy VIII, gunblade wielder with brown hair and a scar, black leather jacket with white fur collar', 'a gunblade'),
  ('rinoa', 'リノア', 'FF8', {'hp': 0.95, 'mp': 1.2, 'str': 0.9, 'mag': 1.15, 'spr': 1.1, 'luck': 1.2}, 'beastmaster', 300, 'limit_rinoa', 'アンジェロキャノン', {'target': 'enemies', 'effect': 'phys', 'power': 2.2}, 'terra', 350,
   'RINOA HEARTILLY from Final Fantasy VIII, girl with long black hair, light blue duster coat over a black dress, with a small dog', 'a pinwheel blaster on her arm'),
  ('quistis', 'キスティス', 'FF8', {'hp': 0.95, 'mp': 1.3, 'str': 0.85, 'mag': 1.2, 'spr': 1.15, 'spd': 1.05}, 'bluemage', 320, 'limit_quistis', 'ショックウェーブパルサー', {'target': 'enemies', 'effect': 'magic', 'power': 340, 'element': 'none'}, 'terra', 45,
   'QUISTIS TREPE from Final Fantasy VIII, instructor with blonde hair clipped up, peach-colored sleeveless top and long skirt, glasses', 'a chain whip'),
  ('selphie', 'セルフィ', 'FF8', {'hp': 0.9, 'mp': 1.3, 'str': 0.8, 'mag': 1.2, 'spr': 1.15, 'spd': 1.15, 'luck': 1.3}, 'redmage', 340, 'limit_selphie', 'ジ・エンド', {'target': 'enemies', 'effect': 'fixed', 'power': -0.7}, 'terra', 60,
   'SELPHIE TILMITT from Final Fantasy VIII, cheerful girl with brown flipped hair, yellow mini dress', 'a pair of nunchaku'),
  ('zidane', 'ジタン', 'FF9', {'hp': 1.0, 'str': 1.1, 'vit': 0.9, 'spd': 1.35, 'luck': 1.3}, 'thief', 360, 'limit_zidane', 'グランドリーサル', {'target': 'enemies', 'effect': 'phys', 'power': 2.5}, 'bartz', 40,
   'ZIDANE TRIBAL from Final Fantasy IX, thief with blond hair in a short ponytail and a monkey tail, blue vest and white shirt', 'twin daggers'),
  ('vivi', 'ビビ', 'FF9', {'hp': 0.7, 'mp': 1.5, 'str': 0.4, 'vit': 0.7, 'mag': 1.5, 'spr': 1.0}, 'blackmage', 380, 'limit_vivi', 'ダブルフレア', {'target': 'enemies', 'effect': 'magic', 'power': 360, 'element': 'fire'}, 'terra', 230,
   'VIVI ORNITIER from Final Fantasy IX, small black mage with a shadowed face and glowing yellow eyes, big pointed hat, blue coat and green pants', 'a short staff'),
  ('garnet', 'ガーネット', 'FF9', {'hp': 0.85, 'mp': 1.4, 'str': 0.6, 'vit': 0.8, 'mag': 1.2, 'spr': 1.35}, 'whitemage', 400, 'limit_garnet', '聖なる祈り', {'target': 'allies', 'effect': 'heal', 'power': 9999, 'tag': 'heal'}, 'terra', 10,
   'GARNET TIL ALEXANDROS from Final Fantasy IX, princess with long black hair, white blouse and orange jumpsuit', 'a rod'),
  ('steiner', 'スタイナー', 'FF9', {'hp': 1.3, 'str': 1.25, 'vit': 1.3, 'mag': 0.6, 'spd': 0.85}, 'knight', 420, 'limit_steiner', 'ショック', {'target': 'enemy', 'effect': 'phys', 'power': 4.0}, 'cecil', 15,
   'ADELBERT STEINER from Final Fantasy IX, stout knight captain in rusty full plate armor with a plume helmet', 'a broadsword'),
  ('freya', 'フライヤ', 'FF9', {'hp': 1.1, 'str': 1.2, 'vit': 1.05, 'mag': 0.8, 'spd': 1.15}, 'dragoon', 440, 'limit_freya', '竜の紋章', {'target': 'enemies', 'effect': 'magic', 'power': 300, 'element': 'none'}, 'cecil', 330,
   'FREYA CRESCENT from Final Fantasy IX, rat-like Burmecian dragoon with white fur, red coat and a wide-brimmed red hat', 'a long lance'),
  ('tidus', 'ティーダ', 'FF10', {'hp': 1.05, 'mp': 1.1, 'str': 1.1, 'vit': 0.95, 'mag': 0.9, 'spd': 1.3}, 'timemage', 460, 'limit_tidus', 'エース・オブ・ザ・ブリッツ', {'target': 'enemy', 'effect': 'phys', 'power': 1.1, 'hits': 6}, 'cloud', 50,
   'TIDUS from Final Fantasy X, blitzball player with spiky blond hair, yellow and black outfit with one armored sleeve', 'a water-blue sword'),
  ('yuna', 'ユウナ', 'FF10', {'hp': 0.85, 'mp': 1.5, 'str': 0.5, 'vit': 0.8, 'mag': 1.35, 'spr': 1.3}, 'summoner', 480, 'limit_yuna', 'グランドサモン', {'target': 'enemies', 'effect': 'magic', 'power': 400, 'element': 'none'}, 'terra', 150,
   'YUNA from Final Fantasy X, summoner with short brown hair, white top with a blue pleated skirt and long sleeves', 'a summoner staff'),
  ('auron', 'アーロン', 'FF10', {'hp': 1.25, 'str': 1.35, 'vit': 1.15, 'mag': 0.6, 'spd': 0.9}, 'samurai', 500, 'limit_auron', '牙竜断', {'target': 'enemy', 'effect': 'phys', 'power': 4.4}, 'wol', 0,
   'AURON from Final Fantasy X, stern warrior monk with black hair and sunglasses, red coat with one arm inside, a large jug at his belt', 'a huge katana'),
  ('rikku', 'リュック', 'FF10', {'hp': 0.95, 'str': 0.95, 'vit': 0.85, 'spd': 1.4, 'luck': 1.4}, 'chemist', 520, 'limit_rikku', '調合：究極', {'target': 'allies', 'effect': 'heal', 'power': 9999, 'tag': 'heal'}, 'bartz', 50,
   'RIKKU from Final Fantasy X, Al Bhed girl with blonde braided hair and green swirl eyes, orange top and green shorts', 'a claw weapon'),
  ('penelo', 'パンネロ', 'FF12', {'hp': 0.9, 'mp': 1.2, 'str': 0.85, 'mag': 1.1, 'spr': 1.1, 'spd': 1.3}, 'dancer', 540, 'limit_penelo', '天使の舞', {'target': 'allies', 'effect': 'buff', 'status': 'haste', 'power': 0}, 'terra', 45,
   'PENELO from Final Fantasy XII, dancer with blonde braided pigtails, white and gold outfit', 'a pair of daggers'),
  ('fran', 'フラン', 'FF12', {'hp': 0.95, 'mp': 1.2, 'str': 1.0, 'mag': 1.1, 'spr': 1.1, 'spd': 1.2}, 'bard', 560, 'limit_fran', '神の弓', {'target': 'enemies', 'effect': 'phys', 'power': 2.4}, 'terra', 0,
   'FRAN from Final Fantasy XII, tall viera with long white hair and rabbit ears, black armored bodysuit', 'a bow'),
  ('lightning', 'ライトニング', 'FF13', {'hp': 1.1, 'str': 1.25, 'vit': 1.0, 'mag': 1.1, 'spd': 1.2}, 'knight', 'r2', 'limit_lightning', '閃光', {'target': 'enemy', 'effect': 'phys', 'power': 1.0, 'hits': 8}, 'cloud', 330,
   'LIGHTNING from Final Fantasy XIII, soldier with pink hair, white sleeveless jacket with a red cape and a brown mini skirt', 'a gunblade'),
  ('noctis', 'ノクティス', 'FF15', {'hp': 1.05, 'str': 1.2, 'vit': 0.95, 'mag': 1.0, 'spd': 1.3}, 'ninja', 'r4', 'limit_noctis', 'ファントムソード', {'target': 'enemies', 'effect': 'phys', 'power': 2.6}, 'cloud', 230,
   'NOCTIS LUCIS CAELUM from Final Fantasy XV, prince with messy black hair, black jacket and black clothes', 'an engine blade'),
  ('clive', 'クライヴ', 'FF16', {'hp': 1.2, 'str': 1.3, 'vit': 1.1, 'mag': 1.0, 'spd': 0.95}, 'berserker', 'r3', 'limit_clive', 'イフリートの業火', {'target': 'enemies', 'effect': 'magic', 'power': 330, 'element': 'fire'}, 'cloud', 20,
   'CLIVE ROSFIELD from Final Fantasy XVI, knight with short dark hair and a scar, dark leather armor with a red sash', 'a longsword'),
  ('ramza', 'ラムザ', 'FFT', {'hp': 1.05, 'mp': 1.05, 'str': 1.05, 'vit': 1.05, 'mag': 1.05, 'spd': 1.05}, 'freelancer', 'r1', 'limit_ramza', 'アルテマ', {'target': 'enemies', 'effect': 'magic', 'power': 320, 'element': 'none'}, 'bartz', 50,
   'RAMZA BEOULVE from Final Fantasy Tactics, squire with blond hair, blue and white tunic with armored shoulder', 'a sword'),
  ('marche', 'マーシュ', 'FFTA', {'hp': 1.1, 'str': 1.15, 'vit': 1.1, 'mag': 0.9, 'spd': 1.05}, 'knight', 580, 'limit_marche', '聖光爆裂破', {'target': 'enemies', 'effect': 'phys', 'power': 2.4, 'element': 'holy'}, 'bartz', 60,
   'MARCHE RADIUJU from Final Fantasy Tactics Advance, boy soldier with blond hair, blue tunic with a cape', 'a sword'),
]
BASE_S = "16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature."
BASE_F = "16-bit SNES-era JRPG pixel art menu portrait in the style of mid-1990s Japanese RPGs, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, 1-pixel dark outline, flat solid magenta background (#FF00FF), no text, no watermark."
POSES = {
  'idle': 'idle battle stance',
  'attack': 'mid-swing attack pose with {w} held forward',
  'cast': 'spell-casting pose with one arm raised and a small glow at the hand',
  'hurt': 'recoiling hurt pose, leaning back, eyes shut',
  'win': 'victory pose with {w} raised overhead',
}
def shift(img, hue_deg):
    img = img.convert('RGBA'); a = img.getchannel('A'); hsv = img.convert('RGB').convert('HSV'); px = hsv.load(); w, hh = hsv.size; target = int(hue_deg * 255 / 360)
    for y in range(hh):
        for x in range(w):
            h, s, v = px[x, y]
            if v < 60: continue
            px[x, y] = ((target if s < 50 else (h + target) % 256), (110 if s < 50 else s), v)
    out = hsv.convert('RGBA'); out.putalpha(a); return out
made = 0
for (hid, name, title, mult, job, floor, lid, lname, ldef, base, hue, look, weapon) in H:
    for pose in POSES:
        dst = os.path.join(OUT, f'hero_{hid}_{pose}.png'); src = os.path.join(OUT, f'hero_{base}_{pose}.png')
        if not os.path.exists(dst) and os.path.exists(src): shift(Image.open(src), hue).save(dst); made += 1
    dst = os.path.join(OUT, f'face_{hid}.png'); src = os.path.join(OUT, f'face_{base}.png')
    if not os.path.exists(dst) and os.path.exists(src): shift(Image.open(src), hue).save(dst); made += 1
js = [{'id': hid, 'name': name, 'title': title, 'mult': mult, 'innateJob': job, 'joinFloor': (floor if isinstance(floor, int) else 0), 'joinRebirth': (int(floor[1:]) if isinstance(floor, str) else 0), 'limit': lid, 'limitName': lname, 'limitDef': ldef} for (hid, name, title, mult, job, floor, lid, lname, ldef, *_r) in H]
open(os.path.join(ROOT, 'src', 'data', 'heroes3.ts'), 'w').write("// 自動生成：art/batch8_data.py（英雄＋14）\nexport interface NewHero3 { id: string; name: string; title: string; mult: Record<string, number>; innateJob: string; joinFloor: number; joinRebirth: number; limit: string; limitName: string; limitDef: Record<string, unknown> }\nexport const HEROES3: NewHero3[] = " + json.dumps(js, ensure_ascii=False, indent=0) + ";\n")
md = [f"# バッチ9：英雄＋23（{len(H) * 6}枚：立ち絵5ポーズ＋顔）\n", "- クラウドの画像を参照として添付。立ち絵は左向き・32×48想定、顔は48×48", "- 届くまではゲーム内では既存英雄の色替えが仮で表示される。同名で上書きされる\n"]
for (hid, name, title, mult, job, floor, lid, lname, ldef, base, hue, look, weapon) in H:
    md.append(f"## {name}（{title}）\n")
    for pose, pd in POSES.items():
        md.append(f"### hero_{hid}_{pose}\n```\nImage name: hero_{hid}_{pose}. Reply with this image name as the first line of your answer.\n\n{BASE_S}\n\nSide-view battle sprite of {look}, chibi 2.5-head proportion, holding {weapon}, facing LEFT, full body, feet visible, {pd.format(w=weapon)}. Should read clearly at 32x48 pixels. Match the exact pixel style and proportions of the attached reference sprite.\n```\n")
    md.append(f"### face_{hid}\n```\nImage name: face_{hid}. Reply with this image name as the first line of your answer.\n\n{BASE_F}\n\nPortrait bust of {look}, head and shoulders only, facing slightly left, 48x48 readable.\n```\n")
open(os.path.join(HERE, 'batch9.md'), 'w').write("\n".join(md))
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(H), 'heroes;', made, 'placeholders;', len(names), 'registered')
