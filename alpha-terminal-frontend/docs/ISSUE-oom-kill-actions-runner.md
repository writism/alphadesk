# EC2 Actions Runner OOM Kill 이슈

## 증상
- GitHub Actions job이 `Queued` 상태에서 무한 대기
- 이전 빌드가 exit code 255 로 실패
- EC2에서 runner 서비스가 `failed (Result: oom-kill)` 상태로 멈춰있음

## 원인
`npm run build` (Next.js 프로덕션 빌드) 실행 중 메모리 사용량이 EC2 t4g.small(2GB RAM) 한계를 초과  
→ OOM Killer가 runner 프로세스 강제 종료  
→ 서비스가 `failed` 상태로 멈추면서 이후 job이 Queued 상태로 대기

## 확인 방법
```bash
ssh -i ~/dev/codelab/alpha-desk.pem ec2-user@52.79.151.142 \
  "cd /home/ec2-user/alpha-terminal-frontend/actions-runner && sudo ./svc.sh status"
```

로그에서 아래 문구 확인:
```
Active: failed (Result: oom-kill)
A process of this unit has been killed by the OOM killer.
```

## 즉시 복구 방법
```bash
ssh -i ~/dev/codelab/alpha-desk.pem ec2-user@52.79.151.142 \
  "cd /home/ec2-user/alpha-terminal-frontend/actions-runner && sudo ./svc.sh start"
```

Runner 재시작 후 Queued된 job이 자동으로 실행됨

## 근본 해결 방안 (미적용)

### 방법 1 — Node.js 메모리 제한 설정
`package.json` build 스크립트에 메모리 상한 추가:
```json
"build": "NODE_OPTIONS='--max-old-space-size=1024' next build"
```

### 방법 2 — Swap 메모리 추가
EC2에 swap 파일 추가로 OOM 방지:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 방법 3 — EC2 인스턴스 업그레이드
t4g.small(2GB) → t4g.medium(4GB) 으로 업그레이드

## 이력
- 2026-04-30: `npm run build` 중 OOM kill 발생, runner 수동 재시작으로 복구
