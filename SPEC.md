# Monthly Cost Splitter Spec

## 目的

毎月の電気・ガス・ネット、水道、エネファーム、固定資産税から、月別の負担額を計算して保存する個人用Webアプリ。

優先すること:

- 入力が速い
- 計算式が見える
- 月ごとの履歴が見やすい
- ローカルでもGitHub Pagesでも使える
- Googleログイン時はFirestoreに保存する

## 技術構成

- Next.js
- TypeScript
- Tailwind CSS
- localStorage
- Firebase Authentication
- Cloud Firestore
- GitHub Pages static export

## 保存仕様

### 未ログイン時

ブラウザのlocalStorageに保存する。

キー:

- `monthly-cost-splitter-records`
- `monthly-cost-splitter-settings`

### Googleログイン時

Firebase AuthenticationのGoogleログインを使う。

Firestore保存先:

```text
users/{uid}/data/monthly-cost-splitter
```

保存ドキュメント:

```text
{
  version: 1,
  records: MonthlyRecord[],
  settings: AppSettings,
  updatedAt: string
}
```

ログイン後はFirestore側のデータを読み込み、localStorageにも同じ内容を反映する。

Firestore Rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/data/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 対象費目

### 電気・ガス・ネット

- 入力欄は「電気・ガス代」と「ネット代」
- 以前のガス代入力は電気・ガス代へ統合
- 計算式は `(電気・ガス代 + ネット代) / 負担人数`

### 水道

- 月別入力
- 現在の仕様では偶数月のみ入力可能
- 入力できない月はグレーアウト
- 計算式は `水道代 / 負担人数`
- `/ 2か月` のような分割月数表示はしない

### エネファーム

- 月次入力画面では表示のみ
- 入力欄はグレーアウト
- 変更は設定画面で行う
- 計算式は `エネファーム代 / 負担人数`

### 固定資産税

- 月次入力画面では表示のみ
- 入力欄はグレーアウト
- 年額は設定画面で管理
- 計算式は `固定資産税年額 / 12か月 / 負担人数`
- 33%を掛けるのではなく、3で割る

## 計算仕様

内部計算はnumberで行う。

表示は小数点なしの円表示。

負担割合は設定では `0.5` や `1 / 3` として持つが、表示と計算式はできるだけ `/ 2`、`/ 3` のように割り算で見せる。

計算結果:

```ts
export type CalculationResult = {
  utilitySubtotal: number;
  utilityShareAmount: number;
  waterMonthlyBase: number;
  waterShareAmount: number;
  eneFarmMonthlyBase: number;
  eneFarmShareAmount: number;
  fixedAssetMonthlyBase: number;
  fixedAssetShareAmount: number;
  total: number;
};
```

## 月次入力

- 左右ボタンで前月・翌月を切り替える
- 保存ボタンはない
- 入力内容は即時保存
- 表示中の月のレコードがなければ自動作成する
- 計算内訳をPlain text形式で表示する
- 計算内訳はコピーできる

## 月別履歴

- 月別履歴は下部に表示
- 新しい月を上に表示
- 一覧で各費目と合計を確認できる
- 各月の計算式サマリを確認できる
- 表示、複製、削除ができる

## グラフ

- 月別グラフを上部に表示
- 月ごとの合計と費目内訳を可視化する
- レコードがない場合は空状態を表示する

## 設定

設定画面で管理する値:

- デフォルト エネファーム代
- デフォルト 固定資産税年額
- デフォルト 電気・ガス・ネット負担割合
- デフォルト 水道負担割合
- デフォルト エネファーム負担割合
- デフォルト 固定資産税負担割合

設定保存時は、現在選択中の月のエネファーム、固定資産税、負担割合にも反映する。

## CSV

機能:

- CSVエクスポート
- CSVインポート

CSVインポート時:

- 同じ月の既存レコードはインポート内容で置き換える
- インポートした最新月の設定値をアプリ設定に反映する

## データ型

```ts
export type MonthlyRecord = {
  id: string;
  month: string;
  electricity: number | null;
  gas: number | null;
  internet: number | null;
  water: number | null;
  eneFarm: number | null;
  fixedAssetAnnual: number | null;
  utilityShare: number;
  waterShare: number;
  waterSplitMonths: number;
  eneFarmShare: number;
  eneFarmSplitMonths: number;
  fixedAssetShare: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  defaultEneFarm: number;
  defaultFixedAssetAnnual: number;
  defaultUtilityShare: number;
  defaultWaterShare: number;
  defaultWaterSplitMonths: number;
  defaultEneFarmShare: number;
  defaultEneFarmSplitMonths: number;
  defaultFixedAssetShare: number;
};
```

## GitHub Pages運用

GitHub Actions variablesに以下を登録する。

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Firebase Authenticationの承認済みドメインに以下を登録する。

```text
localhost
127.0.0.1
junnakarai.github.io
```

公開URL:

```text
https://junnakarai.github.io/monthly-cost-splitter/
```

## プライバシー

- 公開リポジトリには個人の金額データを含めない
- 未ログイン時のデータはブラウザ内
- ログイン時のデータはFirestoreの本人UID配下
- Firestore Rulesで本人のみ読み書き可能にする

## 将来候補

- 年間集計
- JSONエクスポート/インポート
- PWA化
- Apple IDログイン
- 複数ユーザー共有
