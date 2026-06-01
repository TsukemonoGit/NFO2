<script lang="ts">
  import { X, User, AtSign, Tag, Clock, Globe, Zap } from "@lucide/svelte";
  import { Dialog, Separator } from "bits-ui";

  let { editingpetname, open = $bindable() } = $props();
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
      <div class="min-h-0 flex-1 overflow-y-auto p-6">まだかいてないよー</div>

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
