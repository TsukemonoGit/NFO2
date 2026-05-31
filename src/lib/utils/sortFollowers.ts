import type * as Nostr from "nostr-typedef";
import { queryKeys } from "$lib/store/constants";
import { SortOrder, type UserStatus } from "$lib/types";
import { queryClient } from "$lib/store/store.svelte";

export function sortFollowList(
  tags: string[][],
  sortOrder: SortOrder,
): string[][] {
  const indexed = tags.map((tag, followIndex) => {
    const pubkey = tag[1];
    const qc = queryClient.value;
    const latestNote = qc
      ? qc.getQueryData<Nostr.Event>([queryKeys.latestNote, pubkey])
      : undefined;

    const userStatus = qc
      ? qc.getQueryData<UserStatus>([queryKeys.userStatus, pubkey])
      : undefined;

    const myPetname: string | undefined = tag[3];

    return {
      tag,
      pubkey,
      followIndex,
      latestCreatedAt: latestNote?.created_at ?? 0,
      mutual: userStatus?.mutual === "mutual",
      theirPetname: userStatus?.petname,
      myPetname,
    };
  });

  switch (sortOrder) {
    case SortOrder.latestPost:
      indexed.sort((a, b) => {
        return b.latestCreatedAt - a.latestCreatedAt;
      });
      break;

    case SortOrder.mutual:
      indexed.sort((a, b) => {
        if (a.mutual === b.mutual) {
          return a.followIndex - b.followIndex;
        }

        return a.mutual ? -1 : 1;
      });
      break;

    case SortOrder.theirPetname:
      indexed.sort((a, b) => {
        const aName = a.theirPetname ?? "";
        const bName = b.theirPetname ?? "";

        const aHas = aName.length > 0;
        const bHas = bName.length > 0;

        if (aHas !== bHas) {
          return aHas ? -1 : 1;
        }

        const result = aName.localeCompare(bName, "ja");

        if (result !== 0) {
          return result;
        }

        return a.followIndex - b.followIndex;
      });
      break;
    case SortOrder.myPetname: {
      indexed.sort((a, b) => {
        const aName = a.myPetname ?? "";
        const bName = b.myPetname ?? "";

        const aHas = aName.length > 0;
        const bHas = bName.length > 0;

        if (aHas !== bHas) {
          return aHas ? -1 : 1;
        }

        const result = aName.localeCompare(bName, "ja");

        if (result !== 0) {
          return result;
        }

        return a.followIndex - b.followIndex;
      });
      break;
    }
    case SortOrder.follow:
    default:
      indexed.sort((a, b) => {
        return a.followIndex - b.followIndex;
      });
      break;
  }

  return indexed.map((v) => v.tag);
}
