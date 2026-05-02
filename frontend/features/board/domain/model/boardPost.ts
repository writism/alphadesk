export interface BoardPost {
    id: number
    title: string
    content: string
    author: string
    created_at: string
}

export interface BoardListItem {
    board_id: number
    title: string
    content: string
    nickname: string
    created_at: string
    updated_at: string
    shared_card_id?: number | null
}

export interface BoardListResponse {
    items: BoardListItem[]
    page: number
    total_pages: number
    total_count: number
}
