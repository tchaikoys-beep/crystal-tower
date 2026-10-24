# ドット絵生成プロンプト（ChatGPTの画像生成にそのまま貼る）

## 共通ルール
- 1回のチャットで最初に「スタイル見本」を1枚作り、以降は毎回その画像を添付して「この見本とまったく同じピクセルスタイル・等身で」と添える
- 1プロンプト1体。出力は4枚出して1枚選ぶ
- 背景はマゼンタ単色（後でこちらで透過にする）

## 共通スタイル文（全プロンプトの先頭に置く）
```
16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature.
```

## テスト3枚

### 1. クラウド（戦闘スプライト・待機）
```
16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature.

Side-view battle sprite of CLOUD STRIFE from Final Fantasy VII, chibi 2.5-head proportion, spiky blond hair, dark purple sleeveless turtleneck, one steel shoulder pauldron on the left shoulder, brown belt and boots, a huge wide broadsword carried on his back, facing LEFT, idle battle stance with knees slightly bent, full body, feet visible. The whole character should read clearly when shrunk to 32x48 pixels.
```

### 2. ボム（敵スプライト）
```
16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG battle sprites, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark, no signature.

Battle sprite of a BOMB monster from Final Fantasy: a sphere of orange and yellow flame with an angry grinning face, two small flame arms, a trail of fire on top, facing RIGHT, single idle pose, menacing but cartoonish. Enemy sprite, no background elements. Should read clearly at 64x64 pixels.
```

### 3. ポーション（アイテムアイコン）
```
16-bit SNES-era JRPG pixel art in the style of mid-1990s Japanese RPG item icons, limited 16-color palette, crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, 1-pixel dark outline, flat solid magenta background (#FF00FF), subject centered with margin, no text, no watermark.

Inventory icon of a small round glass potion flask with a cork, glowing blue liquid with a single white highlight, single object, bold silhouette readable at 24x24 pixels.
```

## 量産用テンプレ
- 英雄：`Side-view battle sprite of {キャラ名} from Final Fantasy {作品番号}, {見た目の説明}, chibi 2.5-head proportion, facing LEFT, pose: {idle stance | sword swing attack | casting magic with one hand raised | taking damage recoil | victory pose}. Full body, feet visible.`
- 敵：`Battle sprite of a {モンスター名} monster from Final Fantasy, {見た目の説明}, facing RIGHT, single idle pose. Enemy sprite, no background elements.`
- ボス：`Large boss battle sprite of {ボス名} from Final Fantasy {作品番号}, {見た目の説明}, facing RIGHT, dramatic pose, occupies most of the canvas, intricate but readable at small size.`
- アイコン：`Inventory icon of {アイテムの説明}, single object, bold silhouette readable at 24x24 pixels.`
- 顔グラ：`Portrait bust of {キャラ名} from Final Fantasy {作品番号}, {見た目の説明}, head and shoulders only, facing slightly left, menu portrait style.`
- 背景：共通スタイル文から magenta background を外して `Wide JRPG battle background, 256x224 aspect, {場所の説明}, no characters, no enemies, no UI.`

## 命名
画像はこの名前で送ってくれると組み込みが速い：`hero_{id}_{idle|attack|cast|hurt|win}`、`enemy_{id}`、`boss_{id}`、`icon_{id}`、`face_{id}`、`bg_area{n}`

## 受け取り方
できた画像をそのままこの作業フォルダ（crystal-tower/art/incoming/）に入れるか、チャットに添付してくれれば、こちらで透過・縮小・減色して組み込む。
