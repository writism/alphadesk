"use client";

interface KakaoLoginButtonProps {
  href: string;
}

export default function KakaoLoginButton({ href }: KakaoLoginButtonProps) {
  return (
    <a
      href={href}
      className="
        w-full flex items-center justify-center gap-2
        py-3 px-4 rounded-lg
        font-medium text-sm text-[#191919]
        bg-[#FEE500]
        hover:bg-[#F0D800]
        active:bg-[#E6CE00]
        transition-colors duration-150
      "
    >
      {/* 카카오 말풍선 아이콘 (SVG) */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 1C4.582 1 1 3.79 1 7.22c0 2.18 1.388 4.1 3.488 5.246l-.888 3.31a.25.25 0 0 0 .377.277L7.9 13.8c.36.05.727.076 1.1.076 4.418 0 8-2.79 8-6.222C17 3.79 13.418 1 9 1Z"
          fill="#191919"
        />
      </svg>
      Kakao로 로그인
    </a>
  );
}
