import * as Nostr from "nostr-typedef";

export function updatePetname(npub: string, petname: string) {
  console.log(npub, petname);
}

export function deleteFromKind3(deleteIds: string[], latestKind3: Nostr.Event) {
  console.log(deleteIds, latestKind3);
}
