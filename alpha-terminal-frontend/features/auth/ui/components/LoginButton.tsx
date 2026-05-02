import { authCommand } from "@/features/auth/application/commands/authCommand"
import { kakaoButtonStyles } from "./loginButton.styles"

export const KakaoLoginButton = () => (
    <div className={kakaoButtonStyles.wrapper}>
        <button
            onClick={authCommand.LOGIN_KAKAO}
            className={kakaoButtonStyles.button}
        >
            Kakao로 로그인
        </button>
    </div>
)
