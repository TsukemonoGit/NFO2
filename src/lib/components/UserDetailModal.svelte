<script lang="ts">
  import { refetchEvent } from "$lib/nostr/rx-nostr";
  import type { ViewData } from "$lib/types";
  import {
    AtSign,
    Clock,
    Globe,
    Tag,
    User,
    X,
    Zap,
    RefreshCw,
  } from "@lucide/svelte";
  import { Button, Dialog, Separator } from "bits-ui";

  interface Props {
    open: boolean;

    viewData: ViewData;
  }
  let { open = $bindable(), viewData }: Props = $props();

  function formatDate(unixTs: number): string {
    return new Date(unixTs * 1000).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // MutualStatus の実際の値が不明なため、文字列キーで照合しフォールバックあり
  function mutualBadge(mutual: unknown): { text: string; cls: string } {
    const map: Record<string, { text: string; cls: string }> = {
      mutual: {
        text: "相互フォロー",
        cls: "bg-primary-container text-on-primary-container",
      },
      following: {
        text: "フォロー中",
        cls: "bg-secondary-container text-on-secondary-container",
      },
      follower: {
        text: "フォロワー",
        cls: "bg-tertiary-container text-on-tertiary-container",
      },
      none: {
        text: "未フォロー",
        cls: "bg-surface-variant text-on-surface-variant",
      },
    };
    return (
      map[String(mutual)] ?? {
        text: String(mutual),
        cls: "bg-surface-variant text-on-surface-variant",
      }
    );
  }

  let refreshing = $state(false);
  function reflesh(kind: number) {
    console.log(kind);
    refetchEvent(viewData.npub, kind);
    refreshing = true;
    setTimeout(() => {
      refreshing = false;
    }, 3000);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-scrim/50"
    />
    <Dialog.Content
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-1/2 top-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] max-h-[85svh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-outline-variant bg-surface-container shadow-xl sm:max-w-lg"
    >
      <!-- X 閉じるボタン（スクロールに追従しないよう Content 直下に配置） -->
      <Dialog.Close
        class="focus-visible:ring-primary focus-visible:ring-offset-surface absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-surface-variant focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
      >
        <X class="text-on-surface-variant size-5" />
        <span class="sr-only">閉じる</span>
      </Dialog.Close>

      <!-- スクロール領域 -->
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <!-- ヘッダー：アバター + 名前 -->
        <Dialog.Title class="mb-0">
          <div class="flex items-center gap-4 pr-8">
            {#if viewData.profile?.picture}
              <img
                src={viewData.profile.picture}
                alt="avatar"
                class="size-14 shrink-0 rounded-md object-cover ring-2 ring-outline-variant"
              />
            {:else}
              <div
                class="bg-surface-variant text-on-surface-variant flex size-14 shrink-0 items-center justify-center rounded-md"
              >
                <User class="size-7" />
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              <p class="text-on-surface truncate text-base font-semibold">
                {viewData.profile?.display_name ??
                  viewData.profile?.name ??
                  "名称未設定"}
              </p>
              {#if viewData.profile?.nip05}
                <p
                  class="text-on-surface-variant flex items-center gap-1 truncate text-xs"
                >
                  <AtSign class="size-3 shrink-0" />
                  {viewData.profile.nip05}
                </p>
              {/if}
            </div>
          </div>
        </Dialog.Title>

        <!-- アクセシビリティ用 description -->
        <Dialog.Description class="sr-only">ユーザー詳細情報</Dialog.Description
        >

        <Separator.Root class="bg-outline-variant -mx-6 my-5 block h-px" />

        <div class="flex flex-col gap-5">
          <!-- フォロー状況 -->
          <section class="flex flex-col gap-3">
            <h3
              class="text-on-surface-variant text-xs font-medium uppercase tracking-wider flex items-center"
            >
              <Button.Root
                onclick={() => reflesh(3)}
                class="inline-flex h-8 w-8 items-center justify-center rounded-sm mr-4  bg-error-container font-semibold text-on-error-container shadow-sm hover:bg-error-container/90 active:scale-[0.98] active:transition-all disabled:opacity-30"
                disabled={refreshing}
              >
                <RefreshCw />
              </Button.Root>フォロー状況
            </h3>

            {#if viewData.userStatus}
              {@const badge = mutualBadge(viewData.userStatus.mutual)}
              <span
                class="w-fit rounded-full px-3 py-1 text-xs font-medium {badge.cls}"
              >
                {badge.text}
              </span>
            {/if}

            <div
              class="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 text-sm"
            >
              <span
                class="text-on-surface-variant flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag class="size-3.5 shrink-0" />あなたのpetname
              </span>
              {#if viewData.petname}
                <span class="text-on-surface break-all">{viewData.petname}</span
                >
              {:else}
                <span class="text-on-surface-variant text-xs italic"
                  >未設定</span
                >
              {/if}

              <span
                class="text-on-surface-variant flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag class="size-3.5 shrink-0" />相手のpetname
              </span>
              {#if viewData.userStatus?.petname}
                <span class="text-on-surface break-all"
                  >{viewData.userStatus.petname}</span
                >
              {:else}
                <span class="text-on-surface-variant text-xs italic"
                  >未設定</span
                >
              {/if}
            </div>
          </section>

          <!-- 最新ノート -->

          <Separator.Root class="bg-outline-variant -mx-6 block h-px" />
          <section class="flex flex-col gap-3">
            <h3
              class="text-on-surface-variant text-xs font-medium uppercase tracking-wider flex items-center"
            >
              <Button.Root
                onclick={() => reflesh(1)}
                class="inline-flex h-8 w-8 items-center justify-center rounded-sm mr-4  bg-error-container font-semibold text-on-error-container shadow-sm hover:bg-error-container/90 active:scale-[0.98] active:transition-all disabled:opacity-30"
                disabled={refreshing}
              >
                <RefreshCw />
              </Button.Root>最新ノート
            </h3>
            {#if viewData.latestNote}
              <div class="bg-surface-container-high rounded-xl p-3.5">
                <p
                  class="text-on-surface line-clamp-4 whitespace-pre-wrap text-sm"
                >
                  {viewData.latestNote.content}
                </p>
                <p
                  class="text-on-surface-variant mt-2.5 flex items-center gap-1.5 text-xs"
                >
                  <Clock class="size-3 shrink-0" />
                  {formatDate(viewData.latestNote.created_at)}
                </p>
              </div>
            {/if}
          </section>

          <!-- プロフィール詳細 -->

          <Separator.Root class="bg-outline-variant -mx-6 block h-px" />
          <section class="flex flex-col gap-3">
            <h3
              class="text-on-surface-variant text-xs font-medium uppercase tracking-wider flex items-center"
            >
              <Button.Root
                onclick={() => reflesh(0)}
                class="inline-flex h-8 w-8 items-center justify-center rounded-sm mr-4  bg-error-container font-semibold text-on-error-container shadow-sm hover:bg-error-container/90 active:scale-[0.98] active:transition-all disabled:opacity-30"
                disabled={refreshing}
              >
                <RefreshCw />
              </Button.Root>プロフィール
            </h3>
            {#if viewData.profile?.about}
              <p
                class="text-on-surface line-clamp-4 whitespace-pre-wrap text-sm"
              >
                {viewData.profile.about}
              </p>
            {/if}
            <div class="flex flex-col gap-1.5">
              {#if viewData.profile?.website}
                <a
                  href={viewData.profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:text-primary/80 flex items-center gap-1.5 break-all text-sm"
                >
                  <Globe class="size-3.5 shrink-0" />
                  {viewData.profile.website}
                </a>
              {/if}
              {#if viewData.profile?.lud16}
                <p
                  class="text-on-surface-variant flex items-center gap-1.5 break-all text-xs"
                >
                  <Zap class="size-3.5 shrink-0" />
                  {viewData.profile.lud16}
                </p>
              {/if}
            </div>
          </section>
        </div>
      </div>

      <!-- フッター -->
      <div class="border-outline-variant shrink-0 border-t px-6 py-4">
        <div class="flex justify-end">
          <Dialog.Close
            class="bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary focus-visible:ring-offset-surface inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            閉じる
          </Dialog.Close>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
