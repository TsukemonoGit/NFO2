<script lang="ts">
  import { queryKeys } from "$lib/store/constants";
  import { queryClient } from "$lib/store/store.svelte";
  import { QueryObserver } from "@tanstack/svelte-query";
  import type { UserStatus, Profile } from "$lib/types";
  import type * as Nostr from "nostr-typedef";
  import { untrack } from "svelte";

  let { pubkey, petname }: { pubkey: string; petname?: string } = $props();

  let userStatus = $state<UserStatus | undefined>(undefined);
  let latestNote = $state<Nostr.Event | undefined>(undefined);
  let profile = $state<Profile | undefined>(undefined);

  $effect(() => {
    if (pubkey) {
      untrack(() => {
        getUserProfile();
        getUserLatestNote();
        getUserStatus();
      });
    }
  });

  function getUserProfile() {
    const cachedProfile = queryClient.value!.getQueryData([
      queryKeys.profile,
      pubkey,
    ]);
    if (cachedProfile) {
      profile = cachedProfile as Profile;
      return;
    }
    const obsProfile = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.profile, pubkey],
    });
    const unsubscribeProfile = obsProfile.subscribe((result) => {
      profile = result.data as Profile;

      if (result.data !== undefined) {
        unsubscribeProfile();
      }
    });
  }

  function getUserLatestNote() {
    const cachedLatestNote = queryClient.value!.getQueryData([
      queryKeys.latestNote,
      pubkey,
    ]);
    if (cachedLatestNote) {
      latestNote = cachedLatestNote as Nostr.Event;
      return;
    }
    const obsLatest = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.latestNote, pubkey],
    });
    const unsubscribeLatest = obsLatest.subscribe((result) => {
      latestNote = result.data as Nostr.Event;

      if (result.data !== undefined) {
        unsubscribeLatest();
      }
    });
  }

  function getUserStatus() {
    const cachedStatus = queryClient.value!.getQueryData([
      queryKeys.userStatus,
      pubkey,
    ]);
    if (cachedStatus) {
      userStatus = cachedStatus as UserStatus;
      return;
    }
    const obsStatus = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.userStatus, pubkey],
    });
    const unsubscribeStatus = obsStatus.subscribe((result) => {
      userStatus = result.data as UserStatus;

      if (result.data !== undefined) {
        unsubscribeStatus();
      }
    });
  }
</script>

<div
  class="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
>
  <div class="shrink-0">
    {#if profile?.picture}
      <img
        src={profile.picture}
        alt=""
        class="h-14 w-14 rounded-full border object-cover"
      />
    {:else}
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full border bg-muted text-xs"
      >
        ?
      </div>
    {/if}
  </div>

  <div class="min-w-0 flex-1">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="truncate font-medium">
            {profile?.display_name ?? profile?.name ?? "Unknown"}📛{petname}
          </h3>

          <span
            class="rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-600"
          >
            {userStatus?.mutual}
          </span>
        </div>

        <p class="mt-1 truncate text-xs text-muted-foreground">
          {pubkey}
        </p>
      </div>
    </div>

    {#if profile?.about}
      <p class="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {profile.about}
      </p>
    {/if}

    {#if latestNote}
      <div
        class="mt-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
      >
        <p class="line-clamp-2 break-all">
          {latestNote.content}
        </p>
      </div>
    {/if}
  </div>

  <div class="shrink-0">
    <!-- 後で Bits UI DropdownMenu 等を置く場所 -->
  </div>
</div>
