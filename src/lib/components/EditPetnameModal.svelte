<script lang="ts">
  import { updatePetname } from "$lib/nostr/signEvent";
  import type { ViewData } from "$lib/types";
  import { AtSign, Check, Tag, User, X } from "@lucide/svelte";
  import { Dialog, Separator } from "bits-ui";

  interface Props {
    editingpetname: string;
    open: boolean;
    viewData: ViewData;
  }

  let { editingpetname, open = $bindable(), viewData }: Props = $props();
  let petname = $state("");

  $effect(() => {
    if (open) {
      petname = editingpetname ?? "";
    }
  });

  function confirmPetname() {
    updatePetname(viewData.npub, petname);
    console.log(petname);
    open = false;
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
      <Dialog.Close
        class="focus-visible:ring-primary focus-visible:ring-offset-surface absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-surface-variant focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
      >
        <X class="text-on-surface-variant size-5" />
        <span class="sr-only">閉じる</span>
      </Dialog.Close>

      <form
        class="flex min-h-0 flex-1 flex-col"
        onsubmit={(event) => event.preventDefault()}
      >
        <div class="min-h-0 flex-1 overflow-y-auto p-6">
          <Dialog.Title class="mb-0">
            <div class="flex items-center gap-4 pr-8">
              <div
                class="bg-secondary-container text-on-secondary-container flex size-14 shrink-0 items-center justify-center rounded-md ring-2 ring-outline-variant"
              >
                <Tag class="size-7" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-on-surface truncate text-base font-semibold">
                  petnameを編集
                </h3>
                <p class="text-on-surface-variant truncate text-xs">
                  自分用の呼び名を設定します
                </p>
              </div>
            </div>
          </Dialog.Title>

          <Dialog.Description class="sr-only">
            ペットネームを編集するダイアログ
          </Dialog.Description>

          <Separator.Root class="bg-outline-variant -mx-6 my-5 block h-px" />

          <section class="flex flex-col gap-3">
            <input
              id="petname-input"
              bind:value={petname}
              type="text"
              autocomplete="off"
              placeholder="例: いつもの人"
              class="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-primary/30 rounded-xl border border-outline-variant px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
            />
          </section>

          <!-- ヘッダー：アバター + 名前 -->
          <Separator.Root class="bg-outline-variant -mx-6 my-5 block h-px" />
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
        </div>

        <div class="border-outline-variant shrink-0 border-t px-6 py-4">
          <div class="flex justify-end gap-2">
            <Dialog.Close
              class="text-primary hover:bg-primary/10 focus-visible:ring-primary focus-visible:ring-offset-surface inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              閉じる
            </Dialog.Close>
            <button
              type="submit"
              onclick={confirmPetname}
              class="bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary focus-visible:ring-offset-surface inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <Check class="size-4" />
              決定
            </button>
          </div>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
