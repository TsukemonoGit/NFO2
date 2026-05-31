import {
  createRxBackwardReq,
  createRxForwardReq,
  createRxNostr,
  latest,
  uniq,
  type EventPacket,
} from "rx-nostr";
import { verifier } from "@rx-nostr/crypto";
import { relaySearchRelays } from "$lib/store/constants";
import * as Nostr from "nostr-typedef";
import {
  followerMap,
  initUser,
  latestKind3,
  loginUser,
  setLatestNote,
  setMutualStatus,
  setProfile,
} from "$lib/store/followStore.svelte";
import { getFollowList } from "$lib/utils/utils";
import { filter, share } from "rxjs";

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
  const filter = { authors: [pubkey], limit: 1 };
  const ev = await getOneshotEvent([filter]);
  if (ev) {
    rxNostr.setDefaultRelays(ev.tags);
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
  followList: string[],
  options: FetchFollowListOptions = {},
) {
  const { kind3 = false } = options;

  const kind0Filters = followList.map((user) => ({
    authors: [user],
    limit: 1,
    kinds: [0],
  }));
  const kind1Filters = followList.map((user) => ({
    authors: [user],
    limit: 1,
    kinds: [1],
  }));

  const kind0Req = createRxBackwardReq();
  const kind1Req = createRxBackwardReq();

  rxNostr
    .use(kind0Req)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        setProfile(pk.event.pubkey, pk.event);
      },
      error: () => {},
      complete: () => {},
    });

  rxNostr
    .use(kind1Req)
    .pipe(uniq())
    .subscribe({
      next: (pk) => {
        setLatestNote(pk.event.pubkey, pk.event);
      },
      error: () => {},
      complete: () => {},
    });

  kind0Req.emit(kind0Filters);
  kind1Req.emit(kind1Filters);

  if (kind3) {
    const kind3Filters = followList.map((user) => ({
      authors: [user],
      limit: 1,
      kinds: [3],
    }));
    const kind3Req = createRxBackwardReq();

    rxNostr
      .use(kind3Req)
      .pipe(uniq())
      .subscribe({
        next: (pk) => {
          const theirFollowList = getFollowList(pk.event);
          const status = theirFollowList.includes(loginUser.value)
            ? "mutual"
            : "notMutual";
          setMutualStatus(pk.event.pubkey, status);
        },
        error: () => {},
        complete: () => {},
      });

    kind3Req.emit(kind3Filters);
  }
}
