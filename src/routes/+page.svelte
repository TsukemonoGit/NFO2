<script lang="ts">
  import { latestKind3 } from "$lib/store/store.svelte";

  import { sortFollowList } from "$lib/utils/sortFollowers";
  import { Select } from "bits-ui";
  import {
    Check,
    Triangle,
    Users,
    type LucideProps,
    FilePenLine,
    List,
    Tags,
    Tag,
  } from "@lucide/svelte";
  import { untrack, type Component } from "svelte";
  import { SortOrder } from "$lib/types";
  import { Toggle } from "bits-ui";
  import UserList from "$lib/components/UserList.svelte";

  let sortOrder = $state(SortOrder.follow);
  let reverse = $state(false);
  let sortedTags: string[][] = $state([]);

  interface OrderData {
    value: string;
    label: string;
    icon: Component<LucideProps, {}, "">;
  }
  const orderData: OrderData[] = [
    {
      value: "follow",
      label: "Follow",
      icon: List,
    },
    { value: "latestPost", label: "Latest Post", icon: FilePenLine },
    { value: "mutual", label: "Mutual", icon: Users },
    { value: "myPetname", label: "myPetname", icon: Tags },
    { value: "theirPetname", label: "theirPetname", icon: Tag },
  ];
  const themes = orderData.map((data) => {
    return { value: data.value, label: data.label };
  });

  $effect(() => {
    reverse;
    if (sortOrder && latestKind3.value) {
      untrack(() => {
        sortedTags = sortFollowList(
          latestKind3.value!.tags,
          sortOrder,
          reverse,
        );
      });
    }
  });
</script>

<div class="w-5xl max-w-full mx-auto p-2">
  <h1 class="text-lg">Nostr Follow Organizer 2</h1>

  {#if latestKind3.value}
    <div class="flex items-center gap-2 mb-2">
      <Select.Root
        type="single"
        items={themes}
        allowDeselect={true}
        bind:value={sortOrder as never}
      >
        <Select.Trigger
          class="inline-flex h-10 w-74 items-center rounded-md border border-outline bg-background px-5 text-sm transition-colors "
          aria-label="Select a theme"
        >
          <Select.Value placeholder="Select a sort order" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            class="z-50  w-74 border border-outline bg-background shadow-lg rounded-xl select-none px-1 py-3 "
          >
            <Select.ScrollUpButton
              class="flex w-full items-center justify-center"
            >
              <!-- <CaretDoubleUp class="size-3" /> -->
            </Select.ScrollUpButton>
            <Select.Viewport class="p-1">
              {#each orderData as theme, i (theme.value)}
                <Select.Item
                  class="flex h-10 w-full select-none items-center rounded-md px-3 py-2 text-sm capitalize data-highlighted:bg-surface-container data-disabled:opacity-50 gap-2"
                  value={theme.value}
                  label={theme.label}
                >
                  {#snippet children({ selected })}
                    <theme.icon />
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
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <Toggle.Root
        aria-label="toggle code visibility"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-background transition-colors hover:bg-surface-container data-[state=on]:bg-surface-container  active:scale-[0.98]"
        bind:pressed={reverse}
      >
        <Triangle rotate={180} class={[reverse ? "rotate-180" : ""]} />
      </Toggle.Root>
    </div>
    <UserList {sortedTags} />
  {/if}
</div>
