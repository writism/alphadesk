import type { TermItem } from "../model/termItem"

export const TERMS_DATA: TermItem[] = [
    {
        id: "terms_of_service",
        title: "이용약관",
        required: true,
        sections: [
            {
                title: "제 1 조 (목적)",
                content: [
                    "본 약관은 Alpha Terminal(이하 '서비스')가 제공하는 주식 정보 분석 서비스의 이용 조건 및 절차를 규정합니다.",
                ],
            },
            {
                title: "제 2 조 (서비스 이용)",
                content: [
                    "서비스는 회원가입 후 이용할 수 있습니다.",
                    "서비스는 주식 공시 및 뉴스 정보를 AI로 분석하여 제공합니다.",
                    "투자 결과에 대한 책임은 이용자 본인에게 있습니다.",
                ],
            },
            {
                title: "제 3 조 (이용자 의무)",
                content: [
                    "이용자는 타인의 계정을 무단으로 사용해서는 안 됩니다.",
                    "이용자는 서비스를 통해 취득한 정보를 무단으로 상업적 목적에 사용해서는 안 됩니다.",
                ],
            },
        ],
    },
    {
        id: "privacy_policy",
        title: "개인정보처리방침",
        required: true,
        sections: [
            {
                title: "제 1 조 (수집하는 개인정보)",
                content: [
                    "필수 정보: 이메일, 닉네임",
                    "자동 수집 정보: 서비스 이용 기록",
                ],
            },
            {
                title: "제 2 조 (개인정보 이용 목적)",
                content: [
                    "회원 식별 및 서비스 제공",
                    "서비스 개선 및 신규 기능 개발",
                ],
            },
            {
                title: "제 3 조 (보유 및 이용 기간)",
                content: [
                    "회원 탈퇴 시까지 보유합니다.",
                    "단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.",
                ],
            },
        ],
    },
    {
        id: "child_protection",
        title: "아동 보호 정책",
        required: false,
        sections: [
            {
                title: "제 1 조 (목적)",
                content: [
                    "본 정책은 만 14세 미만 아동의 개인정보를 보호하기 위한 사항을 규정합니다.",
                ],
            },
            {
                title: "제 2 조 (아동 개인정보 보호)",
                content: [
                    "서비스는 만 14세 미만 아동의 회원가입을 제한합니다.",
                    "아동의 개인정보가 수집된 경우 즉시 삭제 조치합니다.",
                ],
            },
        ],
    },
]
