"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function KakaoRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const continueUrl = searchParams.get("continue");
    if (continueUrl) {
      // Open Redirect 방지: 같은 오리진의 상대 경로만 허용
      try {
        const parsed = new URL(continueUrl, window.location.origin);
        if (parsed.origin === window.location.origin) {
          window.location.href = parsed.pathname + parsed.search + parsed.hash;
        }
      } catch {
        // 유효하지 않은 URL — 무시
      }
    }
  }, [searchParams]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>카카오 로그인으로 이동 중...</p>
    </div>
  );
}

export default function KakaoCreateAccountPage() {
  return (
    <Suspense>
      <KakaoRedirect />
    </Suspense>
  );
}
