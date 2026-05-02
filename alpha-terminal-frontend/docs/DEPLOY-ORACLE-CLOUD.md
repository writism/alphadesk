# Alpha Desk — Oracle Cloud Always Free 배포 가이드

## 1. Oracle Cloud 계정 생성

가입: https://www.oracle.com/cloud/free/

**필요한 것:**
- 이메일, 전화번호 (SMS 인증)
- 실물 신용/체크카드 (본인 인증용, 과금 안 됨. 가상카드/선불카드 불가)

**중요:** Home Region을 Seoul(ap-seoul-1)로 선택. 변경 불가이고 Always Free 리소스는 Home Region에서만 생성 가능.

가입 후 30일간 $300 크레딧 제공 → 만료 후에도 Always Free 리소스는 계속 무료.

---

## 2. Always Free 스펙

- ARM VM (Ampere A1): 최대 **4 OCPU / 24GB RAM** (1개 또는 분할)
- 스토리지: 200GB (부트 + 블록 볼륨 합산)
- 아웃바운드: 10TB/월
- 로드밸런서: 1개 (10Mbps)

---

## 3. VM 인스턴스 생성

OCI Console → Compute → Instances → Create Instance

```
이름:          alpha-desk
이미지:        Ubuntu 22.04 (aarch64)
Shape:         VM.Standard.A1.Flex
OCPU:          4
Memory:        24 GB
Boot Volume:   100 GB
VCN:           새로 생성 또는 기존 VCN 선택
Public IP:     자동 할당
SSH Key:       로컬 공개키 업로드 (~/.ssh/id_rsa.pub)
```

> ARM A1이 "Out of Capacity" 에러 나면 시간대를 바꿔서 재시도 (새벽 시간대 추천).

---

## 4. 방화벽 설정 (2단계)

### 4-1. OCI Security List (콘솔)

Networking → Virtual Cloud Networks → VCN 선택 → Security Lists → Default Security List → Add Ingress Rules

| 포트 | 용도 |
|------|------|
| 22   | SSH (기본 포함) |
| 80   | HTTP (Nginx) |
| 443  | HTTPS |

> 3000, 33333은 Nginx가 리버스 프록시하므로 외부 오픈 불필요.

### 4-2. OS 방화벽 (Ubuntu iptables)

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 5. 서버 초기 세팅

SSH 접속:
```bash
ssh ubuntu@<VM_PUBLIC_IP>
```

### 5-1. 기본 패키지

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx
```

### 5-2. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# DB + 유저 생성
sudo -u postgres psql -c "CREATE USER alphadesk WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE alphadesk OWNER alphadesk;"
```

### 5-3. Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
```

### 5-4. Python (pyenv + 3.11)

```bash
# pyenv 의존성
sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncurses-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# ~/.bashrc에 추가
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.11.9
pyenv global 3.11.9
```

### 5-5. Node.js (nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

---

## 6. 프로젝트 배포

### 6-1. 코드 클론

```bash
cd ~
git clone https://github.com/writism/alpha-desk-ai-server.git
git clone https://github.com/writism/alpha-desk-frontend.git
```

### 6-2. 백엔드 (FastAPI)

```bash
cd ~/alpha-desk-ai-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# .env 설정
cat > .env << 'EOF'
DATABASE_URL=postgresql://alphadesk:your_password@localhost:5432/alphadesk
REDIS_HOST=localhost
REDIS_PORT=6379
YOUTUBE_API_KEY=your_youtube_api_key
EOF

# DB 마이그레이션 (alembic 사용 시)
# alembic upgrade head
```

### 6-3. 프론트엔드 (Next.js)

```bash
cd ~/alpha-desk-frontend
npm install
npm run build

# .env.local 설정
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://your-domain.com/api
EOF
```

---

## 7. systemd 서비스 등록

### 7-1. FastAPI 서비스

```bash
sudo tee /etc/systemd/system/alpha-desk-api.service << 'EOF'
[Unit]
Description=Alpha Desk FastAPI
After=network.target postgresql.service redis-server.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/alpha-desk-ai-server
Environment=PATH=/home/ubuntu/alpha-desk-ai-server/.venv/bin:/usr/bin
ExecStart=/home/ubuntu/alpha-desk-ai-server/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 33333
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### 7-2. Next.js 서비스

```bash
sudo tee /etc/systemd/system/alpha-desk-web.service << 'EOF'
[Unit]
Description=Alpha Desk Next.js
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/alpha-desk-frontend
ExecStart=/home/ubuntu/.nvm/versions/node/v20.*/bin/npm start
Restart=always
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF
```

### 서비스 시작

```bash
sudo systemctl daemon-reload
sudo systemctl enable alpha-desk-api alpha-desk-web
sudo systemctl start alpha-desk-api alpha-desk-web
```

---

## 8. Nginx 리버스 프록시

```bash
sudo tee /etc/nginx/sites-available/alpha-desk << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # FastAPI
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:33333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/alpha-desk /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. HTTPS (Let's Encrypt)

도메인이 있는 경우:
```bash
sudo certbot --nginx -d your-domain.com
```

도메인 없이 IP만 사용하면 HTTP로 접속 (http://<VM_PUBLIC_IP>).

### 무료 도메인 추천: DuckDNS

`alphadesk.duckdns.org` 같은 서브도메인을 무료로 사용 가능.

- **DuckDNS** (duckdns.org) — GitHub 로그인 후 즉시 생성, IP 자동 업데이트 지원. 가장 간편.
- **FreeDNS** (freedns.afraid.org) — `alphadesk.mooo.com` 등 다양한 도메인 선택 가능.
- **No-IP** (noip.com) — `alphadesk.ddns.net`. 30일마다 갱신 클릭 필요.

> Freenom (.tk, .ml 등)은 2023년부터 신규 등록 중단됨.
> .com, .dev 등 정식 도메인은 유료 (연 1~2만원).

DuckDNS 설정:
```bash
# DuckDNS 토큰으로 IP 업데이트 (cron 등록)
echo "*/5 * * * * curl -s 'https://www.duckdns.org/update?domains=alphadesk&token=YOUR_TOKEN&ip='" | crontab -
```

Let's Encrypt 적용:
```bash
sudo certbot --nginx -d alphadesk.duckdns.org
```

---

## 10. GitHub Actions 자동 배포

PR이 main에 머지될 때 자동으로 서버에 배포됩니다.

배포 흐름: **팀원 PR 올림 → 팀장 리뷰 후 Merge → GitHub Actions 자동 배포 → 서버 반영**

### 10-1. GitHub Secrets 설정

upstream 레포 (EDDI-RobotAcademy) → Settings → Secrets and variables → Actions에 추가:

| Secret | 값 |
|--------|-----|
| `OCI_HOST` | VM 퍼블릭 IP |
| `OCI_USER` | `ubuntu` |
| `OCI_SSH_KEY` | SSH 프라이빗 키 내용 (~/.ssh/id_rsa) |

### 10-2. 백엔드 워크플로우

`alpha-desk-ai-server/.github/workflows/deploy.yml`:
```yaml
name: Deploy Backend

on:
  pull_request:
    branches: [main]
    types: [closed]

jobs:
  deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ${{ secrets.OCI_USER }}
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            cd ~/alpha-desk-ai-server
            git pull origin main
            source .venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart alpha-desk-api
```

### 10-3. 프론트엔드 워크플로우

`alpha-desk-frontend/.github/workflows/deploy.yml`:
```yaml
name: Deploy Frontend

on:
  pull_request:
    branches: [main]
    types: [closed]

jobs:
  deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ${{ secrets.OCI_USER }}
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            cd ~/alpha-desk-frontend
            git pull origin main
            npm install
            npm run build
            sudo systemctl restart alpha-desk-web
```

> `types: [closed]` + `merged == true` 조합으로 PR이 머지될 때만 트리거됩니다.
> PR이 머지 없이 닫히면(close) 배포되지 않습니다.

---

## 11. 유지보수 팁

**로그 확인:**
```bash
sudo journalctl -u alpha-desk-api -f    # 백엔드 로그
sudo journalctl -u alpha-desk-web -f    # 프론트 로그
```

**서비스 재시작:**
```bash
sudo systemctl restart alpha-desk-api alpha-desk-web nginx
```

**Idle 인스턴스 회수 방지:**
- 실제 서비스가 돌아가면 CPU 사용률 20% 이상 유지되어 문제없음
- 안전하게 하려면 OCI 콘솔에서 계정을 "Pay As You Go"로 업그레이드 (Always Free 범위 내에서는 과금 없음, 회수 방지)

---

## 12. 리소스 사용량 분석

Oracle Free ARM A1 스펙: **4 OCPU / 24GB RAM / 100GB 디스크**

Alpha Desk 실제 사용량:

| 서비스 | RAM 사용량 |
|--------|-----------|
| FastAPI + uvicorn | ~200MB |
| Next.js (production) | ~300MB |
| PostgreSQL | ~100MB |
| Redis | ~50MB |
| kiwipiepy (형태소 분석) | ~500MB (로딩 시) |
| **합계** | **~1.2GB (24GB 중 5%)** |

CPU도 파이프라인(AI 분석) 돌릴 때만 잠깐 사용하고 평소에는 거의 유휴 상태라 4 OCPU면 충분.

**결론: 우리 규모에서는 오버스펙. 유료 서버 불필요.**

동시 사용자 수십 명 수준까지 문제없음. 팀원 테스트/데모 용도로 완벽한 스펙.

### 별도 과금이 발생하는 외부 API

- **Claude API** (Anthropic) — AI 종목분석 호출 시 Anthropic에 별도 과금
- **YouTube Data API** — 일 10,000 쿼터 무료 (댓글 수집 충분)
- **Kakao API** — 무료

이들은 OCI와 무관하게 각 서비스 자체 요금 정책을 따름.

---

## 요약: 배포 순서 체크리스트

1. [ ] Oracle Cloud 계정 생성 (Seoul 리전)
2. [ ] ARM A1 VM 생성 (4 OCPU / 24GB / Ubuntu)
3. [ ] Security List 포트 오픈 (80, 443)
4. [ ] OS 방화벽 설정
5. [ ] PostgreSQL + Redis + Python + Node.js 설치
6. [ ] 코드 클론 + .env 설정
7. [ ] systemd 서비스 등록 + 시작
8. [ ] Nginx 리버스 프록시 설정
9. [ ] (선택) HTTPS 인증서 발급
10. [ ] (선택) GitHub Actions 자동배포 설정
