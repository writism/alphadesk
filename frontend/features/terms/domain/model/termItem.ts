import type { TermSection } from "./termSection"

export interface TermItem {
    id: string
    title: string
    required: boolean
    sections: TermSection[]
}
