import { atom } from "jotai"
import { authStateAtom } from "../atoms/authAtom"

export const isLoggedInAtom = atom(
    (get) => get(authStateAtom).status === "AUTHENTICATED"
)
