import type { FollowerMap, MutualStatus } from "$lib/types";
import { getProfile } from "$lib/utils/utils";
import { nip19 } from "nostr-tools";
import * as Nostr from "nostr-typedef";

export const followerMap = $state<FollowerMap>({});

export function initUser(tag: string[]) {
  if (tag[0] !== "p" || tag.length < 2) return;
  const pubkey = tag[1];
  if (followerMap[pubkey]) return;
  followerMap[pubkey] = {
    npub: nip19.npubEncode(pubkey),
    relayUrl: tag[2] || undefined,
    petname: tag[3] || undefined,
  };
}

export function setLatestNote(pubkey: string, note: Nostr.Event) {
  if (!followerMap[pubkey]) return;
  followerMap[pubkey].latestNote = note;
}

export function setMutualStatus(pubkey: string, val: MutualStatus) {
  if (!followerMap[pubkey]) return;
  followerMap[pubkey].mutualStatus = val;
}

export function setPetname(pubkey: string, val: string) {
  if (!followerMap[pubkey]) return;
  followerMap[pubkey].petname = val;
}

export function setProfile(pubkey: string, ev: Nostr.Event) {
  if (!followerMap[pubkey]) return;
  const profile = getProfile(ev);
  if (profile) {
    followerMap[pubkey].profile = profile;
  }
}
