# ギャラリーの選び方と拡張

[用途別ギャラリー](../assets/gallery.html)には69のHTML見本を収録する。検索・用途別絞り込み・13:9／16:9切り替え・入力JSONの表示が可能。G番号は描画見本の識別子で、構成カタログのL番号とは別。

## 本文幅

- `contentWidth: "standard"`：最大本文幅の88%。要素数の少ない関係図・分岐・グラフに向く。
- `contentWidth: "wide"`：タイトル線と同じ最大幅。列数や情報量の多い工程・比較・表に向く。
- 本文領域の左右余白は必ず等しくする。文字の左揃え・中央揃えは内容に応じて独立に選ぶ。
- 幅を変えても文字・ロゴ・円を引き伸ばさない。箱幅と要素間隔を再計算する。

## 収録例

| ID | パターン | 用途 |
|---|---|---|
| G01 | `cover` | 表紙。会社別マスタのロゴ・配置・書体を適用する。 |
| G02 | `compare` | 共通の観点で選択肢の特徴や制約を並べる。 |
| G03 | `evidence` | 事実・解釈・判断を区別し、同じ行で対応づける。 |
| G04 | `focus` | 全体のどこを説明しているかを保ちながら掘り下げる。 |
| G05 | `driver` | 数量を構成する因子と、その前提条件を説明する。 |
| G06 | `funnel` | 候補が絞られる過程と、除外基準を示す。 |
| G07 | `scenario` | 条件による結果の違いを、共通尺度の小さな図で比較する。 |
| G08 | `evaluation` | 評価軸・尺度・未確認事項を明らかにして比較する。 |
| G09 | `cycle` | 一度きりの順序ではなく、反復・フィードバックを示す。 |
| G10 | `scope` | 対応・一部対応・未確認・対象外を混同せず一覧する。 |
| G11 | `range` | 中心値だけでは見えない観測範囲・ばらつきを示す。 |
| G12 | `diverging` | 共通の原点からの増加・減少を比較する。 |
| G13 | `mekko` | 領域の総量と、領域内の構成比を同時に示す。 |
| G14 | `process` | 工程ごとに作業と成果物を対応させる |
| G15 | `timeline` | 日付と節目を示す。期間の長さにはガントを使う |
| G16 | `gantt` | 期間と並行実施を示す |
| G17 | `swimlane` | 工程をまたぐ担当・役割の違いを示す |
| G18 | `beforeafter` | 共通の観点で変更前後を比べる |
| G19 | `issue-tree` | 論点を分解して検証項目へつなぐ |
| G20 | `hierarchy` | 全体方針と下位の取り組みを対応させる |
| G21 | `hub` | 中心と周辺の関係を示す。順序は表さない |
| G22 | `layers` | 役割の異なる層を整理する |
| G23 | `decision` | 条件による対応の分岐を示す |
| G24 | `quadrant` | 二つの独立した軸で方針を整理する |
| G25 | `bars` | 共通単位の量を比較する |
| G26 | `stacked` | 内訳の割合を比較する。総量は比較できない |
| G27 | `line-chart` | 連続する期間の変化を比較する |
| G28 | `scatter` | 二変数の関係・外れ値を見る |
| G29 | `slope` | 二時点の変化を追う |
| G30 | `waterfall` | 増減要因と最終値をつなぐ |
| G31 | `pareto` | 分類の件数と累積比率を見る |
| G32 | `heatmap` | 複数対象・複数観点の強弱を見る |
| G33 | `strategy-map` | 外部環境や課題が、どの方針・成果につながるかを読む。 |
| G34 | `exchange` | 主体間の往路・復路で受け渡すものを区別する。 |
| G35 | `operating-model` | 役割・活動・情報と、それらを支える横断基盤を整理する。 |
| G36 | `maturity` | 現在と目標の違い、次段階へ移る条件を示す。 |
| G37 | `pyramid-detail` | 目的・仕組み・基盤の包含関係と具体的な意味を対応させる。 |
| G38 | `portfolio-bubbles` | 二つの評価軸と対象規模を同時に読む。 |
| G39 | `portfolio-moves` | 現在の分布だけでなく、目標へ向かう方向を示す。 |
| G40 | `portfolio-actions` | 二軸の位置づけを、具体的な対応方針に結び付ける。 |
| G41 | `valuechain` | 工程に沿った対応範囲・欠落・重点を横断的に見る。 |
| G42 | `part-whole` | 全体と部分の分母を区別しながら内訳を拡大する。 |
| G43 | `small-multiples` | 対象×指標の共通グリッドで推移を比較する。 |
| G44 | `scenario-metrics` | 条件が変わると成果と負担がどう変わるかを同時に比較する。 |
| G45 | `annotated-trend` | グラフ上の注目点と解釈を番号で対応させる。 |
| G46 | `survey-grid` | 同じ属性について複数の質問結果を同じ行で比較する。 |
| G47 | `chart-quotes` | 定量的な回答傾向と定性的なコメントを同じ行で示す。 |
| G48 | `benchmark-profile` | 評価項目ごとに、対象と比較対象の強弱を追う。 |
| G49 | `paired-dots` | 項目ごとの二群の差を原点に依存せず直接読む。 |
| G50 | `segment-profiles` | 対象群の特徴・要求・障害から、対応を変える理由を示す。 |
| G51 | `workplan-deliverables` | 論点に対する作業・検証・出力を一つの行で完結させる。 |
| G52 | `dependency-map` | 並行する取り組みの間で、何が次の作業へ渡るかを示す。 |

複合構成G33〜G52の配置・誤読への注意は[複合分析のレイアウト](compound-layouts.md)を参照。

## 生成・更新

`assets/pattern-examples.json`が内容の正本。`scripts/build_html.mjs`と`extended-patterns.mjs`・`compound-patterns.mjs`が会社に依存しない配置を定義し、会社の設定は`masters/<id>/master.json`から受け取る。画像を差し替えるだけの見本ではなく、同じJSONから両比率のHTMLを生成できる。

```sh
node SKILL_DIR/scripts/build_html.mjs --master MASTER/master.json --aspect 13:9 --data SKILL_DIR/assets/pattern-examples.json --out OUTPUT/layout-gallery.html
node SKILL_DIR/scripts/build_html.mjs --master MASTER/master.json --aspect 16:9 --data SKILL_DIR/assets/pattern-examples.json --out OUTPUT/layout-gallery-wide.html
node SKILL_DIR/scripts/build_gallery.mjs --data SKILL_DIR/assets/pattern-examples.json --out OUTPUT/gallery.html
```

既存ファイルの更新が認められている場合に限り、HTML生成に`--overwrite yes`を追加する。ギャラリーのサムネイルはHTMLを`inspect_html.mjs`で画像化してから、`build_thumbnails.py`で生成する。Pillowが必要。

```sh
python3 SKILL_DIR/scripts/build_thumbnails.py --standard QA_STANDARD --wide QA_WIDE --out OUTPUT/gallery-thumbs
```

サムネイルは見本の閲覧用であり、PPTX本文に画像として貼らない。PPTX制作は`dom-to-pptx-skill`と[制作手順](production.md)に従う。チャートは編集可能な図形として変換する方式で、Excelデータと連動するネイティブチャートではない。

## 内容を差し替えるとき

- 見本の項目数・文章量を大きく超える場合は、単にJSONを増やさず、列数・高さ・ページ構成を調整して再描画する。
- 箱を結ぶ線がある図は、意味を表す接続とその向きを確認する。階層や関係線に時間・因果の意味を自動で持たせない。
- 比較軸・期間・単位を揃える。値・軸範囲・集計方法・例示か実測かを図の近くで明示する。
- 100%積み上げ・メッコは内訳の合計を確認。ウォーターフォールは開始＋増減＝終了。パレートは降順と累積比率の整合を確認。
- 分岐・二軸整理・評価表のラベルは実際の判断条件に置き換える。恣意的な点数や優先度を創作しない。
- 写真・アイコンを入れる場合は内容の理解に寄与するものだけ追加し、既存のマスタ・余白・文字のルールを維持する。

## G53–G60：階層・判断・実行

親子行と共通対応、二段の列見出し、縦工程、分類と対応、番号付き方針、作業パッケージ、構成比と説明、段階別の判断条件を追加。[配置・選定ルール](structured-layouts.md)を参照。

G61–G66は「カラム・入れ子」。ボックス、円、入れ子、ラベル対応、濃灰見出し、背景なし左揃え見出しを使い分ける。

## G68–G69：見出しの包含関係

- G68 `nested-summary`：親見出し＋包含帯＋子見出しと、その主張・根拠。
- G69 `nested-classification`：分類の深さが異なる木構造と、末端の説明・指標。

[階層データ・配置ルール](nested-headings.md)を参照。
