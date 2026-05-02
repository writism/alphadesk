import { redirectOAuthLogin } from "../../infrastructure/api/authApi"

export type AuthCommand = () => void

export const authCommand: Record<string, AuthCommand> = {
    LOGIN_KAKAO: () => redirectOAuthLogin(),
    LOGOUT: () => console.warn("Use logout from useAuth hook"),
}
