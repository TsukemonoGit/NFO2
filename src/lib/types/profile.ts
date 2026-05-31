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
}
export enum SortOrder {
  follow = "follow",
  latestPost = "latestPost",
  mutual = "mutual",
  myPetname = "myPetname",
  theirPetname = "theirPetname",
}
