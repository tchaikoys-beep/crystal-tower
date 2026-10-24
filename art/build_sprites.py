# incoming/ と dl2/unz/batch1 等の画像を一括処理して public/sprites/ に出力し、登録ファイルを生成する
import sys, os, glob, json
sys.path.insert(0, os.path.dirname(__file__))
from pipeline import process
from PIL import Image

SRC_DIRS = sys.argv[1:] or ['incoming']
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sprites')
os.makedirs(OUT, exist_ok=True)
RULES = {  # prefix: (max_w, max_h, colors)
    'hero_': (40, 48, 32), 'enemy_': (64, 64, 32), 'boss_': (112, 112, 48), 'icon_': (24, 24, 16), 'face_': (48, 48, 32), 'el_': (16, 16, 12), 'st_': (16, 16, 12),
}
done = {}
for d in SRC_DIRS:
    for f in sorted(glob.glob(os.path.join(d, '**', '*.png'), recursive=True) + glob.glob(os.path.join(d, '**', '*.webp'), recursive=True)):
        name = os.path.splitext(os.path.basename(f))[0]
        rule = next((r for p, r in RULES.items() if name.startswith(p)), None)
        if not rule: continue
        if name.startswith('bg_'): continue
        out = os.path.join(OUT, name + '.png')
        size = process(f, out, *rule)
        done[name] = size
        print(name, size)
# 背景は別処理（256x224にフィット）
for d in SRC_DIRS:
    for f in sorted(glob.glob(os.path.join(d, '**', 'bg_*.*'), recursive=True)):
        name = os.path.splitext(os.path.basename(f))[0]
        img = Image.open(f).convert('RGB').resize((256, 224), Image.BOX).quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
        img.save(os.path.join(OUT, name + '.png')); done[name] = (256, 224); print(name, (256, 224))
# 登録ファイル
names = sorted(os.path.splitext(f)[0] for f in os.listdir(OUT) if f.endswith('.png'))
ts = "// 自動生成：art/build_sprites.py\nexport const SPRITE_FILES: string[] = " + json.dumps(names, ensure_ascii=False, indent=0) + ";\n"
open(os.path.join(os.path.dirname(__file__), '..', 'src', 'ui', 'spriteList.ts'), 'w').write(ts)
print(len(names), 'sprites registered')
# QA用コンタクトシート
ims = [(n, Image.open(os.path.join(OUT, n + '.png'))) for n in names if not n.startswith('bg_')]
S = 2; cols = 8; cell = 120
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * cell, rows * cell), (16, 26, 58, 255))
from PIL import ImageDraw
dr = ImageDraw.Draw(sheet)
for i, (n, im) in enumerate(ims):
    x, y = (i % cols) * cell, (i // cols) * cell
    sc = min(S, (cell - 24) / max(im.width, im.height))
    big = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.NEAREST)
    sheet.alpha_composite(big, (x + (cell - big.width) // 2, y + (cell - 20 - big.height) // 2))
    dr.text((x + 2, y + cell - 14), n[:18], fill=(200, 210, 255, 255))
sheet.save(os.path.join(os.path.dirname(__file__), 'contact_sheet.png'))
print('sheet', sheet.size)
