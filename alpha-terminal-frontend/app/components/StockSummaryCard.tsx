'use client'

import Link from 'next/link'
import { isSafeUrl } from '@/infrastructure/utils/urlValidator'
import type { HeatmapItem } from '@/features/stock/domain/model/dailyReturnsHeatmap'
import { ShareActionBar } from '@/features/share/ui/components/ShareActionBar'
import type { ShareCardPayload } from '@/features/share/domain/model/sharedCard'
import { StockDailyReturnsHeatmap } from './StockDailyReturnsHeatmap'

type Tag = string | { label: string; category?: string }

interface StockSummaryCardProps {
  symbol: string
  name: string
  summary: string
  tags: Tag[]
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  sentiment_score?: number
  confidence?: number
  source_type?: 'NEWS' | 'DISCLOSURE' | 'REPORT'
  url?: string
  heatmap?: { item: HeatmapItem; weeks: number; asOf?: string | null }
  analyzed_at?: string
  article_published_at?: string
  source_name?: string
  isLoggedIn?: boolean
  /** 이미 공유된 카드 ID (게시판 연동 읽기 등) */
  sharedCardId?: number
  sharedCardLikeCount?: number
  sharedCardCommentCount?: number
  initialUserHasLiked?: boolean
  /** false면 SNS 공유 버튼 숨김 */
  snsShareEnabled?: boolean
  /** 대시보드 등에서 게시판 등록 버튼 */
  showBoardPublishButton?: boolean
  onCardClick?: () => void
  personalized?: boolean
}

const SOURCE_LABEL: Record<string, string> = {
  NEWS: '뉴스',
  DISCLOSURE: '공시',
  REPORT: '재무',
}

const SOURCE_NAME_LABEL: Record<string, string> = {
  NAVER_NEWS: '네이버뉴스',
  GOOGLE_NEWS: '구글뉴스',
  FINNHUB: 'Finnhub',
  DART: 'DART',
  DART_FINANCIAL: 'DART 재무',
}

const SENTIMENT_STYLE: Record<string, string> = {
  POSITIVE: 'border-tertiary text-tertiary',
  NEGATIVE: 'border-error text-error',
  NEUTRAL:  'border-on-surface-variant text-on-surface-variant',
}

const SENTIMENT_LABEL: Record<string, string> = {
  POSITIVE: '긍정',
  NEGATIVE: '부정',
  NEUTRAL:  '중립',
}

function tagLabel(tag: Tag): string {
  if (typeof tag === 'string') return tag
  return tag.label
}

export default function StockSummaryCard({
  symbol, name, summary, tags,
  sentiment, sentiment_score, confidence,
  source_type = 'NEWS',
  url,
  heatmap,
  analyzed_at,
  article_published_at,
  source_name,
  isLoggedIn = false,
  sharedCardId,
  sharedCardLikeCount = 0,
  sharedCardCommentCount = 0,
  initialUserHasLiked = false,
  snsShareEnabled = true,
  showBoardPublishButton = false,
  onCardClick,
  personalized = false,
}: StockSummaryCardProps) {
  const sentimentStyle = sentiment ? SENTIMENT_STYLE[sentiment] : SENTIMENT_STYLE.NEUTRAL
  const sentimentLabel = sentiment ? SENTIMENT_LABEL[sentiment] : '중립'
  const scoreStr = sentiment_score !== undefined
    ? `${sentiment_score > 0 ? '+' : ''}${sentiment_score.toFixed(2)}`
    : ''

  const cardContent = (
    <div className="flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {url ? (
            <span className="font-mono text-sm font-bold text-outline">{symbol}</span>
          ) : (
            <Link
              href={`/stock/${symbol}`}
              className="font-mono text-sm font-bold text-outline hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {symbol}
            </Link>
          )}
          <span className="font-mono text-base font-bold text-on-surface">{name}</span>
          {source_type && SOURCE_LABEL[source_type] && (
            <span className="border border-outline font-mono text-xs px-1.5 py-0.5 text-on-surface-variant uppercase">
              {SOURCE_LABEL[source_type]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {personalized && (
            <span className="font-mono text-[10px] font-bold text-primary border border-primary px-1.5 py-0.5 uppercase tracking-widest">
              맞춤_분석
            </span>
          )}
          {sentiment && (
            <span className={`border font-mono text-xs px-2 py-0.5 font-bold ${sentimentStyle}`}>
              {sentimentLabel} {scoreStr}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="font-mono text-sm text-on-surface leading-relaxed">{summary}</p>

      {/* Source + date — news card 형식 */}
      {article_published_at && (
        <div className="flex gap-3 font-mono text-xs text-outline">
          <span>
            {source_name
              ? (SOURCE_NAME_LABEL[source_name] ?? source_name)
              : (source_type ? SOURCE_LABEL[source_type] : '뉴스')}
          </span>
          <span>
            {new Date(article_published_at).toLocaleDateString("ko-KR", {
              year: "numeric", month: "2-digit", day: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Heatmap */}
      {heatmap && (
        <StockDailyReturnsHeatmap
          item={heatmap.item}
          weeks={heatmap.weeks}
          asOf={heatmap.asOf ?? null}
          showLegend={false}
          sentimentScore={sentiment_score}
        />
      )}

      {/* Tags + Confidence */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag, i) => (
          <span
            key={`${tagLabel(tag)}-${i}`}
            className="border border-outline font-mono text-xs px-2 py-0.5 text-on-surface-variant"
          >
            #{tagLabel(tag)}
          </span>
        ))}
        {confidence !== undefined && (
          <span className="font-mono text-xs text-outline ml-auto">
            신뢰도 {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {/* Confidence bar */}
      {confidence !== undefined && (
        <div className="h-1 bg-surface-container-highest">
          <div className="h-full bg-primary" style={{ width: `${confidence * 100}%` }} />
        </div>
      )}

      {url && (
        <span className="font-mono text-xs text-primary">원문 보기 →</span>
      )}
    </div>
  )

  return (
    <div className={`border border-outline bg-surface-container-low flex flex-col${isSafeUrl(url) ? ' hover:border-primary' : ''}`}>
      {isSafeUrl(url) ? (
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={onCardClick} className="flex-1">
          {cardContent}
        </a>
      ) : (
        <div className="flex-1">{cardContent}</div>
      )}

      {analyzed_at && (
        <div className="px-5 pb-4 pt-0">
          <ShareActionBar
            cardId={sharedCardId}
            sharePayload={{
              symbol, name, summary,
              tags: tags.map(tagLabel),
              sentiment: sentiment ?? 'NEUTRAL',
              sentiment_score: sentiment_score ?? 0,
              confidence: confidence ?? 0,
              source_type,
              url,
              analyzed_at,
            } satisfies ShareCardPayload}
            initialLikeCount={sharedCardLikeCount}
            initialCommentCount={sharedCardCommentCount}
            initialUserHasLiked={initialUserHasLiked}
            isLoggedIn={isLoggedIn}
            snsShareEnabled={snsShareEnabled}
            showBoardPublish={showBoardPublishButton && isLoggedIn}
          />
        </div>
      )}
    </div>
  )
}
