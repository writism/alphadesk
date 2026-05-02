'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/** BL-FE-35: 목록이 길 때 페이지당 건수 */
export const CLIENT_LIST_PAGE_SIZE = 10

/** BL-FE-36: 대시보드 관심종목 그리드(4열×3행) */
export const DASHBOARD_WATCHLIST_GRID_PAGE_SIZE = 12

/**
 * 전체 배열은 그대로 두고, 현재 페이지 구간만 잘라 쓴다.
 * 히트맵 등 상위에서 전체 심볼로 한 번만 fetch할 때 사용한다.
 */
export function useClientPagination<T>(items: readonly T[], pageSize: number = CLIENT_LIST_PAGE_SIZE) {
    const totalItems = items.length
    const totalPages = useMemo(
        () => (totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize)),
        [totalItems, pageSize],
    )

    const [page, setPageState] = useState(1)

    useEffect(() => {
        setPageState((p) => Math.min(Math.max(1, p), totalPages))
    }, [totalPages])

    const effectivePage = Math.min(Math.max(1, page), totalPages)
    const start = (effectivePage - 1) * pageSize

    const pageItems = useMemo(
        () => items.slice(start, start + pageSize),
        [items, start, pageSize],
    )

    const setPage = useCallback(
        (p: number) => {
            setPageState(Math.min(Math.max(1, Math.floor(p)), totalPages))
        },
        [totalPages],
    )

    const rangeStart = totalItems === 0 ? 0 : start + 1
    const rangeEnd = Math.min(start + pageSize, totalItems)

    return {
        page: effectivePage,
        totalPages,
        pageItems,
        setPage,
        rangeStart,
        rangeEnd,
        totalItems,
        showPagination: totalItems > pageSize,
    }
}
