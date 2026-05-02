import { atom } from "jotai"

export type YoutubeSortOrder = "desc" | "asc"

export const youtubeSelectedNameAtom = atom<string | undefined>(undefined)
export const youtubeSortOrderAtom = atom<YoutubeSortOrder>("desc")
