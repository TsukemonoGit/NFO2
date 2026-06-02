import type * as Nostr from "nostr-typedef";
import { publishEvent } from "./rx-nostr";

function createKind3Draft(
  tags: string[][],
  latestKind3: Nostr.Event,
): Nostr.EventParameters {
  return {
    kind: 3,
    tags: tags as Nostr.Tag.Any[],
    pubkey: latestKind3.pubkey,
    content: latestKind3.content,
  };
}

export function updatePetname(
  npub: string,
  petname: string,
  latestKind3: Nostr.Event,
) {
  const tags = latestKind3.tags.map((tag) => {
    if (tag[0] !== "p" || tag[1] !== npub) return [...tag];

    const nextTag = [...tag] as string[];
    nextTag[2] ??= "";
    nextTag[3] = petname;
    return nextTag;
  });

  const evprm = createKind3Draft(tags, latestKind3);
  publishEvent($state.snapshot(evprm));
}

export function deleteFromKind3(deleteIds: string[], latestKind3: Nostr.Event) {
  const deleteIdSet = new Set(deleteIds);
  const tags = latestKind3.tags
    .filter((tag) => tag[0] !== "p" || !deleteIdSet.has(tag[1]))
    .map((tag) => [...tag]);

  const evprm = createKind3Draft(tags, latestKind3);
  publishEvent($state.snapshot(evprm));
}
