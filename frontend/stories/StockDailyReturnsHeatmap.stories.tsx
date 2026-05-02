import type { Meta, StoryObj } from '@storybook/react'
import { DailyReturnsHeatmapLegend } from '@/app/components/DailyReturnsHeatmapLegend'
import { StockDailyReturnsHeatmap } from '@/app/components/StockDailyReturnsHeatmap'
import type { HeatmapItem } from '@/features/stock/domain/model/dailyReturnsHeatmap'

const kospiItem: HeatmapItem = {
    symbol: '005930',
    market: 'KOSPI',
    summary: { up: 12, down: 8, flat: 2 },
    series: [
        ['2025-03-03', 1],
        ['2025-03-04', -1],
        ['2025-03-05', 2],
        ['2025-03-06', 0],
        ['2025-03-07', -2],
        ['2025-03-10', 1],
        ['2025-03-11', -1],
        ['2025-03-12', 0],
        ['2025-03-13', 2],
        ['2025-03-14', 1],
        ['2025-03-17', -1],
        ['2025-03-18', 1],
        ['2025-03-19', 0],
        ['2025-03-20', -2],
        ['2025-03-21', 1],
    ],
}

const nasdaqItem: HeatmapItem = {
    symbol: 'AAPL',
    market: 'NASDAQ',
    summary: { up: 9, down: 10, flat: 3 },
    series: [
        ['2025-03-03', -1],
        ['2025-03-04', 1],
        ['2025-03-05', 0],
        ['2025-03-06', 2],
        ['2025-03-07', -2],
        ['2025-03-10', 1],
        ['2025-03-11', 1],
        ['2025-03-12', -1],
        ['2025-03-13', 0],
        ['2025-03-14', 2],
        ['2025-03-17', -1],
        ['2025-03-18', 0],
        ['2025-03-19', 1],
        ['2025-03-20', -2],
        ['2025-03-21', 1],
    ],
}

const meta: Meta<typeof StockDailyReturnsHeatmap> = {
    title: 'Stock/StockDailyReturnsHeatmap',
    component: StockDailyReturnsHeatmap,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="max-w-md rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <DailyReturnsHeatmapLegend className="mb-3" />
                <Story />
            </div>
        ),
    ],
    args: {
        weeks: 6,
        showLegend: false,
    },
}

export default meta

type Story = StoryObj<typeof StockDailyReturnsHeatmap>

export const KospiWithKrFootnote: Story = {
    name: 'KOSPI (한국장 각주)',
    args: { item: kospiItem, weeks: 6 },
}

export const NasdaqNoKrFootnote: Story = {
    name: 'NASDAQ (각주 없음)',
    args: { item: nasdaqItem, weeks: 6 },
}
