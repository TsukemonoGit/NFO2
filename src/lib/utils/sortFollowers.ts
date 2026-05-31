import type * as Nostr from "nostr-typedef";
import type { QueryClient } from "@tanstack/svelte-query";
import { queryKeys } from "$lib/store/constants";
import { latestKind3 } from "$lib/store/store.svelte";
import type { UserStatus } from "$lib/types";

export enum SortOrder {
  follow = "follow",
  latestPost = "latestPost",
  mutual = "mutual",
  petname = "petname",
}

export function sortFollowList(
  followList: string[],
  sortOrder: SortOrder,
  queryClient: QueryClient,
): string[] {
  const indexed = followList.map((pubkey, followIndex) => {
    const latestNote = queryClient.getQueryData<Nostr.Event>([
      queryKeys.latestNote,
      pubkey,
    ]);

    const userStatus = queryClient.getQueryData<UserStatus>([
      queryKeys.userStatus,
      pubkey,
    ]);

    let myPetname: string | undefined;

    const tag = latestKind3.value?.tags.find(
      (t) => t[0] === "p" && t[1] === pubkey,
    );

    if (tag) {
      myPetname = tag[3];
    }

    return {
      pubkey,
      followIndex,
      latestCreatedAt: latestNote?.created_at ?? 0,
      mutual: userStatus?.mutual === "mutual",
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

    case SortOrder.petname:
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

    case SortOrder.follow:
    default:
      indexed.sort((a, b) => {
        return a.followIndex - b.followIndex;
      });
      break;
  }

  return indexed.map((v) => v.pubkey);
}
