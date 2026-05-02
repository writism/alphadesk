import { httpClient } from "@/infrastructure/http/httpClient"
import type { BoardListItem, BoardListResponse } from "../../domain/model/boardPost"

export async function fetchBoardList(page = 1, size = 10): Promise<BoardListResponse> {
    const res = await httpClient.get(`/board/list?page=${page}&size=${size}`)
    return res.json()
}

export async function fetchBoardPost(boardId: number): Promise<BoardListItem> {
    const res = await httpClient.get(`/board/${boardId}`)
    return res.json()
}

export async function fetchBoardRead(boardId: number): Promise<BoardListItem> {
    const res = await httpClient.get(`/board/read/${boardId}`)
    return res.json()
}

export async function createBoardPost(
    title: string,
    content: string,
    sharedCardId?: number | null
): Promise<BoardListItem> {
    const body: { title: string; content: string; shared_card_id?: number } = { title, content }
    if (sharedCardId != null) body.shared_card_id = sharedCardId
    const res = await httpClient.post("/board", body)
    return res.json()
}

export async function updateBoardPost(boardId: number, title: string, content: string): Promise<BoardListItem> {
    const res = await httpClient.put(`/board/${boardId}`, { title, content })
    return res.json()
}

export async function deleteBoardPost(boardId: number): Promise<void> {
    await httpClient.delete(`/board/delete/${boardId}`)
}
