<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { onMount, untrack } from "svelte";
  import { waitNostr } from "nip07-awaiter";
  import { latestKind3, loginUser, queryClient } from "$lib/store/store.svelte";
  import {
    fetchFollowListEvents,
    set10002Relays,
    setEmit,
  } from "$lib/nostr/rx-nostr";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { browser } from "$app/environment";
  import { getFollowList } from "$lib/utils/utils";

  let { children } = $props();
  const _queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  });
  queryClient.value = _queryClient;
  function getInitialDark(): boolean {
    if (
      typeof localStorage !== "undefined" &&
      localStorage.getItem("darkMode")
    ) {
      return localStorage.getItem("darkMode") === "true";
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    return false;
  }

  let isDark = $state(getInitialDark());

  const handleNlAuth = async (e: Event) => {
    const customEvent = e as CustomEvent;
    const type = customEvent.detail.type;

    if (type === "login" || type === "signup") {
      const pubkey = await window.nostr?.getPublicKey();
      if (pubkey && loginUser.value !== pubkey) {
        loginUser.value = pubkey;
      }
    } else if (type === "logout") {
      loginUser.value = "";
    }
  };

  // loginUser が変わるたびに followerMap・latestKind3 をリセットして再取得
  $effect(() => {
    const pubkey = loginUser.value;
    if (!pubkey) return;
    untrack(async () => {
      await set10002Relays(pubkey);
      latestKind3.value = null;
      setEmit([{ authors: [pubkey], kinds: [3], limit: 1 }]);
    });
  });

  $effect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("darkMode", String(isDark));
    }
  });

  onMount(async () => {
    const nostrLogin = await import("@konemono/nostr-login");
    document.addEventListener("nlAuth", handleNlAuth);
    await waitNostr(1000);
    try {
      await nostrLogin.init({});
    } catch (error) {
      console.log("Nostr Login initialization error:", error);
    }
  });

  function toggleDark() {
    isDark = !isDark;
  }

  $inspect(loginUser.value);
  $effect(() => {
    if (latestKind3.value && _queryClient) {
      untrack(() => {
        fetchFollowListEvents(_queryClient, getFollowList(latestKind3.value!), {
          kind3: true,
        });
      });
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={_queryClient}>
  <div class="flex items-center gap-2 p-4">
    <span class="text-sm on-surface">Theme</span>
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-variant on-surface text-sm hover:opacity-80 cursor-pointer"
      onclick={toggleDark}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  </div>

  {@render children()}
</QueryClientProvider>
