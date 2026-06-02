<script lang="ts">
  import { queryKeys } from "$lib/store/constants";
  import { queryClient } from "$lib/store/store.svelte";
  import { QueryObserver } from "@tanstack/svelte-query";
  import type { UserStatus, Profile } from "$lib/types";
  import type * as Nostr from "nostr-typedef";
  import { untrack, type Snippet } from "svelte";
  interface Props {
    pubkey: string;
    children: Snippet<
      [
        {
          userStatus: UserStatus | undefined;
          latestNote: Nostr.Event | undefined;
          profile: Profile | undefined;
        },
      ]
    >;
  }
  let { pubkey, children }: Props = $props();

  let userStatus = $state<UserStatus | undefined>(undefined);
  let latestNote = $state<Nostr.Event | undefined>(undefined);
  let profile = $state<Profile | undefined>(undefined);

  let unsubscribeStatus: () => void;
  let unsubscribeLatest: () => void;
  let unsubscribeProfile: () => void;

  $effect(() => {
    if (pubkey) {
      untrack(() => {
        resetData();
        getUserProfile();
        getUserLatestNote();
        getUserStatus();
      });
    }
  });
  function resetData() {
    userStatus = undefined;
    latestNote = undefined;
    profile = undefined;
    unsubscribeStatus?.();
    unsubscribeLatest?.();
    unsubscribeProfile?.();
  }
  function getUserProfile() {
    const cachedProfile = queryClient.value!.getQueryData([
      queryKeys.profile,
      pubkey,
    ]);
    if (cachedProfile) {
      profile = cachedProfile as Profile;
    }
    const obsProfile = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.profile, pubkey],
    });
    unsubscribeProfile = obsProfile.subscribe((result) => {
      if (result.data !== undefined) {
        profile = result.data as Profile;
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
    }
    const obsLatest = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.latestNote, pubkey],
    });
    unsubscribeLatest = obsLatest.subscribe((result) => {
      if (result.data !== undefined) {
        latestNote = result.data as Nostr.Event;
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
    }
    const obsStatus = new QueryObserver(queryClient.value!, {
      // svelte-ignore state_referenced_locally
      queryKey: [queryKeys.userStatus, pubkey],
    });
    unsubscribeStatus = obsStatus.subscribe((result) => {
      if (result.data !== undefined) {
        userStatus = result.data as UserStatus;
      }
    });
  }
</script>

{@render children({ userStatus, latestNote, profile })}
