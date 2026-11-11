# Business Slides Skill

**[dom-to-pptx](https://github.com/atharva9167j/dom-to-pptx) を利用し、HTMLで設計したスライドを編集可能なPowerPoint（.pptx）へ変換するスキルです。**

本スキルは構成・デザイン・会社別マスタ・検証手順を提供し、PowerPointへの変換は `dom-to-pptx` が担います。69種類の構成見本を収録し、13:9・16:9に対応します。

[インタラクティブ・ギャラリー](https://shunsukeaihara.github.io/business-slides-skill/)

## 見本

`assets/gallery.html` をブラウザで開くと、用途検索、比率切り替え、入力JSONの確認ができます。

- 比較・カラム・入れ子見出し・分類
- 工程・時系列・作業と成果物
- 因果・関係・組織・共通基盤
- 棒・折れ線・構成比・分布・ポートフォリオ

数値と文面はすべて例示です。実際の業務データではありません。

## 必要なスキルと変換エンジン

PowerPointを作成する場合は、次の両方を利用します。

- **`business-slides`（本スキル）**：情報の構成、マスタ、レイアウト、HTML生成、画像検証、必要に応じた編集構造の補正。
- **`dom-to-pptx-skill` と `dom-to-pptx` の実行環境**：HTMLから編集可能なPPTXへの変換。別途用意し、同スキルの制作・変換手順に従ってください。

変換エンジンやそのスキルは、このリポジトリには同梱していません。ギャラリーの閲覧とHTML生成だけなら、PowerPoint変換環境は不要です。

制作の流れは **内容の整理 → HTML生成 → 画像確認 → dom-to-pptxで変換 → PPTXの画像・編集構造確認** です。具体的な変換コマンドと補正手順は[制作手順](references/production.md)を参照してください。

## 使い方

このフォルダをスキルとして配置し、`SKILL.md` を参照してください。PowerPointへの変換には、別途 `dom-to-pptx-skill` と対応する実行環境が必要です。変換エンジン本体はこのリポジトリには含みません。

HTML生成はNode.js標準ライブラリだけで実行できます。

```sh
node scripts/build_html.mjs \
  --master masters/neutral/master.json \
  --data assets/pattern-examples.json \
  --aspect 16:9 \
  --out output/gallery.html
```

同じ出力先を更新する場合は `--overwrite yes` を追加します。

## ディレクトリ

- `masters/neutral/`：汎用マスタと架空のCOMPANYロゴ
- `references/`：構成の選択、配列、階層、文字、編集構造のルール
- `assets/`：ギャラリー、HTML見本、入力JSON、検査用JS
- `scripts/`：生成、画像取得、PowerPointの構造補正

会社固有のマスタや元の参考資料は同梱しません。個別の会社マスタは公開リポジトリの外で管理し、`--master` で指定してください。

## 検証環境

画像取得にはPuppeteerとChrome等のブラウザ、PowerPoint構造補正にはPython 3とlxml、サムネイル生成にはPillowを使用します。導入手順と変換コマンドは `references/production.md` を参照してください。

フォントは同梱していません。マスタの英文・日本語フォントを利用環境に合わせて指定し、変換後の文字組みを確認してください。チャート見本は編集可能な図形であり、Excel連動のネイティブチャートではありません。

## 新しい構成を追加するとき

見本の外観だけでなく、伝える関係と使い分けを定義します。両比率のHTMLと変換後のPowerPointを画像で確認してください。元の例示文面を実績として使わないでください。

## インタラクティブな公開ギャラリー

GitHub Pagesで検索・カテゴリ絞り込み・画面比率切り替え・入力JSONの表示とコピーが利用できます。

1. GitHubリポジトリの Settings → Pages → Source で **GitHub Actions** を選択。
2. `main` にpushするか、Actionsの **Publish interactive gallery** を手動実行。
3. デプロイ結果のURLを開く。

`main` の更新に合わせて自動デプロイします。ローカルで同じ公開用サイトを確認する場合：

```sh
node scripts/build_pages.mjs
python3 -m http.server 8000 --directory _site
```

`http://localhost:8000/` を開きます。公開するファイルはギャラリーと構成の説明に限定し、会社別マスタ・元資料・検証ファイルは含めません。スライド本文やサムネイルを変更した場合は、HTMLと画像の検証・再生成を済ませてからコミットしてください。Pagesのワークフローは変換環境を必要とせず、確認済みの見本を配信します。

[GitHub Pagesの公式手順](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
