import { httpClient } from "@/infrastructure/http/httpClient";

export interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
}

export const stockApi = {
  search: async (q: string): Promise<StockSearchResult[]> => {
    if (!q.trim()) return [];
    const res = await httpClient.get(`/stocks/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return res.json();
  },
};
