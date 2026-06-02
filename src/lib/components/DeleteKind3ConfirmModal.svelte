<script lang="ts">
  import { deleteFromKind3 } from "$lib/nostr/signEvent.svelte";
  import { latestKind3 } from "$lib/store/store.svelte";
  import { hexRegex } from "$lib/utils/regex";
  import { Trash2, X } from "@lucide/svelte";
  import { Button, Dialog, Separator } from "bits-ui";
  import UserCard from "./UserCard.svelte";
  import UserData from "./UserData.svelte";

  interface Props {
    open: boolean;
    deleteIds: string[];
  }

  let { open = $bindable(), deleteIds = $bindable() }: Props = $props();

  function confirmDelete() {
    if (!latestKind3.value) {
      console.log("error!");
      return;
    }

    deleteFromKind3(deleteIds, latestKind3.value);
    deleteIds = [];
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-scrim/50"
    />
    <Dialog.Content
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-1/2 top-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] max-h-[85svh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-outline-variant bg-surface-container shadow-xl sm:max-w-2xl"
    >
      <Dialog.Close
        class="focus-visible:ring-primary focus-visible:ring-offset-surface absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-surface-variant focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
      >
        <X class="text-on-surface-variant size-5" />
        <span class="sr-only">閉じる</span>
      </Dialog.Close>

      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <Dialog.Title class="mb-0">
          <div class="flex items-center gap-4 pr-8">
            <div
              class="bg-error-container text-on-error-container flex size-14 shrink-0 items-center justify-center rounded-md ring-2 ring-outline-variant"
            >
              <Trash2 class="size-7" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-on-surface truncate text-base font-semibold">
                この人たちを削除していいですか？
              </h3>
              <p class="text-on-surface-variant truncate text-xs">
                kind3のフォローリストから{deleteIds.length}件を削除します。
              </p>
            </div>
          </div>
        </Dialog.Title>

        <Dialog.Description class="sr-only">
          選択したユーザーを削除する前の確認画面
        </Dialog.Description>

        <Separator.Root class="bg-outline-variant -mx-6 my-5 block h-px" />

        <div class="flex flex-col gap-3">
          {#each deleteIds as npub (npub)}
            <UserData pubkey={npub}>
              {#snippet children({ userStatus, latestNote, profile })}
                <div
                  class="flex rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <UserCard pubkey={npub} {userStatus} {latestNote} {profile} />
                </div>
              {/snippet}
            </UserData>
          {/each}
        </div>
      </div>

      <div class="border-outline-variant shrink-0 border-t px-6 py-4">
        <div class="flex justify-end gap-2">
          <Dialog.Close
            class="text-primary hover:bg-primary/10 focus-visible:ring-primary focus-visible:ring-offset-surface inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            キャンセル
          </Dialog.Close>
          <Button.Root
            onclick={confirmDelete}
            class="bg-error-container text-on-error-container hover:bg-error-container/90 focus-visible:ring-primary focus-visible:ring-offset-surface inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-30"
            disabled={deleteIds.length === 0}
          >
            <Trash2 class="size-4" />
            削除する
          </Button.Root>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
