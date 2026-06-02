<script lang="ts">
  import type { UserStatus, Profile } from "$lib/types";
  import { datetime, formatRelativeDate } from "$lib/utils/utils";
  import { Clock } from "@lucide/svelte";
  import type * as Nostr from "nostr-typedef";

  interface Props {
    pubkey: string;
    petname: string;
    userStatus: UserStatus | undefined;
    latestNote: Nostr.Event | undefined;
    profile: Profile | undefined;
  }
  let { pubkey, petname, userStatus, latestNote, profile }: Props = $props();

  // MutualStatus の実値が不明なため文字列比較でフォールバックあり
  function mutualCls(mutual: unknown): string {
    return String(mutual) === "mutual"
      ? "bg-primary-container text-on-primary-container"
      : "bg-surface-variant text-on-surface-variant";
  }

  // 古さに応じた色: 365日超→error、180日超→tertiary、それ以外→on-surface
  function staleCls(unixTs: number): string {
    const days = (Date.now() / 1000 - unixTs) / 86400;
    if (days > 365) return "text-error";
    if (days > 180) return "text-tertiary";
    return "text-on-surface";
  }
</script>

<div class="shrink-0">
  {#if profile?.picture}
    <img
      src={profile.picture}
      alt=""
      class="h-14 w-14 rounded-full border border-outline-variant object-cover"
    />
  {:else}
    <div
      class="bg-surface-variant text-on-surface-variant flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant text-xs"
    >
      ?
    </div>
  {/if}
</div>

<div class="min-w-0 flex-1">
  <!-- 名前 + mutual バッジ + 相手のpetname -->
  <div class="flex flex-wrap items-center gap-2 justify-between">
    <h3 class="truncate font-medium">
      {profile?.display_name ??
        profile?.name ??
        "Unknown"}{#if petname}📛{petname}{/if}
    </h3>

    {#if userStatus?.mutual !== undefined}
      <span
        class="rounded-md px-2.5 py-0.5 text-sm font-medium {mutualCls(
          userStatus.mutual,
        )}"
      >
        {userStatus.mutual}
      </span>
    {/if}
  </div>
  {#if userStatus?.petname}
    <span
      class="rounded-md bg-secondary-container px-2 py-0.5 text-xs text-on-secondary-container"
    >
      {userStatus.petname}
    </span>
  {/if}
  <!-- 最終投稿日時（重要指標）-->
  <div class="mt-1 flex items-center gap-1.5">
    <Clock class="size-3.5 shrink-0 text-on-surface-variant" />
    {#if latestNote}
      <time
        datetime={datetime(latestNote.created_at)}
        class="text-sm font-medium {staleCls(latestNote.created_at)}"
      >
        {formatRelativeDate(latestNote.created_at, "en")}
      </time>
    {:else}
      <span class="text-on-surface-variant text-sm">投稿なし</span>
    {/if}
  </div>

  <!-- about（補助情報・1行）-->
  {#if profile?.about}
    <p class="text-on-surface-variant mt-1 line-clamp-1 break-all text-xs">
      {profile.about}
    </p>
  {/if}

  <!-- 最新ノート本文（補助情報）-->
  {#if latestNote?.content}
    <div
      class="bg-surface-container-high mt-2 rounded-lg border border-outline-variant px-3 py-2"
    >
      <p class="text-on-surface-variant line-clamp-2 break-all text-xs">
        {latestNote.content}
      </p>
    </div>
  {/if}
</div>
