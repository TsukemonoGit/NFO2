<script lang="ts">
  import { hexRegex } from "$lib/utils/regex";
  import { CircleQuestionMark } from "@lucide/svelte";
  import UserCard from "./UserCard.svelte";
  import { ToggleGroup } from "bits-ui";
  import { Button } from "bits-ui";
  import UserData from "./UserData.svelte";
  import type { UserStatus, Profile } from "$lib/types";
  import type * as Nostr from "nostr-typedef";

  let { sortedTags }: { sortedTags: string[][] } = $props();

  let deleteIds: string[] = $state([]);

  let viewData: {
    userStatus: UserStatus | undefined;
    latestNote: Nostr.Event | undefined;
    profile: Profile | undefined;
    petname: string | undefined;
  } = $state({
    userStatus: undefined,
    latestNote: undefined,
    profile: undefined,
    petname: undefined,
  });

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
  }

  function onDelete() {
    console.log();
  }
</script>

{deleteIds.length}件選択中

{#if deleteIds.length > 0}
  <Button.Root
    onclick={onDelete}
    class="sticky top-1 float-end rounded-input rounded-md bg-error-container shadow-mini hover:bg-error-container/90 inline-flex text-on-error-container w-24
	h-12 items-center justify-center 
	font-semibold active:scale-[0.98] active:transition-all"
  >
    Delete
  </Button.Root>
{/if}

<ToggleGroup.Root bind:value={deleteIds} type="multiple">
  {#each sortedTags as [p, npub, relay, petname]}
    {#if p === "p" && hexRegex.test(npub)}
      <UserData pubkey={npub}>
        {#snippet children({ userStatus, latestNote, profile })}
          <div class="flex w-full border border-outline-variant rounded-md">
            <ToggleGroup.Item
              aria-label={npub}
              value={npub}
              class="flex w-full items-start bg-surface-container-lowest p-4 transition-colors text-left border-l-primary
    rounded-l-md hover:bg-primary-container/60 active:border-l-primary-container/60 data-[state=on]:border-l-4 data-[state=on]:text-on-primary-container active:data-[state=on]:border-l-4 active:scale-[0.98]"
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
              class="float-right rounded-input rounded-r-md bg-secondary-container/80 shadow-mini hover:bg-secondary-container inline-flex text-on-secondary-container
	 items-center justify-center w-12 
	font-semibold active:scale-[0.98] active:transition-all"
            >
              <CircleQuestionMark />
            </Button.Root>
          </div>
        {/snippet}</UserData
      >
    {/if}
  {/each}
</ToggleGroup.Root>
