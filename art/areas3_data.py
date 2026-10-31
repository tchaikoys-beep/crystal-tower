# 1601〜2000階「裏巡」エリア17〜20：既存の敵・ボスの再登場（プロンプト不要）。生成物 src/data/areas3.ts と新ボス4体の色替えスプライト
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'public', 'sprites')
def shift(img, hue_deg, vm=1.0):
    img = img.convert('RGBA'); a = img.getchannel('A'); hsv = img.convert('RGB').convert('HSV'); px = hsv.load(); w, hh = hsv.size; target = int(hue_deg * 255 / 360)
    for y in range(hh):
        for x in range(w):
            h, s, v = px[x, y]
            if v < 60: continue
            px[x, y] = ((target if s < 50 else (h + target) % 256), (110 if s < 50 else s), max(0, min(255, int(v * vm))))
    out = hsv.convert('RGBA'); out.putalpha(a); return out
# 再臨ボス（元ボスのスプライトをそのまま使う：エイリアス）
EX = {  # area -> boss id
  1: 'garland', 3: 'cloud_of_darkness', 4: 'zeromus', 5: 'exdeath', 6: 'kefka', 7: 'sephiroth', 8: 'ultimecia', 9: 'kuja', 10: 'sin',
  11: 'shadow_lord', 12: 'the_undying', 13: 'orphan', 14: 'bahamut_prime', 15: 'ardyn', 16: 'ultima16',
}
# 新ボス（色替え）: id, 名前, 元, 色相, 明度, 技, 耐性, 倍率
NEW = [
  ('chaos', 'カオス', 'garland', 330, 0.9, ['dark_flare', 'megaflare', 'tidal_wave', 'quake_stomp'], {'dark': 0, 'fire': 0.5}, {'hp': 22, 'str': 2.1, 'vit': 1.8, 'mag': 2.1, 'spr': 1.7, 'spd': 1.3}),
  ('neo_exdeath', 'ネオエクスデス', 'exdeath', 200, 0.8, ['ultima_blast', 'gravija', 'dark_flare', 'heartless_angel'], {'dark': 0, 'holy': 1.5}, {'hp': 25, 'str': 2.0, 'vit': 1.9, 'mag': 2.4, 'spr': 1.9, 'spd': 1.3}),
  ('necron', 'ネクロン', 'kuja', 220, 1.1, ['ultima_blast', 'holy_light', 'gravija', 'curse'], {'holy': 0.5, 'dark': 0.5}, {'hp': 27, 'str': 2.0, 'vit': 2.0, 'mag': 2.5, 'spr': 2.0, 'spd': 1.4}),
  ('zodiark', 'ゾディアーク', 'zeromus', 270, 0.7, ['dark_flare', 'ultima_blast', 'megaflare', 'gravija'], {'dark': -1, 'holy': 1.5}, {'hp': 30, 'str': 2.2, 'vit': 2.1, 'mag': 2.6, 'spr': 2.1, 'spd': 1.4}),
]
AREAS = [
  dict(id=17, name='記憶の回廊・序', motif='裏巡 FF1〜4', floors=[1601, 1700], pool=['bone_knight', 'master_tonberry', 'nightmare', 'fenrir', 'goblin_mage', 'gorgon', 'vampire_lord', 'bone_dragon', 'dark_behemoth', 'ice_dragon', 'sentinel', 'lunar_sage'], mids=[1, 3, 4], boss='chaos', bg=1),
  dict(id=18, name='記憶の回廊・破', motif='裏巡 FF5〜8', floors=[1701, 1800], pool=['mithril_golem', 'oscar', 'doom_gaze', 'skull_dragon', 'allosaurus', 'soldier_2nd', 'custom_sweeper', 'guard_scorpion', 'hexadragon', 'iron_giant_mk2', 'elnoyle', 'forbidden'], mids=[5, 6, 7, 8], boss='neo_exdeath', bg=5),
  dict(id=19, name='記憶の回廊・急', motif='裏巡 FF9〜12', floors=[1801, 1900], pool=['amdusias', 'gargant_queen', 'yan_lord', 'grand_dragon', 'nidhogg', 'malboro_menace', 'nova_dragon', 'corse', 'wyvern11', 'elder_wyrm', 'skull_defender', 'garchimacera'], mids=[9, 10, 11, 12], boss='necron', bg=9),
  dict(id=20, name='終焉の間', motif='裏巡 FF13〜16', floors=[1901, 2000], pool=['cie_th', 'manasvin', 'behemoth13', 'voidsent', 'ascian_shade', 'red_giant', 'ronin', 'bandersnatch', 'akashic_soldier', 'chimera16', 'adamantoise16', 'aevis'], mids=[13, 14, 15, 16], boss='zodiark', bg=16),
]
mons = []; alias = {}
for area, bid in EX.items():
    mons.append({'id': bid + '_ex', 'base': bid, 'name': None, 'exMult': {'hp': 1.8, 'str': 1.3, 'vit': 1.3, 'mag': 1.3, 'spr': 1.3, 'spd': 1.15}})
    alias[bid + '_ex'] = bid
for (nid, name, base, hue, vm, skills, res, mult) in NEW:
    dst = os.path.join(OUT, f'boss_{nid}.png')
    if not os.path.exists(dst): shift(Image.open(os.path.join(OUT, f'boss_{base}.png')), hue, vm).save(dst)
    mons.append({'id': nid, 'name': name, 'family': 'boss', 'role': 'attacker', 'mult': mult, 'skills': skills, 'resist': res, 'color': '#a3c', 'boss': True})
areas = []
for a in AREAS:
    areas.append({'id': a['id'], 'name': a['name'], 'motif': a['motif'], 'floors': a['floors'], 'subs': [{'floors': [a['floors'][0], a['floors'][0] + 49], 'pool': a['pool'][:7]}, {'floors': [a['floors'][0] + 50, a['floors'][1]], 'pool': a['pool'][5:]}], 'midBosses': [EX[m] + '_ex' for m in a['mids']], 'boss': a['boss'], 'itemPool': [], 'key': 'orichalcum', 'bgOf': a['bg']})
open(os.path.join(ROOT, 'src', 'data', 'areas3.ts'), 'w').write("// 自動生成：art/areas3_data.py（1601〜2000階 裏巡エリア17〜20）\nexport const MONSTERS3: any[] = " + json.dumps(mons, ensure_ascii=False, indent=0) + ";\nexport const AREAS3: any[] = " + json.dumps(areas, ensure_ascii=False, indent=0) + ";\nexport const SPRITE_ALIAS: Record<string, string> = " + json.dumps(alias, ensure_ascii=False) + ";\n")
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
open(os.path.join(ROOT, 'src', 'ui', 'spriteList.ts'), 'w').write("// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n")
print(len(mons), 'bosses;', len(areas), 'areas;', len(names), 'registered')
