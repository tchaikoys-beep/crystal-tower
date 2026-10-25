# バッチ7：後半エリアの新規モンスター。データ（monsters.ts 追記）・仮スプライト・プロンプト（batch7.md）を一括生成
# 使い方: python3 art/batch7_data.py
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'public', 'sprites')
# (id, 名前, エリア, family, role, mult, skills, 捕獲率, 色, 耐性, 素材, 仮スプライトの元, 色相, 英語の説明)
N = [
  # エリア5 次元の狭間（FF5）
  ('necrophobe', 'ネクロフォビア', 5, 'demon', 'jammer', {'hp': 1.6, 'mag': 1.5, 'spr': 1.4}, ['holy_light', 'dark_flare', 'mighty_guard'], 0.08, '#dcd', {'holy': 0.5, 'dark': 0.5}, 'magicite', 'ahriman', 300,
   'NECROPHOBE from Final Fantasy V, a pale floating humanoid spirit with a dark cloak and four small barrier orbs orbiting it'),
  ('crystal_dragon', 'クリスタルドラゴン', 5, 'dragon', 'attacker', {'hp': 2.4, 'str': 1.6, 'vit': 1.5, 'mag': 1.3}, ['ice_breath', 'holy_light', 'megaflare'], 0.06, '#9ef', {'ice': 0.5, 'holy': 0.5}, 'dragon_fang', 'shinryu_whelp', 170,
   'CRYSTAL DRAGON from Final Fantasy V, a dragon made of translucent pale-blue crystal with jagged crystalline wings'),
  ('belphegor', 'ベルフェゴール', 5, 'demon', 'jammer', {'hp': 1.3, 'mag': 1.4, 'spd': 1.2}, ['sleep_gas', 'curse', 'thunder_breath'], 0.15, '#a6c', None, 'fire_shard', 'deathgaze', 60,
   'BELPHEGOR from Final Fantasy V, a horned purple demon with bat wings and a long tail, grinning'),
  ('land_crawler', 'ランドクローラー', 5, 'beast', 'blocker', {'hp': 2.6, 'str': 1.3, 'vit': 1.8, 'spd': 0.5}, ['quake_stomp', 'shell_guard', 'poison_breath'], 0.15, '#a85', {'earth': 0}, 'dragon_fang', 'adamantoise', 40,
   'LAND CRAWLER from Final Fantasy V, a huge brown segmented worm-like beast with a hard shell and many legs'),
  ('cerberus', 'ケルベロス', 5, 'beast', 'attacker', {'hp': 1.6, 'str': 1.5, 'spd': 1.4}, ['bite', 'flame', 'bad_breath'], 0.12, '#633', {'fire': 0.5}, 'wolf_fang', 'guard_hound', 340,
   'CERBERUS from Final Fantasy V, a three-headed black hellhound with glowing red eyes and flames around its necks'),
  ('mold_wind', 'モールドウインド', 5, 'plant', 'jammer', {'hp': 1.4, 'mag': 1.3, 'spd': 1.1}, ['poison_breath', 'silence_song', 'sleep_gas'], 0.2, '#8a5', {'poison': 0, 'fire': 2}, 'slime_jelly', 'malboro', 150,
   'MOLD WIND from Final Fantasy V, a floating cluster of green mold and spores shaped like a ragged cloud with a face'),
  # エリア6 瓦礫の世界（FF6）
  ('land_worm', 'ランドウォーム', 6, 'beast', 'blocker', {'hp': 3.0, 'str': 1.5, 'vit': 1.6, 'spd': 0.5}, ['quake_stomp', 'poison_breath', 'self_heal'], 0.1, '#875', {'earth': 0}, 'dragon_fang', 'midgar_zolom', 30,
   'LAND WORM from Final Fantasy VI, a giant brown earthworm rearing up out of the ground with a round toothy mouth'),
  ('gigantos', 'ギガントス', 6, 'giant', 'attacker', {'hp': 2.8, 'str': 1.9, 'vit': 1.4, 'spd': 0.6}, ['brave_slash_m', 'quake_stomp', 'meteor_strike'], 0.06, '#c96', None, 'orichalcum', 'hecatoncheir', 20,
   'GIGANTOS from Final Fantasy VI, a towering muscular giant in a loincloth swinging a huge club'),
  ('outsider', 'アウトサイダー', 6, 'demon', 'jammer', {'hp': 1.4, 'mag': 1.5, 'spd': 1.3}, ['blaster', 'dark_wave', 'stone_gaze'], 0.1, '#669', {'dark': 0.5, 'holy': 2}, 'magicite', 'vampire', 200,
   'OUTSIDER from Final Fantasy VI, a thin dark-blue demon with a bladed arm and a glowing eye, hunched forward'),
  ('holy_dragon', 'ホーリードラゴン', 6, 'dragon', 'healer', {'hp': 2.2, 'mag': 1.6, 'spr': 1.6, 'spd': 1.1}, ['holy_light', 'white_wind', 'self_heal'], 0.05, '#fec', {'holy': -1, 'dark': 2}, 'phoenix_feather', 'blue_dragon', 50,
   'HOLY DRAGON from Final Fantasy VI, a graceful white-gold dragon with feathered wings glowing with holy light'),
  ('critic', 'クリティック', 6, 'bird', 'jammer', {'hp': 1.1, 'mag': 1.3, 'spd': 1.5}, ['blind_dust', 'wing_attack', 'silence_song'], 0.2, '#b84', None, 'wolf_fang', 'griffin', 320,
   'CRITIC from Final Fantasy VI, a large ragged dark-orange bird of prey with a cruel beak, wings spread'),
  ('innocent', 'イノセント', 6, 'undead', 'jammer', {'hp': 1.3, 'mag': 1.4, 'spr': 1.3}, ['curse', 'drain_touch', 'sleep_gas'], 0.12, '#dde', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'vampire', 60,
   'INNOCENT from Final Fantasy VI, a pale ghostly woman in a tattered white dress floating with trailing hair'),
  # エリア7 ミッドガル（FF7）
  ('hell_house', 'ヘルハウス', 7, 'machine', 'blocker', {'hp': 2.6, 'str': 1.4, 'vit': 1.7, 'spd': 0.7}, ['quake_stomp', 'flame', 'mighty_guard'], 0.08, '#c75', {'fire': 0.5}, 'orichalcum', 'proud_clod', 20,
   'HELL HOUSE from Final Fantasy VII, a small suburban house with angry eyes in the windows and a mouth in the door, with mechanical legs'),
  ('air_buster', 'エアバスター', 7, 'machine', 'attacker', {'hp': 2.0, 'str': 1.6, 'vit': 1.3, 'spd': 1.2}, ['laser', 'thunder_breath', 'self_destruct'], 0.08, '#99b', {'thunder': 2, 'poison': 0}, 'orichalcum', 'sweeper', 200,
   'AIR BUSTER from Final Fantasy VII, a bulky grey-blue flying combat robot with a cannon arm and rotor pack'),
  ('guard_scorpion', 'ガードスコーピオン', 7, 'machine', 'blocker', {'hp': 2.8, 'str': 1.5, 'vit': 1.8, 'spd': 0.8}, ['laser', 'mighty_guard', 'thunder_breath'], 0.06, '#b55', {'thunder': 2, 'poison': 0}, 'orichalcum', 'magitek_armor2', 350,
   'GUARD SCORPION from Final Fantasy VII, a large red mechanical scorpion robot with a raised tail laser'),
  ('hedgehog_pie', 'ヘッジホッグパイ', 7, 'beast', 'attacker', {'hp': 1.0, 'str': 1.1, 'mag': 1.4, 'spd': 1.3}, ['flame', 'needles', 'bite'], 0.35, '#e95', {'fire': 0.5}, 'goblin_ear', 'goblin', 20,
   'HEDGEHOG PIE from Final Fantasy VII, a small orange round imp-like creature with spiky quills and a mischievous grin'),
  ('ghost7', 'ゴースト', 7, 'undead', 'jammer', {'hp': 1.1, 'mag': 1.4, 'spd': 1.3}, ['drain_touch', 'curse', 'blind_dust'], 0.2, '#cce', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'zombie', 220,
   'GHOST from Final Fantasy VII train graveyard, a translucent pale-blue phantom with a hooded head and wispy lower body'),
  ('aps', 'アプス', 7, 'aquatic', 'blocker', {'hp': 2.4, 'str': 1.5, 'vit': 1.5, 'spd': 0.9}, ['tidal_wave', 'bite', 'aqua_breath'], 0.1, '#5a8', {'water': 0.5, 'fire': 2}, 'slime_jelly', 'sahagin', 90,
   'APS from Final Fantasy VII, a huge green sewer monster like an upright crocodile-lizard with a long tail'),
  # エリア8 アルティミシア城（FF8）
  ('tri_face', 'トライフェイス', 8, 'demon', 'jammer', {'hp': 1.6, 'mag': 1.5, 'spd': 1.2}, ['bad_breath', 'poison_breath', 'curse'], 0.12, '#8a6', {'poison': 0}, 'magicite', 'lamia', 100,
   'TRI-FACE from Final Fantasy VIII, a three-faced green plant-demon with a spiky body and a long tail'),
  ('wendigo', 'ウェンディゴ', 8, 'beast', 'attacker', {'hp': 2.2, 'str': 1.8, 'vit': 1.2, 'spd': 1.0}, ['quake_stomp', 'brave_slash_m', 'bite'], 0.12, '#ccd', {'ice': 0.5}, 'wolf_fang', 'behemoth9', 190,
   'WENDIGO from Final Fantasy VIII, a huge grey ape-like beast with a tiny head and massive arms'),
  ('abyss_worm', 'アビスウォーム', 8, 'beast', 'blocker', {'hp': 3.0, 'str': 1.5, 'vit': 1.6, 'spd': 0.6}, ['quake_stomp', 'poison_breath', 'tidal_wave'], 0.08, '#a97', {'earth': 0, 'water': 2}, 'dragon_fang', 'midgar_zolom', 60,
   'ABYSS WORM from Final Fantasy VIII, a giant sand-colored worm with a gaping circular maw and antenna'),
  ('elnoyle', 'エルノーイル', 8, 'demon', 'attacker', {'hp': 2.0, 'str': 1.6, 'mag': 1.6, 'spd': 1.2}, ['dark_wave', 'blaster', 'thunder_breath'], 0.06, '#448', {'dark': 0.5}, 'magicite', 'gargoyle', 230,
   'ELNOYLE from Final Fantasy VIII, a dark-blue winged demon with long arms and a hollow-eyed face, hunched like a gargoyle'),
  ('forbidden', 'フォービドゥン', 8, 'undead', 'attacker', {'hp': 1.8, 'str': 1.7, 'spd': 1.1}, ['brave_slash_m', 'drain_touch', 'curse'], 0.1, '#bba', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'skeleton', 40,
   'FORBIDDEN from Final Fantasy VIII, an undead skeletal knight in rusted armor wielding a large curved sword'),
  ('blitz', 'ブリッツ', 8, 'elemental', 'attacker', {'hp': 1.4, 'mag': 1.7, 'spd': 1.5}, ['thunder_breath', 'blaster', 'self_destruct'], 0.12, '#ff6', {'thunder': -1, 'earth': 2}, 'fire_shard', 'bomb', 60,
   'BLITZ from Final Fantasy VIII, a floating yellow ball of crackling electricity with a small angry face'),
  # エリア9 テラ（FF9）
  ('grand_dragon', 'グランドドラゴン', 9, 'dragon', 'attacker', {'hp': 3.0, 'str': 1.9, 'vit': 1.5, 'mag': 1.3}, ['thunder_breath', 'megaflare', 'quake_stomp'], 0.04, '#7b7', {'thunder': 0.5}, 'dragon_fang', 'yellow_dragon', 100,
   'GRAND DRAGON from Final Fantasy IX, a massive green dragon with a long neck, four legs and tattered wings'),
  ('shell_dragon', 'シールドドラゴン', 9, 'dragon', 'blocker', {'hp': 3.2, 'str': 1.5, 'vit': 2.0, 'spd': 0.6}, ['shell_guard', 'flame', 'mighty_guard'], 0.05, '#b96', None, 'dragon_fang', 'adamantoise10', 20,
   'SHELL DRAGON from Final Fantasy IX, a squat heavily armored brown dragon with a thick shell-like back'),
  ('abadon', 'アバドン', 9, 'demon', 'attacker', {'hp': 2.2, 'str': 1.6, 'mag': 1.5, 'spd': 1.2}, ['dark_flare', 'wing_attack', 'curse'], 0.06, '#636', {'dark': -1, 'holy': 2}, 'magicite', 'deathgaze', 280,
   'ABADON from Final Fantasy IX, a large purple insectoid demon with scythe-like wings and a horned head'),
  ('ash', 'アッシュ', 9, 'undead', 'jammer', {'hp': 1.5, 'mag': 1.6, 'spd': 1.2}, ['curse', 'dark_wave', 'drain_touch'], 0.1, '#998', {'holy': 2, 'dark': -1, 'poison': 0}, 'phoenix_feather', 'ghost_ship', 0,
   'ASH from Final Fantasy IX, a grey ghostly skull-faced spirit wrapped in a tattered cloak with floating hands'),
  ('iron_man', 'アイアンマン', 9, 'machine', 'blocker', {'hp': 2.8, 'str': 1.8, 'vit': 1.9, 'spd': 0.6}, ['brave_slash_m', 'mighty_guard', 'quake_stomp'], 0.05, '#889', {'thunder': 2, 'poison': 0}, 'orichalcum', 'iron_giant2', 120,
   'IRON MAN from Final Fantasy IX, a massive dark iron armored giant holding a huge sword'),
  ('mistodon', 'ミストドン', 9, 'beast', 'attacker', {'hp': 2.0, 'str': 1.7, 'spd': 1.1}, ['quake_stomp', 'bite', 'dark_wave'], 0.1, '#b9c', {'dark': 0.5}, 'dragon_fang', 'behemoth9', 60,
   'MISTODON from Final Fantasy IX, a pale purple mammoth-like beast born from mist, with tusks and glowing eyes'),
  # エリア10 ザナルカンド（FF10）
  ('defender_z', 'ディフェンダーZ', 10, 'machine', 'blocker', {'hp': 3.4, 'str': 1.7, 'vit': 2.2, 'spd': 0.6}, ['mighty_guard', 'laser', 'brave_slash_m'], 0.04, '#aab', {'thunder': 2, 'poison': 0}, 'orichalcum', 'iron_giant2', 200,
   'DEFENDER Z from Final Fantasy X, a towering blue-grey machina knight with a huge shield-like body and crossed blades'),
  ('bashura', 'バシュラ', 10, 'giant', 'attacker', {'hp': 2.6, 'str': 2.0, 'vit': 1.3, 'spd': 1.0}, ['brave_slash_m', 'quake_stomp', 'meteor_strike'], 0.06, '#c63', None, 'orichalcum', 'hecatoncheir', 350,
   'BASHURA from Final Fantasy X, a six-armed red ogre with a horned helmet, muscular and roaring'),
  ('mandragora', 'マンドラゴラ', 10, 'plant', 'jammer', {'hp': 1.8, 'mag': 1.6, 'spd': 1.1}, ['silence_song', 'bad_breath', 'self_heal'], 0.12, '#7a4', {'poison': 0, 'fire': 2}, 'slime_jelly', 'cactuar', 100,
   'MANDRAGORA from Final Fantasy X, a large green plant creature shaped like a rooted humanoid bulb with leafy arms'),
  ('fallen_monk', '堕ちた僧', 10, 'human', 'attacker', {'hp': 1.8, 'str': 1.7, 'mag': 1.4, 'spd': 1.2}, ['flame', 'brave_slash_m', 'laser'], 0.08, '#766', {'holy': 2}, 'phoenix_feather', 'soldier', 30,
   'FALLEN MONK from Final Fantasy X, a mummified undead warrior monk in dark robes holding a rifle, cloth wrapped around its head'),
  ('dark_flan', 'ダークフラン', 10, 'amorph', 'blocker', {'hp': 2.4, 'vit': 4.0, 'mag': 1.8, 'spr': 0.5, 'spd': 0.7}, ['dark_wave', 'dark_flare', 'white_wind'], 0.08, '#324', {'dark': -1, 'holy': 2, 'fire': 0.5, 'ice': 0.5}, 'slime_jelly', 'flan', 250,
   'DARK FLAN from Final Fantasy X, a tall wobbling black-purple pudding monster with a sinister face'),
  ('chimera_brain', 'キマイラブレイン', 10, 'beast', 'attacker', {'hp': 2.4, 'str': 1.7, 'mag': 1.7, 'spd': 1.1}, ['flame', 'thunder_breath', 'megaflare'], 0.05, '#a74', None, 'dragon_fang', 'griffin', 20,
   'CHIMERA BRAIN from Final Fantasy X, a chimera with a lion head, goat head, dragon head and a snake tail, in brown and gold'),
]
BASE = "16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature."
AREA_JP = {5: '次元の狭間（FF5）', 6: '瓦礫の世界（FF6）', 7: 'ミッドガル（FF7）', 8: 'アルティミシア城（FF8）', 9: 'テラ（FF9）', 10: 'ザナルカンド（FF10）'}
def shift(img, hue_deg):
    img = img.convert('RGBA'); a = img.getchannel('A'); hsv = img.convert('RGB').convert('HSV'); px = hsv.load(); w, hh = hsv.size; target = int(hue_deg * 255 / 360)
    for y in range(hh):
        for x in range(w):
            h, s, v = px[x, y]
            if v < 60: continue
            px[x, y] = ((target if s < 50 else (h + target) % 256), (110 if s < 50 else s), v)
    out = hsv.convert('RGBA'); out.putalpha(a); return out
# 1) 仮スプライト（本物が届いたら同名で上書きされる）
made = 0
for row in N:
    vid, standin, hue = row[0], row[11], row[12]
    dst = os.path.join(OUT, f'enemy_{vid}.png')
    if os.path.exists(dst): continue
    shift(Image.open(os.path.join(OUT, f'enemy_{standin}.png')), hue).save(dst); made += 1
# 2) データ
js = []
for (vid, name, area, fam, role, mult, skills, cap, color, res, mat, _s, _h, _d) in N:
    js.append({'id': vid, 'name': name, 'area': area, 'family': fam, 'role': role, 'mult': mult, 'skills': skills, 'captureRate': cap, 'color': color, 'resist': res, 'material': mat})
open(os.path.join(ROOT, 'src', 'data', 'batch7.ts'), 'w').write("// 自動生成：art/batch7_data.py（後半エリアの新規モンスター）\nexport interface NewMonster { id: string; name: string; area: number; family: string; role: string; mult: Record<string, number>; skills: string[]; captureRate: number; color: string; resist: Record<string, number> | null; material: string }\nexport const BATCH7: NewMonster[] = " + json.dumps(js, ensure_ascii=False, indent=0) + ";\n")
# 3) プロンプト
md = [f"# バッチ7：後半エリアの新規モンスター（{len(N)}枚）\n", "- クラウドの画像を参照として添付（これまでと同じ）。全部 enemy_ 名で 64×64 想定、右向き", "- 取り込むまではゲーム内では既存スプライトの色替えが仮で表示される。同名で上書きされる\n"]
cur = None
for (vid, name, area, *_r) in N:
    desc = _r[-1]
    if area != cur: cur = area; md.append(f"## エリア{area} {AREA_JP[area]}\n")
    md.append(f"### enemy_{vid}（{name}）\n```\nImage name: enemy_{vid}. Reply with this image name as the first line of your answer.\n\n{BASE}\n\nBattle sprite of a {desc}, facing RIGHT, single idle pose. Enemy sprite, no background elements. Should read clearly at 64x64 pixels. Match the exact pixel style and proportions of the attached reference sprite.\n```\n")
open(os.path.join(HERE, 'batch7.md'), 'w').write("\n".join(md))
# スプライト登録
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(N), 'monsters;', made, 'placeholder sprites;', len(names), 'registered')
