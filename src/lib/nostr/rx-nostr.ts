import {
  batch,
  chunk,
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
import { latestKind3, loginUser, queryClient } from "$lib/store/store.svelte";
import { getProfile } from "$lib/utils/utils";
import { filter, share } from "rxjs";
import { QueryClient, useQueryClient } from "@tanstack/svelte-query";
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
  let isFetching = false; //連続でよばれないようにするため。

  if (isFetching) return;
  isFetching = true;

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

  const req = createRxBackwardReq("kind1");
  const chunkedReq = req.pipe(
    chunk(
      (filters) => filters.length > 100,
      (filters) => {
        const pile = [...filters];
        const chunks = [];

        while (pile.length > 0) {
          chunks.push(pile.splice(0, 100));
        }

        return chunks;
      },
    ),
  );
  rxNostr
    .use(chunkedReq)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        setQuery(pk.event.kind, pk.event, queryClient);
      },
      error: () => {
        isFetching = false;
      },
      complete: () => {
        isFetching = false;
      },
    });

  req.emit([...kind1Filters, ...kind0Filters, ...kind3Filters]);
}

function setQuery(kind: number, ev: Nostr.Event, queryClient: QueryClient) {
  switch (kind) {
    case 1:
      queryClient.setQueryData(
        [queryKeys.latestNote, ev.pubkey],
        (before: Nostr.Event | undefined) => {
          if (!before || ev.created_at > before.created_at) {
            return ev;
          }
          return before;
        },
      );
      break;
    case 3:
      const myData = ev.tags.find(
        (tag) => tag[0] === "p" && tag[1] === loginUser.value,
      );

      const status: UserStatus = {
        mutual: myData ? "mutual" : "notMutual",
        petname: myData?.[3] || undefined,
      };

      queryClient.setQueryData(
        [queryKeys.userStatus, ev.pubkey],
        (before: UserStatus | undefined) => {
          if (!before || ev.created_at > (before.created_at || 0)) {
            return { ...status, created_at: ev.created_at };
          }
          return before;
        },
      );
      break;
    case 0:
      const profile = getProfile(ev);

      if (profile) {
        queryClient.setQueryData(
          [queryKeys.profile, ev.pubkey],
          (before: Profile | undefined) => {
            if (!before || ev.created_at > (before.created_at || 0)) {
              return { ...profile, created_at: ev.created_at };
            }
            return before;
          },
        );
      }
      break;
    default:
      break;
  }
}

export function refetchEvent(npub: string, kind: number) {
  const filter: Nostr.Filter = { authors: [npub], kinds: [kind], limit: 1 };
  const req = createRxBackwardReq();
  rxNostr
    .use(req)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        //console.log(pk);
        setQuery(pk.event.kind, pk.event, queryClient.value!);
      },
      error: () => {},
      complete: () => {},
    });

  req.emit(filter);
}
