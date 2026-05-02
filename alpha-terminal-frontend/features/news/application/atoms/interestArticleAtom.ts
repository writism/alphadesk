import { atom } from "jotai"
import type { SaveInterestArticleResponse } from "@/features/news/domain/model/newsArticle"

/** 저장 완료된 관심 기사 원문 데이터 전역 상태. UI에서 조회 가능. */
export const interestArticleAtom = atom<SaveInterestArticleResponse | null>(null)
