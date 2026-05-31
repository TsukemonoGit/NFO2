// sortFollowers.test.ts
import { describe, it, expect } from "vitest";
import { SortOrder } from "$lib/types";
import type * as Nostr from "nostr-typedef";
import { sortFollowers } from "$lib/utils/sortFollowers";

const makeEvent = (created_at: number): Nostr.Event => ({
  id: "1",
  pubkey: "a".repeat(64),
  kind: 1,
  content: "",
  tags: [],
  created_at,
  sig: "",
});

const makeMap = (
  entries: [string, Partial<Omit<FollowerMap[string], "npub">>][],
): FollowerMap =>
  Object.fromEntries(
    entries.map(([pubkey, data]) => [
      pubkey,
      { npub: `npub_${pubkey}`, ...data, mutualStatus: "unknown" },
    ]),
  );

describe("sortFollowers", () => {
  it("空配列を返す", () => {
    expect(sortFollowers([], {}, SortOrder.follow)).toEqual([]);
  });

  it("元の配列を変更しない", () => {
    const pubkeys = ["a", "b", "c"];
    const map = makeMap([
      ["a", {}],
      ["b", {}],
      ["c", {}],
    ]);
    const original = [...pubkeys];
    sortFollowers(pubkeys, map, SortOrder.follow);
    expect(pubkeys).toEqual(original);
  });

  describe("SortOrder.follow", () => {
    it("挿入順を維持する", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", {}],
        ["b", {}],
        ["c", {}],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.follow)).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
  });

  describe("SortOrder.latestPost", () => {
    it("created_atの昇順でソートする", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", { latestNote: makeEvent(300) }],
        ["b", { latestNote: makeEvent(100) }],
        ["c", { latestNote: makeEvent(200) }],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.latestPost)).toEqual([
        "b",
        "c",
        "a",
      ]);
    });

    it("latestNoteがundefinedの場合は末尾になる", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", { latestNote: makeEvent(100) }],
        ["b", {}],
        ["c", { latestNote: makeEvent(200) }],
      ]);
      const result = sortFollowers(pubkeys, map, SortOrder.latestPost);
      expect(result[2]).toBe("b");
    });

    it("latestNoteがundefined同士の相対順序は不定だが全件含まれる", () => {
      const pubkeys = ["a", "b"];
      const map = makeMap([
        ["a", {}],
        ["b", {}],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.latestPost)).toHaveLength(2);
    });
  });

  describe("SortOrder.mutual", () => {
    it("mutual → notMutual → unknown の順にソートする", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", { mutualStatus: "unknown" }],
        ["b", { mutualStatus: "mutual" }],
        ["c", { mutualStatus: "notMutual" }],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.mutual)).toEqual([
        "b",
        "c",
        "a",
      ]);
    });

    it("mutualStatusがundefinedの場合はunknown扱いで末尾になる", () => {
      const pubkeys = ["a", "b"];
      const map = makeMap([
        ["a", {}],
        ["b", { mutualStatus: "mutual" }],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.mutual)).toEqual(["b", "a"]);
    });

    it("同じステータス同士は相対順序を保つ", () => {
      const pubkeys = ["a", "b"];
      const map = makeMap([
        ["a", { mutualStatus: "mutual" }],
        ["b", { mutualStatus: "mutual" }],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.mutual)).toEqual(["a", "b"]);
    });
  });

  describe("SortOrder.petname", () => {
    it("petnameのlocaleCompare順でソートする", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", { petname: "charlie" }],
        ["b", { petname: "alice" }],
        ["c", { petname: "bob" }],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.petname)).toEqual([
        "b",
        "c",
        "a",
      ]);
    });

    it("petnameがundefinedの場合は末尾になる", () => {
      const pubkeys = ["a", "b", "c"];
      const map = makeMap([
        ["a", { petname: "alice" }],
        ["b", {}],
        ["c", { petname: "charlie" }],
      ]);
      const result = sortFollowers(pubkeys, map, SortOrder.petname);
      expect(result[2]).toBe("b");
    });

    it("petnameがundefined同士の相対順序は不定だが全件含まれる", () => {
      const pubkeys = ["a", "b"];
      const map = makeMap([
        ["a", {}],
        ["b", {}],
      ]);
      expect(sortFollowers(pubkeys, map, SortOrder.petname)).toHaveLength(2);
    });
  });
});
