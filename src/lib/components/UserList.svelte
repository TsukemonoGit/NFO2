<script lang="ts">
  import { hexRegex } from "$lib/utils/regex";
  import { CircleQuestionMark } from "@lucide/svelte";
  import UserCard from "./UserCard.svelte";
  import { ToggleGroup } from "bits-ui";
  import { Button } from "bits-ui";
  import UserData from "./UserData.svelte";
  import type { UserStatus, Profile, ViewData } from "$lib/types";
  import type * as Nostr from "nostr-typedef";
  import UserDetailModal from "./UserDetailModal.svelte";

  let { sortedTags }: { sortedTags: string[][] } = $props();

  let deleteIds: string[] = $state([]);

  let viewData: ViewData = $state({
    userStatus: undefined,
    latestNote: undefined,
    profile: undefined,
    petname: undefined,
  });
  let open = $state(false);

  function more(
    {
      userStatus,
      latestNote,
      profile,
    }: {
      userStatus: UserStatus | undefined;
      latestNote: Nostr.Event | undefined;
      profile: Profile | undefined;
    },
    petname: string | undefined,
  ) {
    viewData = {
      userStatus,
      latestNote,
      profile,
      petname,
    };
    console.log(viewData);
    open = true;
  }

  function onDelete() {
    console.log();
  }
</script>

{deleteIds.length}件選択中

{#if deleteIds.length > 0}
  <Button.Root
    onclick={onDelete}
    class="sticky top-1 float-end inline-flex h-12 w-24 items-center justify-center rounded-md bg-error-container font-semibold text-on-error-container shadow-sm hover:bg-error-container/90 active:scale-[0.98] active:transition-all"
  >
    Delete
  </Button.Root>
{/if}

<ToggleGroup.Root bind:value={deleteIds} type="multiple">
  {#each sortedTags as [p, npub, relay, petname]}
    {#if p === "p" && hexRegex.test(npub)}
      <UserData pubkey={npub}>
        {#snippet children({ userStatus, latestNote, profile })}
          <div class="flex w-full rounded-md border border-outline-variant">
            <ToggleGroup.Item
              aria-label={npub}
              value={npub}
              class="min-w-0 flex w-full items-start rounded-l-md bg-surface-container-lowest p-4 text-left transition-colors hover:bg-primary-container/60 data-[state=on]:border-l-4 data-[state=on]:border-l-primary data-[state=on]:text-on-primary-container active:scale-[0.98] active:data-[state=on]:border-l-4 active:data-[state=on]:border-l-primary-container/60"
            >
              <UserCard
                {petname}
                pubkey={npub}
                {userStatus}
                {latestNote}
                {profile}
              />
            </ToggleGroup.Item>
            <Button.Root
              onclick={() => more({ userStatus, latestNote, profile }, petname)}
              class="inline-flex w-12 shrink-0 items-center justify-center rounded-r-md bg-secondary-container/80 font-semibold text-on-secondary-container shadow-sm hover:bg-secondary-container active:scale-[0.98] active:transition-all"
            >
              <CircleQuestionMark />
            </Button.Root>
          </div>
        {/snippet}</UserData
      >
    {/if}
  {/each}
</ToggleGroup.Root>
<UserDetailModal bind:open {viewData} />
