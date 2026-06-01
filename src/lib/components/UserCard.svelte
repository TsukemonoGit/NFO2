<script lang="ts">
  import type { UserStatus, Profile } from "$lib/types";
  import { datetime, formatRelativeDate } from "$lib/utils/utils";
  import type * as Nostr from "nostr-typedef";

  interface Props {
    pubkey: string;
    petname: string;
    userStatus: UserStatus | undefined;
    latestNote: Nostr.Event | undefined;
    profile: Profile | undefined;
  }
  let { pubkey, petname, userStatus, latestNote, profile }: Props = $props();
</script>

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
          {userStatus?.petname || ""}
        </span>
        <span
          class="rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-600"
        >
          {userStatus?.mutual || ""}
        </span>
      </div>
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
      <time datetime={datetime(latestNote.created_at)}>
        {formatRelativeDate(latestNote.created_at, "en")}</time
      >
    </div>
  {/if}
</div>
