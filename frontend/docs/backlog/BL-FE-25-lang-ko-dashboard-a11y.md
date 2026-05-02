# BL-FE-25

**Backlog Type**
Accessibility Backlog

**Backlog Title**
문서 언어를 한국어로 맞추고 대시보드 주요 컨트롤에 접근성 속성을 보강한다

**배경**
`html lang`이 `en`인데 UI는 한국어 위주다.
관심종목 선택·로그 섹션의 체크박스와 토글에 스크린리더/키보드 사용자를 위한 레이블이 부족할 수 있다.

**Success Criteria**
- 루트 레이아웃의 `html` 요소 `lang`이 `ko`이다
- 대시보드에서 전체 선택 체크박스에 `aria-label`(또는 연결된 `label`)이 있다
- 종목별 선택 체크박스에 종목 심볼 기준 `aria-label`이 있다
- 분석 로그 섹션 접기/펼치기 버튼에 `aria-expanded`가 있다

**Todo**
1. `app/layout.tsx`에서 `lang="ko"`로 변경한다
2. 대시보드 컴포넌트에 위 접근성 속성을 추가한다
