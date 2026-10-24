# 生成画像 → ゲーム用スプライト。マゼンタ透過 → トリム → 最近傍縮小 → 減色
# 使い方: python3 pipeline.py <入力> <出力> <最大幅> <最大高さ> [色数]
import sys
from PIL import Image

def chroma_key(img, key=(255, 0, 255), fuzz=90):
    img = img.convert('RGBA'); px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = abs(r - key[0]) + abs(g - key[1]) + abs(b - key[2])
            if d < fuzz: px[x, y] = (0, 0, 0, 0)
            elif d < fuzz * 2 and g < 90:  # 縁のにじみ（マゼンタ寄り）も消す
                px[x, y] = (0, 0, 0, 0)
    return img

def process(src, dst, max_w, max_h, colors=32):
    img = chroma_key(Image.open(src))
    bbox = img.getbbox()
    if bbox: img = img.crop(bbox)
    w, h = img.size
    scale = min(max_w / w, max_h / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    # 縮小は「平均」で情報を残してから、最近傍で確定させる（細いアウトラインが消えにくい）
    small = img.resize((nw, nh), Image.BOX)
    alpha = small.getchannel('A').point(lambda a: 255 if a > 110 else 0)
    rgb = small.convert('RGB').quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
    rgb.putalpha(alpha)
    # 透明領域をトリム
    bb = rgb.getbbox()
    if bb: rgb = rgb.crop(bb)
    rgb.save(dst)
    return rgb.size

if __name__ == '__main__':
    src, dst, mw, mh = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    colors = int(sys.argv[5]) if len(sys.argv) > 5 else 32
    print(dst, process(src, dst, mw, mh, colors))
