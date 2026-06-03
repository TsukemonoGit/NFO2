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
  import EditPetnameModal from "./EditPetnameModal.svelte";
  import DeleteKind3ConfirmModal from "./DeleteKind3ConfirmModal.svelte";

  let { sortedTags }: { sortedTags: string[][] } = $props();

  let deleteIds: string[] = $state([]);

  let viewData: ViewData = $state({
    userStatus: undefined,
    latestNote: undefined,
    profile: undefined,
    petname: undefined,
    pubhex: "",
  });
  let detailOpen = $state(false);
  let editPetnameOpen = $state(false);
  let deleteConfirmOpen = $state(false);

  function more(
    {
      userStatus,
      latestNote,
      profile,
      pubhex,
    }: {
      userStatus: UserStatus | undefined;
      latestNote: Nostr.Event | undefined;
      profile: Profile | undefined;
      pubhex: string;
    },
    petname: string | undefined,
  ) {
    viewData = {
      pubhex,
      userStatus,
      latestNote,
      profile,
      petname,
    };
    //console.log(viewData);
    detailOpen = true;
  }

  function onDelete() {
    deleteConfirmOpen = true;
  }

  function clearSelection() {
    deleteIds = [];
  }

  let editingpetname = $state("");
  function editPetname(
    {
      userStatus,
      latestNote,
      profile,
      pubhex,
    }: {
      userStatus: UserStatus | undefined;
      latestNote: Nostr.Event | undefined;
      profile: Profile | undefined;
      pubhex: string;
    },
    petname: string | undefined,
  ) {
    viewData = {
      pubhex,
      userStatus,
      latestNote,
      profile,
      petname,
    };
    editingpetname = petname || "";
    editPetnameOpen = true;
  }
</script>

<div class="sticky top-1 backdrop-blur-lg">
  {deleteIds.length}件選択中

  <Button.Root
    onclick={clearSelection}
    class="float-end inline-flex h-12 w-24 items-center justify-center rounded-md bg-surface-container font-semibold text-on-surface shadow-sm hover:bg-surface-container/90 active:scale-[0.98] active:transition-all disabled:opacity-30 "
    disabled={deleteIds.length == 0}
  >
    選択解除
  </Button.Root>

  <Button.Root
    onclick={onDelete}
    class="float-end inline-flex h-12 w-24 items-center justify-center rounded-md bg-error-container font-semibold text-on-error-container shadow-sm hover:bg-error-container/90 active:scale-[0.98] active:transition-all disabled:opacity-30 mr-2"
    disabled={deleteIds.length == 0}
  >
    Delete
  </Button.Root>
</div>

<ToggleGroup.Root bind:value={deleteIds} type="multiple">
  {#each sortedTags as [p, pubhex, relay, petname]}
    {#if p === "p" && hexRegex.test(pubhex)}
      <UserData pubkey={pubhex}>
        {#snippet children({ userStatus, latestNote, profile })}
          <div class="flex w-full rounded-md border border-primary/20">
            <ToggleGroup.Item
              aria-label={pubhex}
              value={pubhex}
              class="min-w-0 flex w-full items-start rounded-l-md bg-surface-container-lowest p-4 text-left transition-colors hover:bg-primary-container/60 data-[state=on]:border-l-4 data-[state=on]:border-l-primary data-[state=on]:text-on-primary-container active:scale-[0.98] active:data-[state=on]:border-l-4 active:data-[state=on]:border-l-primary-container/60 gap-2"
            >
              <UserCard
                {petname}
                pubkey={pubhex}
                {userStatus}
                {latestNote}
                {profile}
              />
            </ToggleGroup.Item>
            <div class="grid grid-col-[1/2fr_1/2fr] divide-primary/20 divide-y">
              <Button.Root
                onclick={() =>
                  editPetname(
                    { userStatus, latestNote, profile, pubhex },
                    petname,
                  )}
                class="inline-flex w-12 shrink-0 items-center justify-center rounded-tr-md bg-secondary-container/70 font-semibold text-on-secondary-container shadow-sm hover:bg-secondary-container active:scale-[0.98] active:transition-all"
              >
                📛
              </Button.Root><Button.Root
                onclick={() =>
                  more({ userStatus, latestNote, profile, pubhex }, petname)}
                class="inline-flex w-12 shrink-0 items-center justify-center  rounded-br-md bg-secondary-container/70 font-semibold text-on-secondary-container shadow-sm hover:bg-secondary-container active:scale-[0.98] active:transition-all"
              >
                <CircleQuestionMark />
              </Button.Root>
            </div>
          </div>
        {/snippet}</UserData
      >
    {/if}
  {/each}
</ToggleGroup.Root>
<UserDetailModal bind:open={detailOpen} {viewData} />
<EditPetnameModal bind:open={editPetnameOpen} {editingpetname} {viewData} />
<DeleteKind3ConfirmModal bind:open={deleteConfirmOpen} bind:deleteIds />
