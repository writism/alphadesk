# BL-BE-82: 종목 테마 JSON 파싱 예외 처리

## 문제

`market_data_repository_impl.py`의 `get_stock_themes_by_codes()`에서 `o.themes`가
리스트가 아닐 때 `json.loads()`를 try-except 없이 호출한다.

```python
themes = o.themes if isinstance(o.themes, list) else json.loads(o.themes or "[]")
```

`StockThemeORM.themes`는 MySQL `JSON` 컬럼이므로 SQLAlchemy가 보통 Python 리스트로
자동 역직렬화하지만, 다음 상황에서 malformed 문자열이 들어올 수 있다.

- DB 직접 편집 / 외부 마이그레이션 스크립트로 잘못된 값 삽입
- 구버전 레코드에 이스케이프가 깨진 JSON 문자열

`json.JSONDecodeError`가 잡히지 않으면 파이프라인 전체가 500으로 떨어진다.

## 해결 방안

- `json.loads()` 호출을 try-except로 감싸고 실패 시 `[]` 반환
- `logger.warning`으로 어떤 종목 코드에서 파싱 실패했는지 기록 (silent fail 방지)
- `TypeError`도 함께 catch (None 이외의 비문자열 타입 대비)

## 범위

- `app/domains/market_analysis/adapter/outbound/persistence/market_data_repository_impl.py`

## 완료 기준

- malformed JSON이 있어도 서버 500 없이 해당 종목 테마만 `[]`로 처리
- warning 로그에 종목 코드와 raw 값이 찍힘
