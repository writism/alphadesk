import { atom } from "jotai"
import type { AuthState } from "../../domain/state/authState"

export const authStateAtom = atom<AuthState>({ status: "LOADING" })
