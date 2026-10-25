# 色違い・上位種の生成：既存スプライトを色相シフトして public/sprites に書き出し、src/data/variants.ts を出力する
# 使い方: python3 art/variants.py
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
OUT = os.path.join(ROOT, 'public', 'sprites')
# (base, id, 名前, 色相シフト(度), 明度倍率, 追加技, 耐性, 補正)
V = [
  # エリア1
  ('goblin', 'goblin_guard', 'ゴブリンガード', 200, 1.0, 'shell_guard', None, {'vit': 1.4}),
  ('wolf', 'warg', 'ワーグ', 30, 0.8, 'blind_dust', None, {'str': 1.15}),
  ('bomb', 'balloon', 'バルーン', 60, 1.1, 'self_destruct', {'fire': -1, 'wind': 2}, {'spd': 1.3}),
  ('skeleton', 'bone_knight', 'ボーンナイト', 210, 0.9, 'brave_slash_m', {'holy': 2, 'dark': -1}, {'str': 1.3, 'vit': 1.3}),
  ('pudding', 'yellow_jelly', 'イエロージェリー', 300, 1.15, 'thunder_breath', {'thunder': -1, 'earth': 2}, {'mag': 1.3}),
  ('sahagin', 'sahagin_chief', 'サハギンチーフ', 300, 0.95, 'aqua_breath', {'water': -1, 'thunder': 2}, {'str': 1.2}),
  ('zombie', 'ghoul', 'グール', 90, 0.85, 'curse', {'holy': 2, 'poison': 0}, {'spd': 1.4}),
  ('cactuar', 'gigantuar', 'ギガンタウアー', 25, 0.72, 'needles', None, {'hp': 2.5, 'str': 1.3}),
  ('coeurl', 'coeurl_cat', 'クアールキャット', 180, 1.1, 'blaster', None, {'spd': 1.2}),
  ('tonberry', 'master_tonberry', 'マスタートンベリ', 210, 0.75, 'grudge', None, {'hp': 1.8, 'str': 1.3}),
  ('unicorn', 'nightmare', 'ナイトメア', 180, 0.6, 'dark_wave', {'dark': -1, 'holy': 2}, {'mag': 1.3}),
  ('chocobo', 'red_chocobo', '赤チョコボ', 330, 1.0, 'quake_stomp', None, {'str': 1.3}),
  # エリア2
  ('adamantoise', 'land_turtle', 'ランドタートル', 100, 1.05, 'quake_stomp', {'earth': 0}, {'vit': 1.3}),
  ('flan', 'black_flan', 'ブラックフラン', 0, 0.45, 'dark_wave', {'dark': -1, 'holy': 2}, {'mag': 1.3}),
  ('silver_wolf', 'fenrir', 'フェンリル', 210, 1.0, 'ice_breath', {'ice': -1, 'fire': 2}, {'str': 1.25, 'spd': 1.1}),
  ('black_goblin', 'goblin_mage', 'ゴブリンメイジ', 260, 1.0, 'mind_blast', None, {'mag': 1.8}),
  ('lamia', 'lamia_dancer', 'ラミアダンサー', 60, 1.05, 'sleep_gas', None, {'spd': 1.3}),
  ('mindflayer', 'piscodemon', 'ピスコディーモン', 120, 0.9, 'curse', {'water': 0.5}, {'mag': 1.3}),
  ('malboro', 'malboro_bud', 'モルボルの芽', 60, 1.15, 'poison_breath', {'poison': 0}, {'hp': 0.8, 'spd': 1.3}),
  # エリア3
  ('gargoyle', 'gargoyle_lord', 'ガーゴイルロード', 40, 0.9, 'stone_gaze', {'earth': 0, 'wind': 0.5}, {'str': 1.3}),
  ('griffin', 'hippogriff', 'ヒポグリフ', 150, 1.0, 'blind_dust', None, {'spd': 1.3}),
  ('medusa', 'gorgon', 'ゴーゴン', 280, 0.9, 'curse', None, {'mag': 1.3}),
  ('vampire', 'vampire_lord', 'ヴァンパイアロード', 220, 0.9, 'dark_flare', {'holy': 2, 'dark': -1}, {'mag': 1.4}),
  ('hecatoncheir', 'gigas', 'ギガース', 120, 1.0, 'quake_stomp', None, {'str': 1.3}),
  ('dragon_zombie', 'bone_dragon', 'ボーンドラゴン', 180, 1.25, 'ice_breath', {'holy': 2, 'ice': 0.5, 'poison': 0}, {'vit': 1.3}),
  ('lamia_queen', 'lamia_empress', 'ラミアエンプレス', 150, 1.0, 'silence_song', None, {'mag': 1.3}),
  # エリア4
  ('magitek_armor', 'armored_weapon', 'アーマードウェポン', 120, 1.0, 'laser', {'thunder': 2, 'poison': 0}, {'str': 1.3}),
  ('proto_armor', 'crusher', 'クラッシャー', 300, 0.9, 'quake_stomp', {'thunder': 2, 'poison': 0}, {'str': 1.35}),
  ('behemoth', 'dark_behemoth', 'ダークベヒーモス', 180, 0.55, 'dark_flare', {'dark': -1}, {'mag': 1.4}),
  ('blue_dragon', 'ice_dragon', 'アイスドラゴン', 30, 1.2, 'ice_breath', {'ice': -1, 'fire': 2}, {'mag': 1.3}),
  ('yellow_dragon', 'green_dragon', 'グリーンドラゴン', 60, 1.0, 'poison_breath', {'poison': 0, 'wind': 0.5}, {'vit': 1.2}),
  ('guardian', 'sentinel', 'センチネル', 200, 1.0, 'mighty_guard', {'thunder': 2, 'poison': 0}, {'vit': 1.3}),
  ('moon_flayer', 'lunar_sage', 'ルナセージ', 100, 1.1, 'holy_light', {'holy': 0.5}, {'mag': 1.3}),
  # エリア5
  ('ahriman', 'evil_eye', 'イビルアイ', 140, 1.0, 'stone_gaze', None, {'mag': 1.3}),
  ('iron_giant', 'mithril_golem', 'ミスリルゴーレム', 190, 1.15, 'mighty_guard', {'thunder': 2}, {'vit': 1.4}),
  ('great_malboro', 'oscar', 'オスカー', 90, 1.0, 'sleep_gas', {'poison': 0}, {'hp': 1.3}),
  ('jabotender', 'jumbo_cactuar', 'ジャンボサボテン', 300, 1.0, 'needles', None, {'hp': 2.0}),
  ('deathgaze', 'doom_gaze', 'ドゥームゲイズ', 200, 0.8, 'gravija', {'dark': -1}, {'mag': 1.3}),
  # エリア6
  ('tyrannosaur', 'allosaurus', 'アロサウルス', 150, 1.0, 'bite', None, {'spd': 1.3}),
  ('doom_dragon', 'skull_dragon', 'スカルドラゴン', 200, 1.3, 'poison_breath', {'holy': 2, 'poison': 0}, {'vit': 1.3}),
  ('brachiosaur', 'brachio_rex', 'ブラキオレックス', 320, 0.9, 'meteor_strike', None, {'hp': 1.4}),
  ('cherry', 'cherry_blossom', 'サクラ', 300, 1.15, 'silence_song', None, {'mag': 1.3}),
  # エリア7
  ('soldier', 'soldier_2nd', 'ソルジャー2nd', 120, 0.95, 'brave_slash_m', None, {'str': 1.3}),
  ('guard_hound', 'dark_nation', 'ダークネイション', 200, 0.7, 'shell_guard', None, {'mag': 1.3}),
  ('sweeper', 'custom_sweeper', 'カスタムスイーパー', 300, 1.0, 'laser', {'thunder': 2}, {'str': 1.3}),
  ('midgar_zolom', 'sea_worm', 'シーワーム', 150, 1.0, 'tidal_wave', {'water': -1, 'thunder': 2}, {'hp': 1.3}),
  ('ghost_ship', 'phantom_ship', 'ファントムシップ', 240, 1.1, 'curse', {'holy': 2, 'dark': -1}, {'mag': 1.3}),
  # エリア8
  ('grendel', 'anacondaur', 'アナコンダウル', 120, 1.0, 'poison_breath', {'poison': 0}, {'str': 1.2}),
  ('imp8', 'gayla', 'ゲイラ', 120, 1.1, 'thunder_breath', {'thunder': -1}, {'spd': 1.3}),
  ('ruby_dragon', 'hexadragon', 'ヘキサドラゴン', 120, 1.0, 'poison_breath', {'poison': 0, 'fire': 0.5}, {'str': 1.3}),
  ('iron_giant2', 'iron_giant_mk2', 'アイアンジャイアント改', 60, 1.0, 'brave_slash_m', None, {'str': 1.3, 'vit': 1.2}),
  ('torama', 'torama_lord', 'トラマロード', 280, 0.9, 'blaster', None, {'mag': 1.3}),
  # エリア9
  ('ring_leader', 'amdusias', 'アムドゥスキアス', 250, 1.0, 'thunder_breath', {'thunder': -1}, {'mag': 1.3}),
  ('gargant', 'gargant_queen', 'ガルガント女王', 320, 1.0, 'poison_breath', {'poison': 0}, {'hp': 1.4}),
  ('mover', 'mover_x', 'ムーバーX', 120, 1.0, 'self_destruct', None, {'spd': 1.4}),
  ('yan', 'yan_lord', 'ヤーンロード', 180, 1.0, 'mighty_guard', None, {'hp': 1.5, 'vit': 1.3}),
  # エリア10
  ('sinscale', 'sinspawn', 'シンスポーン', 180, 1.0, 'aqua_breath', {'water': 0.5}, {'str': 1.3}),
  ('fafnir', 'nidhogg', 'ニーズヘッグ', 200, 0.8, 'dark_flare', {'dark': -1, 'holy': 2}, {'mag': 1.4}),
  ('great_malboro10', 'malboro_menace', 'モルボルメナス', 90, 1.0, 'bad_breath', {'poison': 0}, {'hp': 1.4}),
  ('varuna', 'vidatu', 'ヴィダトゥ', 120, 1.0, 'holy_light', {'holy': 0.5}, {'mag': 1.3}),
  ('nova_dragon_whelp', 'nova_dragon', 'ノヴァドラゴン', 40, 1.1, 'megaflare', None, {'hp': 1.6, 'str': 1.3}),
]
def shift(img, hue_deg, val_mul):
    # 色相シフト。灰色っぽい（彩度の低い）ピクセルはシフトしても変わらないので、目標色相で染める
    img = img.convert('RGBA'); a = img.getchannel('A')
    hsv = img.convert('RGB').convert('HSV'); px = hsv.load(); w, hh = hsv.size
    target = int(hue_deg * 255 / 360)
    for y in range(hh):
        for x in range(w):
            h, s, v = px[x, y]
            if v < 60: nv = max(0, min(255, int(v * val_mul))); px[x, y] = (h, s, nv); continue  # 輪郭・影はそのまま
            if s < 50: h2 = target; s2 = 120 if v > 90 else 80
            else: h2 = (h + target) % 256; s2 = s
            px[x, y] = (h2, s2, max(0, min(255, int(v * val_mul))))
    out = hsv.convert('RGBA'); out.putalpha(a)
    return out
made = []
for base, vid, name, hue, vm, skill, res, mult in V:
    src = os.path.join(OUT, f'enemy_{base}.png')
    if not os.path.exists(src): print('missing base sprite', base); continue
    shift(Image.open(src), hue, vm).save(os.path.join(OUT, f'enemy_{vid}.png'))
    made.append({'base': base, 'id': vid, 'name': name, 'skill': skill, 'resist': res, 'mult': mult, 'hue': hue})
ts = "// 自動生成：art/variants.py（色違い・上位種）\nexport interface VariantDef { base: string; id: string; name: string; skill: string; resist: Record<string, number> | null; mult: Record<string, number>; hue: number }\nexport const VARIANTS: VariantDef[] = " + json.dumps(made, ensure_ascii=False, indent=0) + ";\n"
open(os.path.join(ROOT, 'src', 'data', 'variants.ts'), 'w').write(ts)
# スプライト登録を更新
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(made), 'variants;', len(names), 'sprites registered')
