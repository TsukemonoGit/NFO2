import { beforeEach, describe, expect, it, vi } from "vitest";
import { latestKind3 } from "$lib/store/store.svelte";
import { queryKeys } from "$lib/store/constants";
import { sortFollowList } from "$lib/utils/sortFollowers";
import { SortOrder } from "$lib/types";

function createKind3Event(
  follows: Array<{
    pubkey: string;
    petname?: string;
  }>,
) {
  return {
    kind: 3,
    pubkey: "me",
    created_at: 1000,
    content: "",
    tags: follows.map((v) =>
      v.petname ? ["p", v.pubkey, "", v.petname] : ["p", v.pubkey],
    ),
    id: "kind3-id",
    sig: "kind3-sig",
  };
}

function getFollowList(kind3: { tags: string[][] }): string[] {
  return kind3.tags.filter((tag) => tag[0] === "p").map((tag) => tag[1]);
}

describe("sortFollowList", () => {
  let queryClient: {
    getQueryData: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    queryClient = {
      getQueryData: vi.fn(),
    };

    latestKind3.value = null;
  });

  it("follow: kind3の順序を維持する", () => {
    const kind3 = createKind3Event([
      { pubkey: "charlie" },
      { pubkey: "alice" },
      { pubkey: "bob" },
    ]);

    latestKind3.value = kind3 as any;

    const followList = getFollowList(kind3);

    const result = sortFollowList(
      followList,
      SortOrder.follow,
      queryClient as any,
    );

    expect(result).toEqual(["charlie", "alice", "bob"]);
  });

  it("latestPost: created_at降順", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice" },
      { pubkey: "bob" },
      { pubkey: "charlie" },
    ]);

    latestKind3.value = kind3 as any;

    queryClient.getQueryData.mockImplementation((key) => {
      if (key[0] === queryKeys.latestNote) {
        switch (key[1]) {
          case "alice":
            return { created_at: 100 };
          case "bob":
            return { created_at: 300 };
          case "charlie":
            return { created_at: 200 };
        }
      }

      return undefined;
    });

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.latestPost,
      queryClient as any,
    );

    expect(result).toEqual(["bob", "charlie", "alice"]);
  });

  it("latestPost: 投稿なしは末尾", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice" },
      { pubkey: "bob" },
      { pubkey: "charlie" },
    ]);

    latestKind3.value = kind3 as any;

    queryClient.getQueryData.mockImplementation((key) => {
      if (key[0] === queryKeys.latestNote) {
        switch (key[1]) {
          case "alice":
            return { created_at: 100 };
          case "bob":
            return undefined;
          case "charlie":
            return { created_at: 200 };
        }
      }

      return undefined;
    });

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.latestPost,
      queryClient as any,
    );

    expect(result).toEqual(["charlie", "alice", "bob"]);
  });

  it("mutual: mutualを先頭にする", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice" },
      { pubkey: "bob" },
      { pubkey: "charlie" },
    ]);

    latestKind3.value = kind3 as any;

    queryClient.getQueryData.mockImplementation((key) => {
      if (key[0] === queryKeys.userStatus) {
        switch (key[1]) {
          case "alice":
            return { mutual: "notMutual" };
          case "bob":
            return { mutual: "mutual" };
          case "charlie":
            return { mutual: "mutual" };
        }
      }

      return undefined;
    });

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.mutual,
      queryClient as any,
    );

    expect(result).toEqual(["bob", "charlie", "alice"]);
  });

  it("mutual: 同順位はfollow順維持", () => {
    const kind3 = createKind3Event([
      { pubkey: "charlie" },
      { pubkey: "alice" },
      { pubkey: "bob" },
    ]);

    latestKind3.value = kind3 as any;

    queryClient.getQueryData.mockImplementation((key) => {
      if (key[0] === queryKeys.userStatus) {
        return { mutual: "mutual" };
      }

      return undefined;
    });

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.mutual,
      queryClient as any,
    );

    expect(result).toEqual(["charlie", "alice", "bob"]);
  });

  it("petname: 昇順ソート", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice", petname: "C" },
      { pubkey: "bob", petname: "A" },
      { pubkey: "charlie", petname: "B" },
    ]);

    latestKind3.value = kind3 as any;

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.petname,
      queryClient as any,
    );

    expect(result).toEqual(["bob", "charlie", "alice"]);
  });

  it("petname: 未設定は末尾", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice", petname: "Charlie" },
      { pubkey: "bob" },
      { pubkey: "charlie", petname: "Alice" },
    ]);

    latestKind3.value = kind3 as any;

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.petname,
      queryClient as any,
    );

    expect(result).toEqual(["charlie", "alice", "bob"]);
  });

  it("petname: 同名はfollow順維持", () => {
    const kind3 = createKind3Event([
      { pubkey: "charlie", petname: "same" },
      { pubkey: "alice", petname: "same" },
      { pubkey: "bob", petname: "same" },
    ]);

    latestKind3.value = kind3 as any;

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.petname,
      queryClient as any,
    );

    expect(result).toEqual(["charlie", "alice", "bob"]);
  });

  it("petname: 日本語順", () => {
    const kind3 = createKind3Event([
      { pubkey: "alice", petname: "さとう" },
      { pubkey: "bob", petname: "あおき" },
      { pubkey: "charlie", petname: "なかむら" },
    ]);

    latestKind3.value = kind3 as any;

    const result = sortFollowList(
      getFollowList(kind3),
      SortOrder.petname,
      queryClient as any,
    );

    expect(result).toEqual(["bob", "alice", "charlie"]);
  });

  it("空配列", () => {
    const result = sortFollowList([], SortOrder.follow, queryClient as any);

    expect(result).toEqual([]);
  });
});
