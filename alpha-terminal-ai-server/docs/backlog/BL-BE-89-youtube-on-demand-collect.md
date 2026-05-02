# BL-BE-89: YouTube 영상 on-demand 수집 + 검색 소스 확장

## 배경

`GET /youtube/list?stock_name={종목}` 응답이 장기간 stale 상태로 관찰됨.

실측 (2026-04-21):
```
SELECT COUNT(*), MIN(published_at), MAX(published_at)
FROM market_videos
WHERE title LIKE '%SK하이닉스%';
-- total=6, oldest=2026-03-27, newest=2026-03-28 (24일간 갱신 없음)
```

API 응답은 필터링으로 4건만 노출.

## 원인 분석

현재 구조의 제약 3가지가 겹쳐서 발생한다.

### 1. 수집 trigger 부재
- `CollectMarketVideoUseCase` 의 유일한 호출 경로는 `POST /youtube/collect` **수동 호출**.
- 프론트엔드가 자동 호출하지 않으며, 어떤 스케줄러에도 등록되지 않음.
- 3/28 에 누군가 마지막으로 호출한 뒤 24일간 갱신되지 않음.

### 2. 수집 소스 협소
`CollectMarketVideoUseCase.CHANNEL_IDS` = 언론사 9개 채널(한경TV, SBS Biz, 연합뉴스TV 등).
- 투자·분석 전문 유튜버 영상은 원천적으로 수집 대상이 아님.
- `_MAX_RESULTS_PER_CHANNEL = 10`, `DAYS_BACK = 7`, `TOP_N = 10` 등의 상수로 인해 최종 DB 에 남는 건 극소수.

### 3. 재수집 윈도우 제약
- `publishedAfter = now - 7d` 를 YouTube API 파라미터에 박아서 호출하므로, 7일 넘은 공백이 생기면 그 기간 영상은 **영구히 수집 불가**.

## 해결 — on-demand + 검색 소스 편입

### 원칙
- 스케줄러 도입 안 함 (YouTube API 쿼터를 실제 트래픽에 비례하게 소비).
- "사용자가 로그인해서 youtube 탭을 여는 순간 자기 관심 종목 최신 영상이 보인다" 는 계약을 백엔드에서 강제.

### 변경

**A. `MarketVideoRepositoryPort` 확장**
```python
def find_latest_published_at(self, stock_name: str) -> Optional[datetime]:
    """해당 종목 제목을 포함하는 영상 중 최신 published_at. 없으면 None."""
```
구현: `MarketVideoRepositoryImpl` 에 `title.contains(stock_name)` 조건부 `MAX(published_at)` 조회.

**B. `YoutubeSearchAdapter` 결과를 `MarketVideo` 로 변환하는 헬퍼**
- `YoutubeVideo` (검색 API 결과) → `MarketVideo` 어댑터 메서드 추가.
- `video_url` 에서 `v=` 쿼리로 `video_id` 추출. `view_count = 0` 기본값(검색 API 응답에 없음).

**C. `GetYoutubeVideoListUseCase` 에 stale 체크 + on-demand 수집**
```python
def execute(self, page_token, stock_name, account_id):
    if stock_name and page == 1:
        latest = self._repository.find_latest_published_at(stock_name)
        if latest is None or _is_stale(latest, hours=settings.market_video_stale_hours):
            self._refresh_for_stock(stock_name)   # 실패해도 조회는 진행
    # 기존 조회 로직 그대로
```

`_refresh_for_stock(stock_name)`:
1. `CollectMarketVideoUseCase.execute([stock_name])` → 언론사 9채널 + 최근 7일.
2. `YoutubeSearchAdapter.search(page_token=None, stock_name=stock_name)` → 전체 유튜브에서 관련도 순 9개. 변환 후 `repository.upsert_all()`.
3. 두 경로 모두 `try/except + logger.warning` 으로 격리. 실패해도 이후 조회는 기존 DB 반환.

**D. `Settings`**
- `market_video_stale_hours: int = 6` 추가.

**E. `GET /youtube/list` 라우터**
- 이미 `user_token` → `session.user_id` 로 `account_id` 추출 중. 이걸 `usecase.execute(...)` 에 전달하도록 1줄 수정.
- (엄밀히는 account_id 를 유즈케이스가 꼭 쓰진 않지만, 차후 "본인 watchlist 소속 종목만 on-demand 수집" 제한을 넣을 여지를 위해 전달만 한다.)

### 왜 스케줄러가 아닌가

- "핫한 종목이므로 자주 갱신" 을 서비스 레벨에서 보장하려면, 사용자 트래픽이 자연스레 신호 역할을 한다.
- 스케줄러는 유령 계정/비활성 사용자의 watchlist 종목까지 무차별 수집해 YouTube Data API 쿼터(기본 10,000 units/day)를 소진.
- on-demand 는 "본 사람만 갱신" 이므로 비용이 정직하다.
- 두 번째 방문자부터는 stale 미경과 구간 내에서 캐시 히트.

### 왜 YoutubeSearchAdapter 를 편입하는가

- `CHANNEL_IDS` 9개는 언론사로만 한정되어 있어 "SK하이닉스 분석 영상" 같은 롱테일을 잡지 못한다.
- `YoutubeSearchAdapter.search()` 는 이미 `{stock_name} 주식 분석` 으로 YouTube 전체 검색을 수행한다 (조회 시 DB miss fallback 용도로만 쓰였음).
- on-demand trigger 시 이 결과도 함께 upsert 하면 DB 에 풍부한 소스가 누적된다.

## 범위

- 수정: `app/domains/market_video/application/usecase/market_video_repository_port.py`
- 수정: `app/domains/market_video/adapter/outbound/persistence/market_video_repository_impl.py`
- 수정: `app/domains/market_video/application/usecase/get_youtube_video_list_usecase.py`
- 수정: `app/domains/market_video/adapter/inbound/api/youtube_router.py`
- 수정: `app/infrastructure/config/settings.py`

## 완료 기준

- [x] `stock_name` 지정된 `GET /youtube/list?page=1` 호출 시, 해당 종목 최신 `published_at` 이 `market_video_stale_hours` 초과이면 자동 수집이 선행된다.
- [x] 수집 실패해도 사용자는 기존 DB 결과를 본다(회복력).
- [x] `page > 1` 조회는 수집 trigger 하지 않는다(페이지네이션 비용 중복 방지).
- [x] SK하이닉스 같은 인기 종목 첫 조회 시 언론사 채널 + 일반 유튜버 영상이 섞여 들어온다.

## 후속 제안 (별도 BL)

- `CollectMarketVideoUseCase` 상수(`CHANNEL_IDS`/`DAYS_BACK`/`TOP_N`) 를 `Settings` 외부화.
- on-demand trigger 를 `BackgroundTasks` 로 옮겨 첫 요청 응답 시간 개선.
- Prometheus 메트릭: `market_video_refresh_total{result="hit|stale_refreshed|error"}`.

## 롤백된 선행 시도

본 이슈의 1차 시도로 `BL-BE-88` (전체 사용자 watchlist union 스케줄러) 을 도입했으나, 다음 이유로 롤백 후 본 설계로 전환했다.

1. 유령 계정의 watchlist 까지 무차별 수집 → YouTube 쿼터 낭비.
2. 대상 종목 집합이 커질수록 `TOP_N=10` 상한에서 다른 종목 자리를 뺏음.
3. "로그인한 사용자 내 관심종목" 의미론과 불일치.
