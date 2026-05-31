<script>
  import UserCard from "$lib/components/UserCard.svelte";
  import { latestKind3 } from "$lib/store/store.svelte";
  import { hexRegex } from "$lib/utils/regex";
</script>

<h1 class="text-lg">Nostr Follow Organizer 2</h1>
{#if latestKind3.value}
  {#each latestKind3.value.tags as tags, index (index)}
    {#if tags[0] === "p" && hexRegex.test(tags[1])}
      {@const petname = tags[3] || undefined}
      <UserCard {petname} pubkey={tags[1]} />
    {/if}
  {/each}
{/if}
