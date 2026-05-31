/* import * as Nostr from "nostr-typedef";
import type { Profile } from "./profile"; */

/** pubkeyごとのデータを保存するための型 */
export type FollowerMap = Record<string, UserData>;

//並べ替え計算用のデータ

export interface UserData {
  myPetname?: string;
  theirPetname?: string;
  latestCreated_at?: number;
  mutualStatus?: MutualStatus;
}

export interface UserStatus {
  mutual: MutualStatus;
  petname?: string;
}
export type MutualStatus = "mutual" | "notMutual" | "unknown";
export const MUTUAL_RANK: Record<MutualStatus, number> = {
  mutual: 0,
  notMutual: 1,
  unknown: 2,
};
