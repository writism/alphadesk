# 2026-04-18 소스 최신화 및 백업 작업 기록

> 작성일: 2026-04-18
> 대상: `alpha-terminal-frontend`, `alpha-terminal-ai-server`

---

## 1. 작업 목적

- 프론트/백엔드 로컬 작업물을 보존한 상태에서 최신 소스를 반영한다.
- 백업 보관 경로를 정리해 운영 중인 백업 위치를 단일화한다.
- 프론트는 `upstream` 최신 코드와 동기화하되, 개인 배포용 설정은 `origin`에만 유지한다.

---

## 2. 사전 확인 결과

### 저장소 구조

- 작업 루트: `/Users/sulee/dev/codelab`
- Git 저장소:
  - `alpha-terminal-frontend`
  - `alpha-terminal-ai-server`
- 루트 자체는 Git 저장소가 아님

### 원격 저장소

#### 프론트엔드
- `origin`: `https://github.com/writism/alpha-terminal-frontend.git`
- `upstream`: `https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend.git`

#### 백엔드
- `origin`: `https://github.com/writism/alpha-terminal-ai-server.git`
- `upstream`: `https://github.com/EDDI-RobotAcademy/alpha-terminal-ai-server.git`

### 초기 판단

- 백엔드는 `upstream/main` 기준 fast-forward 가능 상태였다.
- 프론트는 로컬 변경사항이 많았고, `upstream/main` 대비 앞선 커밋 1개 / 뒤처진 커밋 2개 상태여서 바로 pull하지 않고 안전 절차가 필요했다.

---

## 3. 수행 작업 요약

### 3-1. 로컬 백업 생성

최신화 전 복원 가능한 스냅샷을 생성했다.

- `backups/alpha-terminal-frontend_20260418_171722_pre_pull.tar.gz`
- `backups/alpha-terminal-ai-server_20260418_171722_pre_pull.tar.gz`

기존 백업도 함께 `backups` 폴더에 유지했다.

### 3-2. 백업 폴더 구조 정리

기존에 중복 사용되던 `backup` / `backups` 중 `backups`를 표준 백업 위치로 유지하기로 결정했다.

정리 내용:
- `backup` 폴더 내부 구형 백업 파일 4개 삭제
- 빈 `backup` 폴더 삭제
- 이후 백업 보관 위치는 `backups`로 단일화

### 3-3. 백엔드 최신화

`alpha-terminal-ai-server`는 `upstream/main`에서 fast-forward로 최신 변경을 반영했다.

최신 반영 후 기준 커밋:
- 현재 `main`: `91368ad`
- `upstream/main`: `91368ad`
- `origin/main`: `1ccd2d0`

상태:
- 로컬 `main`은 `origin/main`보다 7커밋 앞선 상태
- 미추적 파일(`docs/...`, `server.pid`)은 유지

### 3-4. 프론트 최신화

`alpha-terminal-frontend`는 아래 순서로 안전하게 최신화했다.

1. 작업 트리를 `stash -u`로 보관
2. `upstream/main` 기준 rebase 수행
3. rebase 중 충돌 확인
4. 로컬 작업물 복원

rebase 중 충돌:
- 충돌 파일: `.github/workflows/main.yml`
- 원인:
  - 로컬 커밋 `44233ea`는 개인 배포 워크플로에서 Docker network 이름을 `alphadesk-network`로 통일하는 변경
  - 하지만 `upstream/main`에서는 해당 워크플로 파일 자체를 제거함

처리 결과:
- `upstream` 기준 정리에서는 해당 커밋을 `skip`
- 이유: `upstream`에는 개인 배포용 GitHub Actions 워크플로를 유지하지 않기 때문

### 3-5. 프론트 `origin` 전용 배포 설정 복원

사용 원칙:
- 앱 기능 코드는 `upstream` 기준 유지
- 개인 AWS 배포용 GitHub Actions 워크플로는 `origin`에만 유지

이에 따라 `origin/main`에 있던 배포 워크플로를 현재 로컬 브랜치에 다시 복원했다.

복원 파일:
- `.github/workflows/main.yml`

생성 커밋:
- `52bea13` `ci: restore origin-only deployment workflow`

이후 `origin/main`에 남아 있던 배포 커밋을 merge하여 강제 push 없이 일반 push 가능한 상태로 정리했다.

merge 커밋:
- `a69a71b` `Merge remote-tracking branch 'origin/main'`

최종적으로 프론트 `origin/main` 푸시 완료.

---

## 4. 커밋 및 브랜치 정리 결과

### 프론트엔드

- `upstream/main`: `b111140`
- `origin/main`: `a69a71b`
- 로컬 `main`: `a69a71b`

포함된 핵심 이력:
- `44233ea` `ci: Docker 네트워크를 alphadesk-network로 통일`
- `52bea13` `ci: restore origin-only deployment workflow`
- `a69a71b` `Merge remote-tracking branch 'origin/main'`

의미:
- 앱 소스는 `upstream` 최신 변경 반영 완료
- 개인 배포 워크플로는 `origin`에 유지
- 현재 로컬 브랜치는 `origin/main`과 동기화됨
- 로컬 작업 중이던 수정 파일/미추적 파일은 stash 복원으로 모두 보전됨

### 백엔드

- `upstream/main`: `91368ad`
- `origin/main`: `1ccd2d0`
- 로컬 `main`: `91368ad`

의미:
- 백엔드는 `upstream` 최신 반영 완료
- 아직 `origin`에는 push하지 않음

---

## 5. 현재 작업 트리 상태

### 프론트엔드

로컬 사용자 작업물이 그대로 남아 있다.

- 수정 파일 5개 유지
- 미추적 파일 다수 유지
- 브랜치 상태: `main...origin/main`

즉, 최신화 작업은 끝났지만 사용자 작업물은 건드리지 않았다.

### 백엔드

- 브랜치 상태: `main...origin/main [ahead 7]`
- 미추적 파일 유지:
  - `docs/INFRA-ISSUE-nginx-502-redeploy.md`
  - `docs/MVP-STATUS-2.0.md`
  - `server.pid`

---

## 6. 이번 작업에서 내린 운영 결정

1. `upstream`에는 개인 배포 설정을 올리지 않는다.
2. 개인 배포용 GitHub Actions 워크플로는 `origin`에만 유지한다.
3. 최신화 전에는 반드시 tar.gz 로컬 백업을 남긴다.
4. 백업 보관 경로는 `backups` 하나로 통일한다.
5. 프론트는 로컬 변경이 많은 경우 `stash -> rebase -> stash 복원` 순서로 최신화한다.

---

## 7. 남은 후속 작업 후보

- 백엔드도 필요 시 `origin` 기준 정리 및 push 수행
- 프론트 로컬 작업물 별도 커밋 또는 기능 단위 정리
- `backups` 폴더에 보관 주기/삭제 기준 문서화

---

## 8. 백업 파일 현황

현재 `backups` 폴더 보관본:

- `alpha-desk-ai-server_20260325_214149.tar.gz`
- `alpha-desk-ai-server_20260326_214242.tar.gz`
- `alpha-desk-ai-server_20260407_201354.tar.gz`
- `alpha-desk-frontend_20260325_214151.tar.gz`
- `alpha-desk-frontend_20260326_214237.tar.gz`
- `alpha-desk-frontend_20260407_201411.tar.gz`
- `alpha-terminal-ai-server_20260418_144108.tar.gz`
- `alpha-terminal-ai-server_20260418_171722_pre_pull.tar.gz`
- `alpha-terminal-frontend_20260418_144108.tar.gz`
- `alpha-terminal-frontend_20260418_171722_pre_pull.tar.gz`
