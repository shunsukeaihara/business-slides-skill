# HTML制作・PPTX編集構造・検証

## 前提と制作ルート

`dom-to-pptx-skill` を読み、HTMLからPPTXを作る手順を使う。このスキルは独立したデザイン仕様と素材を持つが、変換エンジンを再実装・同梱しない。元テンプレートや参考PDFは不要。

通常の依存ライブラリは実行環境に必要。`dom-to-pptx-exporter` とそのブラウザ環境に加え、補助検査CLIはPuppeteer、構造補正はPythonのlxmlを使う。既存の利用可能な依存関係を優先する。インストールが必要なら環境の権限に従い、依存関係があるかのように見せない。

## HTMLの用意

最初に[会社別マスタ](masters.md)を選ぶ。`scripts/build_html.mjs`にマスタ・比率・データを渡してHTMLを生成する。見本のJSONを編集して使える。手作業で拡張する場合も会社別の色・書体・ロゴはマスタ由来のCSS変数と素材を使う。`assets/slide-base.html`／`slide-base-wide.html`は生成済みの出発点であり、マスタ設定の正本ではない。

```sh
node SKILL_DIR/scripts/build_html.mjs --master SKILL_DIR/masters/neutral/master.json --aspect 16:9 --data WORK_DIR/content.json --out WORK_DIR/deck.html
```

データ形式は`assets/pattern-examples.json`を参照。実装済みパターンは[ギャラリー](gallery.md)を参照。`contentWidth`には`standard`または`wide`を指定する。見本JSONは各パターンの入力例でもある。カタログに記載されていても、見本JSONにない構成は内容に合わせてHTMLで制作する。

画像は出力先へコピーされ、相対参照になる。元マスタのロゴはマスタディレクトリからの相対パス。特定の端末の絶対パスに依存させない。

- `.slide` は13:9なら1040×720px、16:9なら1280×720px。座標・寸法を明示する。
- 通常の文字箱は `.box` と `data-slide-native="box"`。文字を直接の子`p`として持つ。
- 箇条書きは `data-slide-native="list"` の領域内に1つの`ul`と複数の`li`を置く。
- リストを箱に入れる場合は、箱とリストを入れ子の別マーカーにせず、外側の箱だけをマークする。
- 異なるサイズ・揃えの独立要素を重ねる矢羽などは、この単純コンテナのマーカーを付けず個別配置する。
- 構造補正の対象は単純な`p`または1階層のリスト。画像・アイコン・ネストしたリスト・複雑なインライン書式を含めない。その場合は編集要件を保った個別実装と検証を行う。
- 日本語書体を明示的に選べる環境では`body`の`data-slide-japanese-font`に利用可能な書体名を指定する。未指定時の補正はArialのフォント代替を利用するため、最終描画で日本語を必ず確認する。

## 検査と変換

以下の`SKILL_DIR`、`WORK_DIR`等は説明用の記号であり、実際のパスへ置き換える。特定のユーザー名やインストール場所を前提にしない。

1. ブラウザ上で`slide-layout.js`を読み込む。`window.slideCollect()`から構造情報と検査結果を取得する。CLIで画像とJSONを保存する場合：

```sh
node SKILL_DIR/scripts/inspect_html.mjs --html WORK_DIR/deck.html --out WORK_DIR/qa --modules-dir PATH_TO_NODE_MODULES --browser PATH_TO_CHROME
```

`--modules-dir`はPuppeteerのある`node_modules`。通常の解決で見つかる場合は省略可。`--browser`はPuppeteerの既定ブラウザが使える場合は省略可。CLIを使わず利用可能なブラウザ操作環境で同じ関数を実行してもよい。

2. HTML画像を目視確認。`layout.json`の`issues`を解消する。検査ははみ出し等の補助であり、内容や美観の合格証明ではない。
3. `dom-to-pptx` スキルの検証も行い、同スキルのCLIで出力する。例えば：

```sh
dom-to-pptx-exporter WORK_DIR/deck.html --output WORK_DIR/raw.pptx --width 10.833333333333 --height 7.5 --bw 1040 --bh 720 --no-pseudo
```

16:9の場合は`--width 13.333333333333 --height 7.5 --bw 1280 --bh 720`とする。補正処理はHTMLの寸法とPPTXの実寸の一致を検査する。`data-slide-shape="chevron"`付きの矢羽は、矩形化した背景をPowerPointのネイティブ矢羽図形へ補正する。

実際のコマンド名・起動方法は導入済みの `dom-to-pptx` に合わせる。上記は必要なサイズ指定を示すもの。

4. 書き出された図形が箱と文字を分離している場合は、明示したコンテナを補正する：

```sh
python3 SKILL_DIR/scripts/normalize_pptx.py --input WORK_DIR/raw.pptx --layout WORK_DIR/qa/layout.json --output WORK_DIR/editable.pptx
```

通常の箱は1図形＋内部テキスト、リストは1テキスト要素＋箇条書き段落になる。余白・揃え・行間も設定する。マークされていない矢羽や画像は触らない。出力先が存在する場合は停止する。ユーザーが上書きを許可した対象だけ`--overwrite`を使う。

内容や幾何が曖昧な場合は誤ったオブジェクト削除を避けるため停止する。マーカーの範囲やHTMLを修正して再出力し、検査を無効化して通さない。補正後のPPTXが最終検証の対象となる。

## 最終PPTXの検証

利用可能なPowerPoint描画環境、LibreOffice経由のPDF、またはプレゼンテーション描画ライブラリで全ページを画像化する。HTMLのスクリーンショットをPPTX検証の代わりにしない。SVGの矢羽・三角形・線が欠ける、折れ線が点からずれる等の差があれば、別の描画環境で原因を切り分ける。出力側の欠落ならネイティブ図形や線で置き換えて再検証する。描画器側の制約を含め、未解消の差がある出力を検証済みとして渡さない。

- 中央配置：図・表・カラムの実効幅を基準に、左右の余白を両比率で確認する。透明なテキスト箱の空白を含めた幾何判定だけでは合格としない。右余白が大きい場合は末端の文字領域を必要幅に絞り、図全体を中央へ再配置する。
- 見た目：切れ・重なり・短い最終行・改行・中央揃え・箱間余白・見出し線・フッターを確認。
- 編集構造：通常の箱は内部テキストと余白を持つ単一図形。記号だけのテキストはなく、箇条書きは`a:buChar`等の段落属性。画像化した本文や文字列に埋めた疑似記号ではない。
- 変換の保持：補正していない図・画像・矢羽・リンク等が失われていない。
- 内容：資料固有の情報が正確で、例示データが実績に見えない。出典や条件が必要なら対象図表の近くへ。
- 仕様：選択した13:9／16:9、表紙に本文用の上部線なし、本文がタイトル線の横幅内、Speaker notesなし。

修正したら影響ページを再確認する。構造補正を再実行する場合は、最新HTMLからの元出力と対応する最新`layout.json`を使う。異なる版の幾何情報を混ぜない。

## レイアウト見本

`assets/layout-gallery.html`と`assets/layout-gallery-wide.html`は同じ例示データから作る汎用的な配置例。数値はすべて例示。業務データとして流用しない。見本の形を固定せず、`layouts-and-charts.md`の選定基準に従って内容へ合わせる。
