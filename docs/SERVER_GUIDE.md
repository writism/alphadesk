# Alpha Desk 서버 운영 가이드

## 프로젝트 구조

| 서버 | 기술 스택 | 포트 | 경로 |
|------|-----------|------|------|
| 백엔드 | FastAPI + uvicorn | 33333 | `alpha-desk-ai-server/` |
| 프론트엔드 | Next.js | 3000 | `alpha-desk-frontend/` |

---

## 백엔드 (FastAPI)

### 시작

```bash
cd alpha-desk-ai-server
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 33333
```

> `--reload` 옵션은 코드 변경 시 자동으로 서버를 재시작합니다 (개발 환경 전용).

### 백그라운드 실행

```bash
cd alpha-desk-ai-server
source .venv/bin/activate
nohup uvicorn main:app --reload --host 0.0.0.0 --port 33333 > server.log 2>&1 &
echo $! > server.pid
```

### 중지

```bash
# 포그라운드 실행 중인 경우
Ctrl + C

# 백그라운드 실행 중인 경우 (PID 파일 이용)
kill $(cat alpha-desk-ai-server/server.pid)

# 포트로 프로세스 찾아 종료
lsof -ti :33333 | xargs kill
```

### 재시작

```bash
# 포트로 기존 프로세스 종료 후 재시작
lsof -ti :33333 | xargs kill
cd alpha-desk-ai-server
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 33333
```

### 상태 확인

```bash
# 프로세스 확인
lsof -i :33333

# API 헬스 체크
curl http://localhost:33333/docs
```

---

## 프론트엔드 (Next.js)

### 시작 (개발 모드)

```bash
cd alpha-desk-frontend
npm run dev
```

### 시작 (프로덕션 모드)

```bash
cd alpha-desk-frontend
npm run build
npm run start
```

### 백그라운드 실행

```bash
cd alpha-desk-frontend
nohup npm run dev > frontend.log 2>&1 &
echo $! > frontend.pid
```

### 중지

```bash
# 포그라운드 실행 중인 경우
Ctrl + C

# 백그라운드 실행 중인 경우 (PID 파일 이용)
kill $(cat alpha-desk-frontend/frontend.pid)

# 포트로 프로세스 찾아 종료
lsof -ti :3000 | xargs kill
```

### 재시작

```bash
# 포트로 기존 프로세스 종료 후 재시작
lsof -ti :3000 | xargs kill
cd alpha-desk-frontend
npm run dev
```

### 상태 확인

```bash
# 프로세스 확인
lsof -i :3000

# 브라우저에서 확인
open http://localhost:3000
```

---

## 양쪽 서버 동시 운영

### 동시 시작 (각각 별도 터미널 권장)

터미널 1 — 백엔드:
```bash
cd alpha-desk-ai-server && source .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 33333
```

터미널 2 — 프론트엔드:
```bash
cd alpha-desk-frontend && npm run dev
```

### 동시 중지

```bash
lsof -ti :33333 | xargs kill
lsof -ti :3000 | xargs kill
```

### 실행 중인 서버 전체 확인

```bash
lsof -i :33333 -i :3000
```

---

## 의존성 설치 (최초 또는 변경 시)

### 백엔드

```bash
cd alpha-desk-ai-server
python -m venv .venv          # 최초 1회
source .venv/bin/activate
pip install -r requirements.txt
```

### 프론트엔드

```bash
cd alpha-desk-frontend
npm install
```

---

## 접속 주소

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:33333 |
| API 문서 (Swagger) | http://localhost:33333/docs |
| API 문서 (ReDoc) | http://localhost:33333/redoc |
