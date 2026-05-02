import { atom } from "jotai"
import type { InvestmentDecisionResult } from "@/features/invest/domain/model/investJudgment"

export const investQueryAtom = atom<string>("")
export const investIsLoadingAtom = atom<boolean>(false)
export const investResultAtom = atom<InvestmentDecisionResult | null>(null)
export const investErrorAtom = atom<string | null>(null)
export const investLogsAtom = atom<string[]>([])
