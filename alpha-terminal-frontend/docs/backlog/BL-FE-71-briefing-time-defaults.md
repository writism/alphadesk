# BL-FE-71

**Backlog Type**
Behavior Backlog

**Backlog Title**
브리핑 타임 미설정 사용자에게 한국장/미국장 시장 시작 1시간 전 기본값이 적용된다

**Success Criteria**
- 한국장 브리핑 기본값은 08:00 KST (한국 증시 시작 09:00 기준 1시간 전)로 표시된다
- 미국장 브리핑 기본값은 22:30 KST (미국 NYSE 시작 09:30 EST = 23:30 KST 기준 1시간 전)로 표시된다
- 사용자가 직접 수정하기 전까지 기본값이 유지된다
- SETTINGS UI에서 기본값이 초기 선택 상태로 표시된다

**Todo**
1. 브리핑 타임 도메인 모델에 시장별 기본값 상수를 추가한다 (KR_DEFAULT: "08:00", US_DEFAULT: "22:30")
2. 브리핑 타임 atom 초기값을 시장별 기본값으로 설정한다
3. SETTINGS UI 브리핑 타임 선택기의 초기값을 기본값 상수로 교체한다
