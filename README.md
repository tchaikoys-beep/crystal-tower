# クリスタルタワー（コアプロトタイプ）

遊ぶ: https://tchaikoys-beep.github.io/crystal-tower/ （iPhoneはSafariで開いて「ホーム画面に追加」）

企画書: https://claude.ai/artifact/CHBCtzkeXHMcjbsQ4TFbAw

- `npm run dev` 開発サーバ / `npm run build` ビルド（dist/）
- `npm run sim [転生回数] [上限階]` バランス用の自動周回シミュレータ
- `npm run typecheck`

## 構成
- `src/core/` ゲームロジック（描画非依存）: formulas.ts に全スケーリング式、battle.ts がATB戦闘、game.ts が進行
- `src/data/` データ定義（英雄・ジョブ・魔法・装備・付加・敵・エリア・ロウ・転生ボード）
- `src/ui/` DOM＋Canvasの画面
- `src/sim/` シミュレータ

## バランス確認
`npm run sim 5 1000` で5回転生・1000階上限の自動周回。同じ階で4回全滅したら周回終了。
- `npx tsx e2e/ugtest.ts` 裏タワー・超ボスのロジック確認

## BGM の差し替え
`public/bgm/` に `title.mp3` `hub.mp3` `battle.mp3` `boss.mp3` `chaos.mp3`（または .ogg）を置くと、合成曲の代わりにそのファイルをループ再生する。ファイルがない曲は合成曲のまま。権利のある音源は自分で用意すること。
