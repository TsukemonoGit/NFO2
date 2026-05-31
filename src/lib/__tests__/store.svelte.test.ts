// store.svelte.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

// nostr-typedef のモック
vi.mock("nostr-typedef", () => ({
  default: {},
}));

import { loginUser, latestKind3 } from "$lib/store/store.svelte";

beforeEach(() => {
  loginUser.value = "";
  latestKind3.value = null;
});

describe("loginUser", () => {
  it("初期値は空文字列", () => {
    expect(loginUser.value).toBe("");
  });

  it("値を設定できる", () => {
    loginUser.value = "abc123";
    expect(loginUser.value).toBe("abc123");
  });

  it("値を更新できる", () => {
    loginUser.value = "abc123";
    loginUser.value = "def456";
    expect(loginUser.value).toBe("def456");
  });

  it("空文字列に戻せる", () => {
    loginUser.value = "abc123";
    loginUser.value = "";
    expect(loginUser.value).toBe("");
  });
});

describe("latestKind3", () => {
  it("初期値はnull", () => {
    expect(latestKind3.value).toBeNull();
  });

  it("値を設定できる", () => {
    const mockEvent = {
      id: "test-id",
      pubkey: "test-pubkey",
      kind: 3,
      content: "",
      tags: [],
      created_at: 1234567890,
      sig: "test-sig",
    };
    latestKind3.value = mockEvent as any;
    expect(latestKind3.value).toEqual(mockEvent);
  });

  it("nullに戻せる", () => {
    const mockEvent = {
      id: "test-id",
      pubkey: "test-pubkey",
      kind: 3,
      content: "",
      tags: [],
      created_at: 1234567890,
      sig: "test-sig",
    };
    latestKind3.value = mockEvent as any;
    latestKind3.value = null;
    expect(latestKind3.value).toBeNull();
  });

  it("kindが3のイベントでもnullでなくても設定できる", () => {
    const mockEvent = {
      id: "test-id",
      pubkey: "test-pubkey",
      kind: 1,
      content: "hello",
      tags: [],
      created_at: 1234567890,
      sig: "test-sig",
    };
    latestKind3.value = mockEvent as any;
    expect(latestKind3.value).toEqual(mockEvent);
  });
});
