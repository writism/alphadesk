# CI/CD 배포 구조

## 개요

main 브랜치 push 시 GitHub Actions가 자동으로 빌드 → EC2 배포까지 처리한다.

## EC2 상시 실행 컨테이너

```
alphadesk-network (bridge)
├── alphadesk-api        ← Actions가 교체 (BE)
├── alphadesk-web        ← Actions가 교체 (FE)
├── MySQL 컨테이너
├── Redis 컨테이너
├── PostgreSQL 컨테이너
└── alphadesk-nginx
```

DB/nginx 컨테이너는 EC2에서 별도로 운영되며 Actions가 건드리지 않는다.
Actions는 alphadesk-api(BE), alphadesk-web(FE)만 stop → rm → run 교체한다.

## 실행 흐름

```
main push/merge
  → [GitHub 서버] build-and-push
      docker buildx build (BE: linux/arm64 / FE: linux/amd64+arm64)
      → ghcr.io push
  → [EC2 self-hosted runner] deploy
      docker pull
      docker stop/rm 기존 컨테이너
      docker run --env-file .env --network alphadesk-network
      health check
```

## 워크플로우 파일

- BE: `.github/workflows/main.yml` (writism/alpha-terminal-ai-server)
- FE: `.github/workflows/main.yml` (writism/alpha-terminal-frontend)
- 트리거: `on: push: branches: main`

## Docker 이미지

- BE: `ghcr.io/writism/alpha-terminal-api:latest`
- FE: `ghcr.io/writism/multi-agent-ui:latest`

## BE 컨테이너 실행 설정

```bash
docker run -d \
  --name alphadesk-api \
  -p 33333:33333 \
  --env-file /home/ec2-user/alpha-terminal-ai-server/.env \
  --network alphadesk-network \
  --restart unless-stopped \
  ghcr.io/writism/alpha-terminal-api:latest \
  python -m main   # ← wait-for-it 오버라이드 (중요)
```

> **주의**: upstream Dockerfile의 CMD가 wait-for-it으로 mysql/redis/postgres를
> 기다리도록 변경될 수 있다. EC2에는 해당 이름의 컨테이너가 없으므로
> `python -m main` 오버라이드를 반드시 유지해야 한다.

## FE 컨테이너 실행 설정

```bash
docker run -d \
  --name alphadesk-web \
  -p 3000:3000 \
  -e BACKEND_URL=http://alphadesk-api:33333 \
  --network alphadesk-network \
  --restart unless-stopped \
  ghcr.io/writism/multi-agent-ui:latest
```

## EC2 Runner 정보

- BE runner 경로: `/home/ec2-user/alpha-terminal-ai-server/actions-runner/`
- BE runner 서비스명: `actions.runner.writism-alpha-terminal-ai-server.alpha-terminal-api`
- FE runner 레이블: `multi-agent-ui`
- 상태: systemd enabled, 24시간 실행 중

## upstream Dockerfile 변경 시 주의사항

upstream이 Dockerfile CMD를 변경해도 우리 워크플로우의
`python -m main` 오버라이드로 인해 영향 없다.
DB 구조(컨테이너 이름/네트워크)가 바뀌지 않는 한 워크플로우 유지하면 된다.
