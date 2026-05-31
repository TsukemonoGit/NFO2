import type { FollowerMap, MutualStatus } from "$lib/types";
import { MUTUAL_RANK, SortOrder } from "$lib/types";

export function sortFollowers(
  pubkeys: string[],
  map: FollowerMap,
  order: SortOrder,
): string[] {
  return [...pubkeys].sort((a, b) => {
    switch (order) {
      case SortOrder.follow:
        return 0;
      case SortOrder.latestPost: {
        const aTime = map[a]?.latestNote?.created_at ?? null;
        const bTime = map[b]?.latestNote?.created_at ?? null;
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        return aTime - bTime;
      }
      case SortOrder.mutual: {
        const aRank = MUTUAL_RANK[map[a]?.mutualStatus ?? "unknown"];
        const bRank = MUTUAL_RANK[map[b]?.mutualStatus ?? "unknown"];
        return aRank - bRank;
      }
      case SortOrder.petname: {
        const aPetname = map[a]?.petname ?? null;
        const bPetname = map[b]?.petname ?? null;
        if (aPetname === null) return 1;
        if (bPetname === null) return -1;
        return aPetname.localeCompare(bPetname);
      }
      default:
        return 0;
    }
  });
}
