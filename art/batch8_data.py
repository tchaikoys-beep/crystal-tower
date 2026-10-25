# バッチ8：英雄＋14（FF4〜7）。データ（heroes2.ts）・仮スプライト（既存英雄の色替え）・プロンプト（batch8.md）を生成
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'public', 'sprites')
# (id, 名前, 作品, 倍率, 固有ジョブ, 加入階, リミットid, リミット名, リミット定義, 仮スプライト元, 色相, 英語の外見, 武器の英語)
H = [
  ('kain', 'カイン', 'FF4', {'hp': 1.1, 'str': 1.25, 'vit': 1.1, 'mag': 0.7, 'spd': 1.05}, 'dragoon', 40, 'limit_kain', 'ドラゴンダイブ', {'target': 'enemy', 'effect': 'phys', 'power': 3.6}, 'cecil', 210,
   'KAIN HIGHWIND from Final Fantasy IV, dragoon in dark blue dragon-shaped helmet and armor with a long blond ponytail', 'a long spear'),
  ('rosa', 'ローザ', 'FF4', {'hp': 0.9, 'mp': 1.3, 'str': 0.9, 'mag': 1.1, 'spr': 1.3, 'spd': 1.05}, 'ranger', 50, 'limit_rosa', 'いのり', {'target': 'allies', 'effect': 'heal', 'power': 450, 'tag': 'heal'}, 'terra', 40,
   'ROSA FARRELL from Final Fantasy IV, white mage archer with long blonde hair, white dress with pink trim and a white hood', 'a bow'),
  ('edge', 'エッジ', 'FF4', {'hp': 0.95, 'str': 1.15, 'vit': 0.9, 'spd': 1.4, 'luck': 1.1}, 'ninja', 60, 'limit_edge', '影縫い', {'target': 'enemy', 'effect': 'phys', 'power': 1.1, 'hits': 4}, 'cloud', 260,
   'EDGE GERALDINE from Final Fantasy IV, ninja prince with silver hair, dark purple ninja outfit and a red scarf', 'twin short blades'),
  ('rydia', 'リディア', 'FF4', {'hp': 0.8, 'mp': 1.5, 'str': 0.5, 'vit': 0.75, 'mag': 1.45, 'spr': 1.2}, 'summoner', 200, 'limit_rydia', 'ミストドラゴン', {'target': 'enemies', 'effect': 'magic', 'power': 380, 'element': 'none'}, 'terra', 100,
   'RYDIA from Final Fantasy IV, summoner with long green hair, green leotard-dress with a translucent green cape', 'a whip'),
  ('lenna', 'レナ', 'FF5', {'hp': 0.95, 'mp': 1.2, 'str': 0.85, 'vit': 0.95, 'mag': 1.05, 'spr': 1.25, 'spd': 1.05}, 'chemist', 70, 'limit_lenna', 'エリクサーの雨', {'target': 'allies', 'effect': 'heal', 'power': 650, 'tag': 'heal'}, 'terra', 320,
   'LENNA CHARLOTTE TYCOON from Final Fantasy V, princess with short pink hair, pink and white tunic with a dagger', 'a dagger'),
  ('faris', 'ファリス', 'FF5', {'hp': 1.1, 'str': 1.25, 'vit': 1.0, 'mag': 0.7, 'spd': 1.1}, 'berserker', 80, 'limit_faris', '海賊の一撃', {'target': 'enemies', 'effect': 'phys', 'power': 2.1}, 'bartz', 265,
   'FARIS SCHERWIZ from Final Fantasy V, pirate captain with long purple hair, purple pirate coat and a bandana', 'a battle axe'),
  ('galuf', 'ガラフ', 'FF5', {'hp': 1.2, 'str': 1.2, 'vit': 1.2, 'mag': 0.7, 'spd': 0.95}, 'samurai', 120, 'limit_galuf', '散りゆく者の意地', {'target': 'enemy', 'effect': 'phys', 'power': 4.2}, 'wol', 0,
   'GALUF HALM BALDESION from Final Fantasy V, elderly warrior king with grey hair and beard, yellow tunic with a dark cape', 'a katana'),
  ('krile', 'クルル', 'FF5', {'hp': 0.8, 'mp': 1.35, 'str': 0.6, 'mag': 1.3, 'spr': 1.15, 'spd': 1.15}, 'timemage', 100, 'limit_krile', 'メテオ', {'target': 'enemies', 'effect': 'magic', 'power': 300, 'element': 'none'}, 'terra', 50,
   'KRILE MAYER BALDESION from Final Fantasy V, small girl with short blonde hair in a yellow-orange outfit', 'a rod'),
  ('locke', 'ロック', 'FF6', {'hp': 0.95, 'str': 1.05, 'vit': 0.9, 'spd': 1.3, 'luck': 1.3}, 'thief', 90, 'limit_locke', 'ミラージュダイブ', {'target': 'enemy', 'effect': 'phys', 'power': 2.9}, 'bartz', 20,
   'LOCKE COLE from Final Fantasy VI, treasure hunter with light brown hair under a blue bandana, blue vest and a scarf', 'a dagger'),
  ('celes', 'セリス', 'FF6', {'hp': 1.0, 'mp': 1.15, 'str': 1.1, 'vit': 1.0, 'mag': 1.15}, 'mswordsman', 110, 'limit_celes', 'ルーンの剣', {'target': 'enemy', 'effect': 'phys', 'power': 2.8, 'element': 'holy'}, 'terra', 50,
   'CELES CHERE from Final Fantasy VI, rune knight general with long blonde hair, white and gold armored leotard with a cape', 'a sword'),
  ('edgar', 'エドガー', 'FF6', {'hp': 1.05, 'str': 1.1, 'vit': 1.0, 'mag': 0.9, 'spd': 1.1}, 'ranger', 130, 'limit_edgar', 'チェーンソー', {'target': 'enemy', 'effect': 'phys', 'power': 3.2}, 'firion', 50,
   'EDGAR RONI FIGARO from Final Fantasy VI, king with long blond hair tied back, blue royal coat with gold trim', 'a crossbow'),
  ('sabin', 'マッシュ', 'FF6', {'hp': 1.3, 'str': 1.3, 'vit': 1.1, 'mag': 0.5, 'spd': 1.1}, 'monk', 140, 'limit_sabin', '夢幻闘舞', {'target': 'enemies', 'effect': 'phys', 'power': 2.3}, 'wol', 40,
   'SABIN RENE FIGARO from Final Fantasy VI, muscular monk with blond hair, bare chest with a blue martial-arts outfit', 'bare fists'),
  ('tifa', 'ティファ', 'FF7', {'hp': 1.15, 'str': 1.25, 'vit': 1.0, 'mag': 0.7, 'spd': 1.25}, 'monk', 160, 'limit_tifa', 'ファイナルヘヴン', {'target': 'enemy', 'effect': 'phys', 'power': 4.6}, 'terra', 20,
   'TIFA LOCKHART from Final Fantasy VII, martial artist with long dark brown hair, white tank top, black miniskirt and red gloves', 'fighting gloves'),
  ('aerith', 'エアリス', 'FF7', {'hp': 0.85, 'mp': 1.45, 'str': 0.6, 'vit': 0.8, 'mag': 1.2, 'spr': 1.4}, 'whitemage', 150, 'limit_aerith', '大いなる福音', {'target': 'allies', 'effect': 'heal', 'power': 9999, 'tag': 'heal'}, 'terra', 330,
   'AERITH GAINSBOROUGH from Final Fantasy VII, flower girl with long brown braided hair and a pink ribbon, pink dress and red jacket', 'a staff'),
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
js = [{'id': hid, 'name': name, 'title': title, 'mult': mult, 'innateJob': job, 'joinFloor': floor, 'limit': lid, 'limitName': lname, 'limitDef': ldef} for (hid, name, title, mult, job, floor, lid, lname, ldef, *_r) in H]
open(os.path.join(ROOT, 'src', 'data', 'heroes2.ts'), 'w').write("// 自動生成：art/batch8_data.py（英雄＋14）\nexport interface NewHero { id: string; name: string; title: string; mult: Record<string, number>; innateJob: string; joinFloor: number; limit: string; limitName: string; limitDef: Record<string, unknown> }\nexport const HEROES2: NewHero[] = " + json.dumps(js, ensure_ascii=False, indent=0) + ";\n")
md = [f"# バッチ8：英雄＋14（{len(H) * 6}枚：立ち絵5ポーズ＋顔）\n", "- クラウドの画像を参照として添付。立ち絵は左向き・32×48想定、顔は48×48", "- 届くまではゲーム内では既存英雄の色替えが仮で表示される。同名で上書きされる\n"]
for (hid, name, title, mult, job, floor, lid, lname, ldef, base, hue, look, weapon) in H:
    md.append(f"## {name}（{title}）\n")
    for pose, pd in POSES.items():
        md.append(f"### hero_{hid}_{pose}\n```\nImage name: hero_{hid}_{pose}. Reply with this image name as the first line of your answer.\n\n{BASE_S}\n\nSide-view battle sprite of {look}, chibi 2.5-head proportion, holding {weapon}, facing LEFT, full body, feet visible, {pd.format(w=weapon)}. Should read clearly at 32x48 pixels. Match the exact pixel style and proportions of the attached reference sprite.\n```\n")
    md.append(f"### face_{hid}\n```\nImage name: face_{hid}. Reply with this image name as the first line of your answer.\n\n{BASE_F}\n\nPortrait bust of {look}, head and shoulders only, facing slightly left, 48x48 readable.\n```\n")
open(os.path.join(HERE, 'batch8.md'), 'w').write("\n".join(md))
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(H), 'heroes;', made, 'placeholders;', len(names), 'registered')
