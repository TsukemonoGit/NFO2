/* import * as Nostr from "nostr-typedef";
import type { Profile } from "./profile"; */

/** pubkeyごとのデータを保存するための型 */
/*export type FollowerMap = Record<string, UserData>;

//kind3でわかるでーたと。フェッチでえるでーたをわけてかんがえる
//ふぇっちでーたは、tanstack queryにいれてかんりする。
/**
 export interface UserData {
  npub: string;
  relayUrl?: string;
  petname?: string;
 // profile?: Profile; tanstack queryにいれてかんりする。
  // mutualStatus: MutualStatus;tanstack queryにいれてかんりする。
 // latestNote?: Nostr.Event;  tanstack queryにいれてかんりする。
} */
export type MutualStatus = "mutual" | "notMutual" | "unknown";
export const MUTUAL_RANK: Record<MutualStatus, number> = {
  mutual: 0,
  notMutual: 1,
  unknown: 2,
};
