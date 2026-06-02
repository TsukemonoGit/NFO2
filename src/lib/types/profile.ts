import type { UserStatus } from ".";

import type * as Nostr from "nostr-typedef";

export interface Profile {
  [key: string]: any;
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  display_name?: string;
  website?: string;
  banner?: string;
  bot?: boolean;
  lud16?: string;
  lud06?: string;
  created_at?: number;
}
export enum SortOrder {
  follow = "follow",
  latestPost = "latestPost",
  mutual = "mutual",
  myPetname = "myPetname",
  theirPetname = "theirPetname",
}

export interface ViewData {
  userStatus: UserStatus | undefined;
  latestNote: Nostr.Event | undefined;
  profile: Profile | undefined;
  petname: string | undefined;
  npub: string;
}
