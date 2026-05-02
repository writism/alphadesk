# OG 이미지 & SNS 공유 기능 계획

작성일: 2026-03-26

---

## 배경

Alpha Desk 카드를 카카오톡, 페이스북, X(트위터) 등 SNS에 공유할 때
카드 디자인처럼 보이는 미리보기를 제공하기 위한 기능 계획.

현재는 사설 IP 환경이라 외부 접근이 불가하므로 **우선 ngrok로 테스트**하고,
서비스 배포 시 정식 구현한다.

---

## OG(Open Graph)란?

페이스북이 만든 표준. 링크를 SNS에 공유할 때 **미리보기(제목, 설명, 이미지)**를
자동으로 표시해주는 메타태그 규격.

```html
<head>
  <meta property="og:title" content="삼성전자 — 긍정 +0.85" />
  <meta property="og:description" content="AI 분석: 실적 호조 기대감 상승" />
  <meta property="og:image" content="https://alphadeskai.com/api/og?id=abc123" />
</head>
```

카카오톡에 링크를 붙여넣으면:

```
┌──────────────────────────┐
│  [OG 이미지]              │
│  삼성전자 — 긍정 +0.85    │
│  AI 분석: 실적 호조 기대  │
└──────────────────────────┘
  alphadeskai.com
```

---

## OG 이미지란?

SNS는 링크 미리보기를 보여줄 때 JavaScript/CSS를 실행하지 않고
**이미지만 가져온다.** 따라서 카드 컴포넌트를 그대로 보여줄 수 없고,
**카드처럼 생긴 PNG 이미지**를 서버에서 동적으로 생성해서 제공한다.

```
서버가 HTML/CSS로 카드 렌더링
    ↓
PNG로 변환 (Next.js: @vercel/og 라이브러리)
    ↓
SNS에 PNG로 전달 → 카드처럼 보임
```

- 미리보기: PNG (정적 이미지처럼 보임)
- 링크 클릭 후: 실제 React 카드 컴포넌트 (인터랙티브)

---

## SNS 공유 동작 흐름

```
공유 버튼 클릭
    ↓
브라우저가 SNS 공유 URL을 엶 (텍스트+링크 자동 채워짐)
    ↓
사용자가 "게시" 버튼만 누르면 완료
```

### SNS별 공유 URL 패턴

| SNS | URL |
|-----|-----|
| 페이스북 | `https://facebook.com/sharer/sharer.php?u={링크}` |
| X(트위터) | `https://twitter.com/intent/tweet?url={링크}&text={텍스트}` |
| 카카오톡 | 카카오 JS SDK 사용 (별도 초기화 필요) |
| 링크드인 | `https://linkedin.com/sharing/share-offsite/?url={링크}` |

---

## 구현 계획

### Phase 1 — OG 테스트 (ngrok 환경)

| 작업 | 예상 시간 |
|------|----------|
| ngrok 설치 및 실행 | 5분 |
| `/share/[id]` 공개 페이지 생성 | 1~2시간 |
| OG 메타태그 추가 | 30분 |
| `/api/og` OG 이미지 생성 API | 2~3시간 |
| 카카오톡 공유 버튼 | 1시간 |
| **합계** | **반나절~하루** |

#### ngrok 실행 방법

```bash
brew install ngrok
ngrok http 3000
# → https://abc123.ngrok-free.app 임시 URL 생성
# → 카카오톡에 붙여넣어 OG 미리보기 테스트 가능
```

### Phase 2 — 실제 배포 (서비스 오픈 시)

| 작업 | 예상 시간 |
|------|----------|
| Vercel 프론트 배포 | 1~2시간 |
| Railway 백엔드 배포 | 2~3시간 |
| DB 마이그레이션 | 1시간 |
| 환경변수 설정 | 30분 |
| 도메인 연결 (구매 시) | 30분 |
| **합계** | **하루** |

---

## 기술 스택

- **OG 이미지 생성**: `@vercel/og` (Next.js Edge Runtime에서 HTML → PNG 변환)
- **공유 페이지**: `/share/[id]` Next.js 동적 라우트 (SSR, OG 태그 포함)
- **카카오톡 공유**: Kakao JavaScript SDK
- **배포**: Vercel (프론트) + Railway (백엔드)
- **무료 도메인**: Vercel 자동 제공 서브도메인 (`*.vercel.app`) 또는 커스텀 도메인 구매

---

## 바이럴 전략 메모

| 아이디어 | 설명 |
|---------|------|
| AI 예측 적중률 공유 | "이번 주 AI가 맞춘 종목 3/5" 배지 |
| 포트폴리오 진단 결과 | "내 관심종목 AI 감성 점수: 긍정 72%" |
| 주간 리포트 | 매주 월요일 "주목 종목 TOP3" 공유 |

**채널 우선순위**: 카카오톡 > X(트위터) > 인스타그램

---

## 현재 상태

- [ ] Phase 1 테스트 시작 전 (배포 계획 확정 후 진행)
- [ ] Phase 2 배포 미정
