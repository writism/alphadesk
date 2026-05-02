import { TERMS_DATA } from "../../domain/data/termsData"
import type { TermItem } from "../../domain/model/termItem"

export const useTerms = (): { terms: TermItem[] } => {
    return { terms: TERMS_DATA }
}
