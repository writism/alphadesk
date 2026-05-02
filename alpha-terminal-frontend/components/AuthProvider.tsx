"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/application/hooks/useAuth";

/**
 * 앱 초기화 시 /authentication/me를 호출해 쿠키 기반 세션을 복원한다.
 * 페이지 새로고침해도 로그인 상태가 유지된다.
 * 세션 bootstrap은 AuthProvider만 수행해 중복 /me 요청을 방지한다.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuth();
  const didBootstrap = useRef(false);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;
    void loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
