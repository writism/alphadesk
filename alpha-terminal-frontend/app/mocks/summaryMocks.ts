export interface TagItem {
  label: string;
  category: string;
}

export interface StockSummary {
  symbol: string;
  name: string;
  summary: string;
  tags: TagItem[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment_score: number;
  confidence: number;
}

export const MOCK_SUMMARIES: StockSummary[] = [
  {
    symbol: '005930',
    name: '삼성전자',
    summary: '삼성전자가 AI 반도체 경쟁력 강화를 위해 설비 투자를 10조 원 확대하고 HBM4 양산 시점을 앞당긴다고 발표했다.',
    tags: [
      { label: '설비투자확대', category: 'CAPITAL' },
      { label: 'HBM4양산', category: 'PRODUCT' },
      { label: 'AI반도체경쟁', category: 'INDUSTRY' },
    ],
    sentiment: 'POSITIVE',
    sentiment_score: 0.75,
    confidence: 0.92,
  },
  {
    symbol: '000660',
    name: 'SK하이닉스',
    summary: 'SK하이닉스는 4분기 영업이익 8조 원을 기록했다고 공시했다. HBM 수요 증가가 실적 개선의 주요 원인으로 분석된다.',
    tags: [
      { label: '영업이익증가', category: 'EARNINGS' },
      { label: 'HBM수요', category: 'PRODUCT' },
    ],
    sentiment: 'POSITIVE',
    sentiment_score: 0.82,
    confidence: 0.95,
  },
  {
    symbol: '035420',
    name: 'NAVER',
    summary: 'NAVER가 일본 라인야후 지분 매각 협상을 진행 중이라고 밝혔다. 협상 결과에 따라 해외 사업 구조에 변화가 예상된다.',
    tags: [
      { label: '지분매각', category: 'CAPITAL' },
      { label: '라인야후', category: 'MANAGEMENT' },
      { label: '해외사업재편', category: 'INDUSTRY' },
    ],
    sentiment: 'NEUTRAL',
    sentiment_score: -0.05,
    confidence: 0.78,
  },
  {
    symbol: '051910',
    name: 'LG화학',
    summary: 'LG화학이 배터리 소재 사업 부문에서 수율 문제로 인해 1분기 영업이익이 전년 동기 대비 40% 감소했다고 공시했다.',
    tags: [
      { label: '실적하락', category: 'EARNINGS' },
      { label: '배터리소재', category: 'PRODUCT' },
      { label: '수율문제', category: 'RISK' },
    ],
    sentiment: 'NEGATIVE',
    sentiment_score: -0.68,
    confidence: 0.89,
  },
];
