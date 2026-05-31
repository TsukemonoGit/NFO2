import type { Profile } from "$lib/types";
import * as Nostr from "nostr-typedef";
import { hexRegex } from "./regex";

export function getProfile(event: Nostr.Event): Profile | null {
  try {
    return JSON.parse(event.content);
  } catch (error) {
    return null;
  }
}

export function getFollowList(event: Nostr.Event): string[] {
  return event.tags
    .filter((tag) => tag[0] === "p" && hexRegex.test(tag[1]))
    .map((tag) => tag[1]);
}
