# Monthly Cost Splitter

月別の折半費用を計算・保存する小規模Webアプリです。

## Features

- 月別の費用入力
- localStorage 保存
- Firebase Authentication + Firestore 同期
- 月別グラフ
- 計算内訳のコピー
- CSVエクスポート/インポート
- GitHub Pages 向け static export

## Spec

現在の詳しい仕様は [SPEC.md](./SPEC.md) に残しています。

## Development

```bash
npm install
npm run dev
```

Before shipping changes, run:

```bash
npm run lint
npm test
npm run build
```

Generated directories such as `.next/`, `out/`, and `node_modules/` are ignored
and should not be committed.

## Firebase

GoogleログインとFirestore同期を使う場合は、Firebase Consoleで以下を設定します。

1. Webアプリを追加する
2. AuthenticationでGoogleログインを有効化する
3. Firestore Databaseを作成する
4. `firestore.rules` の内容をRulesへ反映する
5. `.env.example` を参考に `.env.local` を作成する

GitHub Pagesで使う場合は、Repository settingsのActions variablesに同じ
`NEXT_PUBLIC_FIREBASE_*` 値を登録します。

## Privacy

未ログイン時の入力データはブラウザの localStorage に保存されます。
Googleログイン後はFirestoreの `users/{uid}/data/monthly-cost-splitter` に同期されます。
公開リポジトリには個人の金額データを含めない構成です。
