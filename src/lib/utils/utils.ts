import type { Profile } from "$lib/types";
import * as Nostr from "nostr-typedef";

export function getProfile(event: Nostr.Event): Profile | null {
  try {
    return JSON.parse(event.content);
  } catch (error) {
    return null;
  }
}
