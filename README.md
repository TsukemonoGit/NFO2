# Nostr Follow Organizer 2

Nostr Follow Organizer 2 (NFO2) is the v2 project of [TsukemonoGit/NFO](https://github.com/TsukemonoGit/NFO).

NFO2 helps you inspect and organize your Nostr follow list (`kind:3`) by showing each followed user's profile, latest note, mutual-follow status, and NIP-02 petnames.

## Features

- Fetch your latest follow list (`kind:3`) after Nostr login.
- Display followed users with profile image, name, about text, and latest note.
- Show whether each user follows you back.
- Show both your petname for them and their petname for you.
- Sort by follow order, latest post, mutual status, your petname, or their petname.
- Reverse the current sort order.
- Edit petnames in your own follow list.
- Select multiple users and remove them from your follow list.
- Use the logged-in user's relay list (`kind:10002`) when available.
- Switch light / dark theme.

## 日本語

Nostr Follow Organizer 2 (NFO2) は、[Nostr Follow Organizer](https://github.com/TsukemonoGit/NFO) の v2 的なプロジェクトです。

Nostr のフォローリストを取得し、フォロー中ユーザーのプロフィール、最新投稿、相互フォロー状態、NIP-02 petname を一覧で確認・整理できます。

### 主な機能

- Nostr ログイン後、自分の最新フォローリスト (`kind:3`) を取得
- フォロー先のプロフィール、最新投稿、自己紹介を表示
- 相互フォローかどうかを表示
- 自分が相手につけた petname と、相手が自分につけた petname を表示
- フォロー順、最新投稿順、相互状態、myPetname、theirPetname でソート
- ソート順の反転
- 自分のフォローリスト上の petname を編集
- 複数選択したユーザーをフォローリストから削除
- `kind:10002` のリレーリストがある場合はそれを利用
- ライト / ダークテーマ切り替え

## v2 Notes

This version is rebuilt with a newer Svelte stack and a more reactive data flow:

- Svelte 5 + SvelteKit
- TypeScript
- Tailwind CSS v4
- rx-nostr
- TanStack Svelte Query
- `@konemono/nostr-login`
- Cloudflare adapter

## Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Open the app:

```sh
npm run dev -- --open
```

## Build

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Check & Test

Run Svelte / TypeScript checks:

```sh
npm run check
```

Run tests:

```sh
npm test
```

## Related Project

- v1: [TsukemonoGit/NFO](https://github.com/TsukemonoGit/NFO)
- v1 app: [Nostr Follow Organizer](https://tsukemonogit.github.io/NFO/)
