import type { QueryClient } from "@tanstack/svelte-query";
import * as Nostr from "nostr-typedef";

export const loginUser: { value: string } = $state({ value: "" });

export const latestKind3: { value: Nostr.Event | null } = $state({
  value: null,
});

export const queryClient: { value: QueryClient | null } = $state({
  value: null,
});
