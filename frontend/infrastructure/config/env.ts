const requireEnv = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`[env] 필수 환경 변수가 누락되었습니다: ${key}`);
  }
  return value;
};

export const env = {
  apiBaseUrl: requireEnv("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
  kakaoLoginPath: requireEnv("NEXT_PUBLIC_KAKAO_LOGIN_PATH", process.env.NEXT_PUBLIC_KAKAO_LOGIN_PATH),
  shareBaseUrl: process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? "",
  kakaoJsKey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "",
} as const;
