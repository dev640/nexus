import { useQuery } from "@tanstack/react-query";
import { proxyGet } from "../lib/proxy";

/** Fallback demo feed used when neither proxy nor direct fetch is available. */
function simulatedReddit(subreddit: string) {
  return {
    data: {
      children: [
        {
          data: {
            title: "Free APIs are the best way to learn integration patterns",
            author: "u_teaching_dev",
            subreddit,
            score: 342,
            url: "#",
            created_utc: Date.now() / 1000 - 3600,
          },
        },
        {
          data: {
            title: "Integration testing with mock APIs speeds up development 3x",
            author: "u_dev_thoughts",
            subreddit,
            score: 189,
            url: "#",
            created_utc: Date.now() / 1000 - 7200,
          },
        },
      ],
      after: null,
    },
  };
}

export const fetcher = {
  async getZenQuote() {
    const res = await proxyGet(
      "quotes",
      ["random"],
      {},
      async () => {
        const r = await fetch("https://zenquotes.io/api/random");
        const data = await r.json().catch(() => []);
        if (!r.ok) throw new Error("Quote fetch failed");
        return data;
      }
    );
    const list = res.data as Array<{ q: string; a: string; h?: string }> | null;
    return (
      list?.[0] ?? {
        q: "The only way to do great work is to love what you do. — Steve Jobs",
        a: "Steve Jobs",
        h: "inspirational",
      }
    );
  },

  async getWeather(city = "London") {
    const res = await proxyGet(
      "weather",
      [city],
      { format: "j1" },
      async () => {
        const r = await fetch(`https://wttr.in/${city}?format=j1`);
        return r.json();
      }
    );
    return res.data ?? {};
  },

  async getBoredActivity(participants?: number, price?: number) {
    const query: Record<string, string> = {};
    if (participants) query.participants = String(participants);
    if (price !== undefined) query.price = String(price);
    const res = await proxyGet(
      "bored",
      ["activity"],
      query,
      async () => {
        const url = new URL("https://www.boredapi.com/api/activity");
        for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
        const r = await fetch(url.toString());
        return r.json();
      }
    );
    return res.data ?? {};
  },

  async getExchangeRates(base = "USD") {
    const res = await proxyGet(
      "exchange",
      ["latest", base],
      {},
      async () => {
        const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
        return r.json();
      }
    );
    return res.data ?? {};
  },

  async getRedditFeed(subreddit = "productivity") {
    const res = await proxyGet(
      "reddit",
      [subreddit, "hot.json"],
      { limit: "10" },
      async () => {
        const r = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
        if (!r.ok) throw new Error("Reddit unavailable");
        return r.json();
      }
    );
    return res.data ?? simulatedReddit(subreddit);
  },
};

export function useZenQuote() {
  return useQuery({
    queryKey: ["zen-quote"],
    queryFn: fetcher.getZenQuote,
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 30,
  });
}

export function useWeather(city = "London") {
  return useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetcher.getWeather(city),
    staleTime: 1000 * 60 * 10,
  });
}

export function useBoredActivity(participants?: number, price?: number) {
  return useQuery({
    queryKey: ["bored", participants, price],
    queryFn: () => fetcher.getBoredActivity(participants, price),
    staleTime: 1000 * 60 * 5,
  });
}

export function useExchangeRates(base = "USD") {
  return useQuery({
    queryKey: ["exchange", base],
    queryFn: () => fetcher.getExchangeRates(base),
    staleTime: 1000 * 60 * 15,
  });
}

export function useRedditFeed(subreddit = "productivity") {
  return useQuery({
    queryKey: ["reddit", subreddit],
    queryFn: () => fetcher.getRedditFeed(subreddit),
    staleTime: 1000 * 60 * 2,
  });
}
