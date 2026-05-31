import * as Nostr from "nostr-typedef";
import type { Profile } from "./profile";

/** pubkeyごとのデータを保存するための型 */
export type FollowerMap = Record<string, UserData>;

export interface UserData {
  npub: string;
  relayUrl?: string;
  petname?: string;
  profile?: Profile;
  mutualStatus?: MutualStatus; //相互かどうか(フォローされてるかどうか)
  latestNote?: Nostr.Event; //最新の投稿
}
export type MutualStatus = "mutual" | "not_mutual" | "unknown";
export const MUTUAL_RANK: Record<MutualStatus, number> = {
  mutual: 0,
  not_mutual: 1,
  unknown: 2,
};
