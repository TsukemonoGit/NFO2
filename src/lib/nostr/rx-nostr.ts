import {
  createRxBackwardReq,
  createRxForwardReq,
  createRxNostr,
  latest,
  uniq,
  type EventPacket,
} from "rx-nostr";
import { verifier } from "@rx-nostr/crypto";
import { queryKeys, relaySearchRelays } from "$lib/store/constants";
import * as Nostr from "nostr-typedef";
import { latestKind3, loginUser } from "$lib/store/store.svelte";
import { getProfile } from "$lib/utils/utils";
import { filter, share } from "rxjs";
import { QueryClient } from "@tanstack/svelte-query";
import type { Profile, UserStatus } from "$lib/types";

const rxNostr = createRxNostr({
  verifier,
  authenticator: "auto",
  eoseTimeout: 5000,
});

rxNostr.setDefaultRelays(relaySearchRelays);

const req = createRxForwardReq();

const stream$ = rxNostr.use(req).pipe(uniq(), share());

const kind3$ = stream$.pipe(
  filter((pk) => pk.event.kind === 3 && pk.event.pubkey === loginUser.value),
);

const others$ = stream$.pipe(
  filter((pk) => !(pk.event.kind === 3 && pk.event.pubkey === loginUser.value)),
);

kind3$.subscribe({
  next: (pk) => {
    if (
      !latestKind3.value ||
      latestKind3.value.pubkey !== loginUser.value ||
      pk.event.created_at > latestKind3.value.created_at
    ) {
      latestKind3.value = pk.event;
    }
  },
  error: () => {},
  complete: () => {},
});

others$.subscribe({
  next: () => {},
  error: () => {},
  complete: () => {},
});

export function setEmit(filters: Nostr.Filter[]) {
  req.emit(filters);
}

export async function set10002Relays(pubkey: string) {
  const filter = { authors: [pubkey], limit: 1, kinds: [10002] };
  const ev = await getOneshotEvent([filter]);
  console.log(ev);
  if (ev) {
    rxNostr.setDefaultRelays(ev.tags);
    //  console.log(rxNostr.getDefaultRelays());
  }
}

export async function getOneshotEvent(
  filters: Nostr.Filter[],
): Promise<Nostr.Event | null> {
  let res: Nostr.Event | null = null;
  const req = createRxBackwardReq();
  const obs = rxNostr.use(req).pipe(latest());

  return new Promise<Nostr.Event | null>((resolve) => {
    const timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      resolve(res);
    }, 10000);

    const subscription = obs.subscribe({
      next: (v: EventPacket) => {
        subscription.unsubscribe();
        res = v.event;
        clearTimeout(timeoutId);
        resolve(res);
      },
      complete: () => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      error: (e) => {
        subscription.unsubscribe();
        console.error("[rx-nostr]", e);
        clearTimeout(timeoutId);
        resolve(res);
      },
    });

    req.emit(filters);
  });
}

interface FetchFollowListOptions {
  kind3?: boolean;
}

export function fetchFollowListEvents(
  queryClient: QueryClient,
  followList: string[],
  options: FetchFollowListOptions = {},
) {
  fetchKind1Events(queryClient, followList);

  fetchKind0Events(queryClient, followList);
  if (options.kind3) {
    fetchKind3Events(queryClient, followList);
  }
}

let isKind1Fetching = false; //連続でよばれないようにするため。

function fetchKind1Events(queryClient: QueryClient, followList: string[]) {
  if (isKind1Fetching) return;
  isKind1Fetching = true;

  const cachedKind1 = queryClient.getQueriesData<Nostr.Event>({
    queryKey: [queryKeys.latestNote],
  });

  const cachedKind1Pubkeys = new Set(
    cachedKind1
      .filter(([, data]) => data !== undefined)
      .map(([key]) => key[1] as string),
  );

  const missingKind1: string[] = followList.filter(
    (pk) => !cachedKind1Pubkeys.has(pk),
  );

  const kind1Filters: Nostr.Filter[] = missingKind1.map((user) => ({
    authors: [user],
    limit: 1,
    kinds: [1],
  }));
  const kind1Req = createRxBackwardReq("kind1");

  rxNostr
    .use(kind1Req)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        queryClient.setQueryData(
          [queryKeys.latestNote, pk.event.pubkey],
          (before: Nostr.Event | undefined) => {
            if (!before || pk.event.created_at > before.created_at) {
              return pk.event;
            }
            return before;
          },
        );
      },
      error: () => {
        isKind1Fetching = false;
      },
      complete: () => {
        isKind1Fetching = false;
      },
    });
  setTimeout(() => {
    kind1Req.emit(kind1Filters);
  }, 10);
}

let isKind0Fetching = false; //連続でよばれないようにするため。
function fetchKind0Events(queryClient: QueryClient, followList: string[]) {
  if (isKind0Fetching) return;
  isKind0Fetching = true;

  const cachedKind0 = queryClient.getQueriesData<Profile>({
    queryKey: [queryKeys.profile],
  });

  const cachedKind0Pubkeys = new Set(
    cachedKind0
      .filter(([, data]) => data !== undefined)
      .map(([key]) => key[1] as string),
  );

  const missingKind0: string[] = followList.filter(
    (pk) => !cachedKind0Pubkeys.has(pk),
  );

  const kind0Filters: Nostr.Filter[] = missingKind0.map((user) => ({
    authors: [user],
    limit: 1,
    kinds: [0],
  }));

  const kind0Req = createRxBackwardReq("kind0");

  rxNostr
    .use(kind0Req)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        const profile = getProfile(pk.event);
        if (profile) {
          queryClient.setQueryData(
            [queryKeys.profile, pk.event.pubkey],
            (before: Profile | undefined) => {
              if (!before || profile.created_at > before.created_at) {
                return profile;
              }
              return before;
            },
          );
        }
      },
      error: () => {
        isKind0Fetching = false;
      },
      complete: () => {
        isKind0Fetching = false;
      },
    });
  kind0Req.emit(kind0Filters);
}

let isKind3Fetching = false; //連続でよばれないようにするため。
function fetchKind3Events(queryClient: QueryClient, followList: string[]) {
  if (isKind3Fetching) return;
  isKind3Fetching = true;

  const cachedKind3 = queryClient.getQueriesData<UserStatus>({
    queryKey: [queryKeys.userStatus],
  });

  const cachedKind3Pubkeys = new Set(
    cachedKind3
      .filter(([, data]) => data !== undefined)
      .map(([key]) => key[1] as string),
  );

  const missingKind3: string[] = followList.filter(
    (pk) => !cachedKind3Pubkeys.has(pk),
  );
  const kind3Filters: Nostr.Filter[] = missingKind3.map((user) => ({
    authors: [user],
    limit: 1,
    kinds: [3],
  }));

  if (kind3Filters.length > 0) {
    const kind3Req = createRxBackwardReq("kind3");

    rxNostr
      .use(kind3Req)
      .pipe(uniq())
      .subscribe({
        next: (pk) => {
          const myData = pk.event.tags.find(
            (tag) => tag[0] === "p" && tag[1] === loginUser.value,
          );

          const status: UserStatus = {
            mutual: myData ? "mutual" : "notMutual",
            petname: myData?.[3] || undefined,
          };

          queryClient.setQueryData(
            [queryKeys.userStatus, pk.event.pubkey],
            (before: UserStatus | undefined) => {
              if (!before) {
                return status;
              }
              return before;
            },
          );
        },
        error: () => {
          isKind3Fetching = false;
        },
        complete: () => {
          isKind3Fetching = false;
        },
      });

    kind3Req.emit(kind3Filters);
  }
}
