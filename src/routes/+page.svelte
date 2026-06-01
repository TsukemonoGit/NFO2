<script lang="ts">
  import UserCard from "$lib/components/UserCard.svelte";
  import { latestKind3 } from "$lib/store/store.svelte";
  import { hexRegex } from "$lib/utils/regex";
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

  let sortOrder = $state(SortOrder.follow);
  let reverse = $state(false);
  let sortedTags: string[][] = $state([]);
  const labels: Record<SortOrder, string> = {
    [SortOrder.follow]: "Follow",
    [SortOrder.latestPost]: "Latest Post",
    [SortOrder.mutual]: "Mutual",
    [SortOrder.myPetname]: "MyPetname",
    [SortOrder.theirPetname]: "TheirPetname",
  };
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
        class="inline-flex h-10 w-74 items-center rounded-md border border-outline bg-background p-1 text-sm transition-colors "
        aria-label="Select a theme"
      >
        <Select.Value placeholder="Select a sort order" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          class="z-50  w-74 border border-outline bg-background shadow-lg rounded-xl select-none px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <Select.ScrollUpButton
            class="flex w-full items-center justify-center"
          >
            <!-- <CaretDoubleUp class="size-3" /> -->
          </Select.ScrollUpButton>
          <Select.Viewport class="p-1">
            {#each orderData as theme, i (theme.value)}
              <Select.Item
                class="flex h-10 w-full select-none items-center rounded-md px-5 py-3 text-sm capitalize data-highlighted:bg-surface-container data-disabled:opacity-50 gap-2"
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
          <Select.ScrollDownButton
            class="flex w-full items-center justify-center"
          >
            <!--  <CaretDoubleDown class="size-3" /> -->
          </Select.ScrollDownButton>
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
  {#each sortedTags as tags}
    {#if tags[0] === "p" && hexRegex.test(tags[1])}
      {@const petname = tags[3] || undefined}
      <UserCard {petname} pubkey={tags[1]} />
    {/if}
  {/each}
{/if}
