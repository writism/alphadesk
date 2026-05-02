import { httpClient } from "@/infrastructure/http/httpClient";

export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
}

export const watchlistApi = {
  getList: async (): Promise<WatchlistItem[]> => {
    const res = await httpClient.get("/watchlist");
    if (!res.ok) throw new Error("관심종목 조회에 실패했습니다.");
    return res.json();
  },

  add: async (symbol: string, name: string): Promise<WatchlistItem> => {
    const res = await httpClient.post("/watchlist", { symbol, name });
    if (!res.ok) throw new Error("관심종목 등록에 실패했습니다.");
    return res.json();
  },

  remove: async (id: number): Promise<void> => {
    const res = await httpClient.delete(`/watchlist/${id}`);
    if (!res.ok) throw new Error("관심종목 삭제에 실패했습니다.");
  },
};
