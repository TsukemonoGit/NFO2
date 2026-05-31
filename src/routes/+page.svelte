<script lang="ts">
  import UserCard from "$lib/components/UserCard.svelte";
  import { latestKind3 } from "$lib/store/store.svelte";
  import { hexRegex } from "$lib/utils/regex";
  import { sortFollowList } from "$lib/utils/sortFollowers";
  import { Select } from "bits-ui";
  import { Check } from "@lucide/svelte";
  import { untrack } from "svelte";
  import { SortOrder } from "$lib/types";

  let sortOrder = $state(SortOrder.follow);
  let sortedTags: string[][] = $state([]);
  const labels: Record<SortOrder, string> = {
    [SortOrder.follow]: "Follow",
    [SortOrder.latestPost]: "Latest Post",
    [SortOrder.mutual]: "Mutual",
    [SortOrder.myPetname]: "MyPetname",
    [SortOrder.theirPetname]: "TheirPetname",
  };

  const themes = Object.values(SortOrder).map((value) => {
    return { value: value as string, label: labels[value], disabled: false };
  });
  console.log(themes);
  $effect(() => {
    if (sortOrder && latestKind3.value) {
      untrack(() => {
        sortedTags = sortFollowList(latestKind3.value!.tags, sortOrder);
      });
    }
  });
</script>

<h1 class="text-lg">Nostr Follow Organizer 2</h1>
{#if latestKind3.value}
  <Select.Root
    type="single"
    items={themes}
    allowDeselect={true}
    bind:value={sortOrder as never}
  >
    <Select.Trigger
      class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors"
      aria-label="Select a theme"
    >
      <Select.Value placeholder="Select a sort order" />
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
        sideOffset={10}
      >
        <Select.ScrollUpButton class="flex w-full items-center justify-center">
          <!-- <CaretDoubleUp class="size-3" /> -->
        </Select.ScrollUpButton>
        <Select.Viewport class="p-1">
          {#each themes as theme, i (i + theme.value)}
            <Select.Item
              class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
              value={theme.value}
              label={theme.label}
              disabled={theme.disabled}
            >
              {#snippet children({ selected })}
                {theme.label}
                {#if selected}
                  <div class="ml-auto">
                    <Check aria-label="check" />
                  </div>
                {/if}
              {/snippet}
            </Select.Item>
          {/each}
        </Select.Viewport>
        <Select.ScrollDownButton
          class="flex w-full items-center justify-center"
        >
          <!--  <CaretDoubleDown class="size-3" /> -->
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
  {#each sortedTags as tags}
    {#if tags[0] === "p" && hexRegex.test(tags[1])}
      {@const petname = tags[3] || undefined}
      <UserCard {petname} pubkey={tags[1]} />
    {/if}
  {/each}
{/if}
