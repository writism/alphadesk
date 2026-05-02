import { httpClient } from "@/infrastructure/http/httpClient";
import { TagItem } from "@/app/mocks/summaryMocks";

export interface StockSummaryItem {
  symbol: string;
  name: string;
  summary: string;
  tags: TagItem[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment_score: number;
  confidence: number;
  source_type: 'NEWS' | 'DISCLOSURE' | 'REPORT';
  url?: string;
}

export const summaryApi = {
  getSummaries: async (): Promise<StockSummaryItem[]> => {
    const res = await httpClient.get("/pipeline/summaries");
    if (!res.ok) throw new Error("요약 데이터 조회에 실패했습니다.");
    return res.json();
  },

  getReportSummaries: async (): Promise<StockSummaryItem[]> => {
    const res = await httpClient.get("/pipeline/report-summaries");
    if (!res.ok) throw new Error("공시·리포트 데이터 조회에 실패했습니다.");
    return res.json();
  },

  runPipeline: async (): Promise<void> => {
    const res = await httpClient.post("/pipeline/run", undefined);
    if (!res.ok) throw new Error("파이프라인 실행에 실패했습니다.");
  },

  getProgress: async (): Promise<{ messages: string[]; done: boolean }> => {
    const res = await httpClient.get("/pipeline/progress");
    if (!res.ok) return { messages: [], done: false };
    return res.json();
  },
};
