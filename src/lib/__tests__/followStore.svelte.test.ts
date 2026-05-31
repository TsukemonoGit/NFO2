// followStore.svelte.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("nostr-tools", () => ({
  nip19: {
    npubEncode: vi.fn((pubkey: string) => `npub_${pubkey}`),
  },
}));

vi.mock("$lib/utils/utils", () => ({
  getProfile: vi.fn(),
}));

import { getProfile } from "$lib/utils/utils";

import type * as Nostr from "nostr-typedef";
import {
  followerMap,
  initUser,
  setLatestNote,
  setMutualStatus,
  setPetname,
  setProfile,
} from "$lib/store/followStore.svelte";

const PUBKEY = "a".repeat(64);

const mockEvent = {
  id: "1",
  pubkey: PUBKEY,
  kind: 1,
  content: "hello",
  tags: [],
  created_at: 1000,
  sig: "",
} satisfies Nostr.Event;

beforeEach(() => {
  for (const key of Object.keys(followerMap)) {
    delete (followerMap as Record<string, unknown>)[key];
  }
  vi.clearAllMocks();
});

describe("initUser", () => {
  it("tag[0]がpでない場合は無視する", () => {
    initUser(["e", PUBKEY]);
    expect(Object.keys(followerMap)).toHaveLength(0);
  });

  it("tag.length < 2の場合は無視する", () => {
    initUser(["p"]);
    expect(Object.keys(followerMap)).toHaveLength(0);
  });

  it("正常なタグでエントリを初期化する", () => {
    initUser(["p", PUBKEY, "wss://relay.example.com", "alice"]);
    expect(followerMap[PUBKEY]).toEqual({
      npub: `npub_${PUBKEY}`,
      relayUrl: "wss://relay.example.com",
      petname: "alice",
    });
  });

  it("relayUrlとpetnameが空文字の場合はundefinedになる", () => {
    initUser(["p", PUBKEY, "", ""]);
    expect(followerMap[PUBKEY].relayUrl).toBeUndefined();
    expect(followerMap[PUBKEY].petname).toBeUndefined();
  });

  it("relayUrlとpetnameが省略された場合はundefinedになる", () => {
    initUser(["p", PUBKEY]);
    expect(followerMap[PUBKEY].relayUrl).toBeUndefined();
    expect(followerMap[PUBKEY].petname).toBeUndefined();
  });

  it("既存エントリは上書きしない", () => {
    initUser(["p", PUBKEY, "wss://relay1.example.com", "alice"]);
    initUser(["p", PUBKEY, "wss://relay2.example.com", "bob"]);
    expect(followerMap[PUBKEY].relayUrl).toBe("wss://relay1.example.com");
    expect(followerMap[PUBKEY].petname).toBe("alice");
  });
});

describe("setLatestNote", () => {
  it("エントリが存在しない場合はクラッシュしない", () => {
    expect(() => setLatestNote(PUBKEY, mockEvent)).not.toThrow();
    expect(followerMap[PUBKEY]).toBeUndefined();
  });

  it("latestNoteを更新する", () => {
    initUser(["p", PUBKEY]);
    setLatestNote(PUBKEY, mockEvent);
    expect(followerMap[PUBKEY].latestNote).toStrictEqual(mockEvent);
  });
});

describe("setMutualStatus", () => {
  it("エントリが存在しない場合はクラッシュしない", () => {
    expect(() => setMutualStatus(PUBKEY, "mutual")).not.toThrow();
  });

  it("mutualStatusをmutualに更新する", () => {
    initUser(["p", PUBKEY]);
    setMutualStatus(PUBKEY, "mutual");
    expect(followerMap[PUBKEY].mutualStatus).toBe("mutual");
  });

  it("mutualStatusをnotMutualに更新する", () => {
    initUser(["p", PUBKEY]);
    setMutualStatus(PUBKEY, "notMutual");
    expect(followerMap[PUBKEY].mutualStatus).toBe("notMutual");
  });

  it("mutualStatusをunknownに更新する", () => {
    initUser(["p", PUBKEY]);
    setMutualStatus(PUBKEY, "unknown");
    expect(followerMap[PUBKEY].mutualStatus).toBe("unknown");
  });
});

describe("setPetname", () => {
  it("エントリが存在しない場合はクラッシュしない", () => {
    expect(() => setPetname(PUBKEY, "alice")).not.toThrow();
  });

  it("petnameを更新する", () => {
    initUser(["p", PUBKEY]);
    setPetname(PUBKEY, "alice");
    expect(followerMap[PUBKEY].petname).toBe("alice");
  });
});

describe("setProfile", () => {
  it("エントリが存在しない場合はクラッシュしない", () => {
    expect(() => setProfile(PUBKEY, mockEvent)).not.toThrow();
  });

  it("getProfileがnullを返す場合はprofileを更新しない", () => {
    vi.mocked(getProfile).mockReturnValue(null);
    initUser(["p", PUBKEY]);
    setProfile(PUBKEY, mockEvent);
    expect(followerMap[PUBKEY].profile).toBeUndefined();
  });

  it("profileを更新する", () => {
    const mockProfile = { name: "Alice", about: "", picture: "" };
    vi.mocked(getProfile).mockReturnValue(mockProfile);
    initUser(["p", PUBKEY]);
    setProfile(PUBKEY, mockEvent);
    expect(followerMap[PUBKEY].profile).toEqual(mockProfile);
  });
});
