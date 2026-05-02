'use client'

type Props = {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    rangeStart: number
    rangeEnd: number
    totalItems: number
    className?: string
}

/** BL-FE-35: 이전/다음 + 구간 표시 */
export function ClientPaginationBar({
    page,
    totalPages,
    onPageChange,
    rangeStart,
    rangeEnd,
    totalItems,
    className = '',
}: Props) {
    if (totalItems <= 0 || totalPages <= 1) return null

    const btn =
        'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'

    return (
        <nav
            className={`flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3 dark:border-gray-700 ${className}`}
            aria-label="목록 페이지"
        >
            <p className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                <span className="sr-only">현재 표시 구간: </span>
                {rangeStart}–{rangeEnd} / 총 {totalItems}건
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={btn}
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="이전 페이지"
                >
                    이전
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums" aria-current="page">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    className={btn}
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="다음 페이지"
                >
                    다음
                </button>
            </div>
        </nav>
    )
}
