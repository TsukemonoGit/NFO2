<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();

  // ダークモードの初期状態を判定
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

  // 初期表示でclassを設定
  $effect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("darkMode", String(isDark));
    }
  });

  function toggleDark() {
    isDark = !isDark;
  }
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

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
