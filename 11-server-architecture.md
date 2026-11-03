# 11. 서버 아키텍처

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.2 |
| 기준일 | 2026-11-03 |
| 기준 코드 | backend `deploy/` (`docker-compose.prod.yml` · `Caddyfile` · `remote-deploy.sh`) · 세 저장소의 `Dockerfile` · `.github/workflows/` |

> **이 문서는 무엇인가**
>
> **무엇이 어디에 올라가고, 어떻게 올리는지** 적은 문서입니다.
> 큰 그림은 [02 시스템 아키텍처 3장](02-system-architecture.md)에 있고,
> 여기는 컨테이너 · 네트워크 · 올리는 절차를 한 겹 더 들어갑니다.
>
> **2026-11-02 에 실제로 올렸습니다 — https://www.drawtale.kr**
> 명령 하나하나는 `drawtale-backend/deploy/README.md` 에 있습니다.

---

## 1. 개발할 때 (각자 PC)

```
개발자 PC
├─ 프론트   npm run dev        :5173   (Vite, /api/v1 을 8000 으로 넘김)
├─ Backend  .venv 의 uvicorn   :8000
├─ AI       docker compose     :8001   ← ai 컨테이너
│            └ torchserve      :8080   (디버그용으로만 열어 둠)
└─ DB       로컬 postgres:16   :5433
```

| 어디 | 무엇으로 | 포트 |
|---|---|---|
| 프론트 | Vite 개발 서버 | 5173 |
| Backend | `.venv` 의 `uvicorn`, 또는 `docker compose --profile app up` | 8000 |
| AI 서버 | Docker (`ai` 컨테이너) | 8001 |
| 모델 서버 | Docker (`torchserve` 컨테이너) | 8080 |
| DB | 로컬 `postgres:16` (`docker compose up -d db`) | 5433 |
| 파일 | 로컬 디스크 `./storage` → 서명이 붙은 `/files` 주소로 내보냄 | — |

> **포트를 `127.0.0.1` 에 묶어 둡니다.** `docker-compose.yml` 의 포트가
> `127.0.0.1:8001:8001` 처럼 적혀 있어, **같은 PC 에서만** 닿습니다.

> **팀 공용 DB(`psql-drawtale`)는 지금 쓸 수 없습니다 (2026-11-02).**
> 공용 DB 와 Blob(`stdrawtale`)이 있던 구독 `Azure subscription 1` 의 크레딧이 만료돼 「사용 안 함」이 됐습니다.
> 개발은 로컬 DB 로 합니다. 그 구독에서 **「업그레이드」를 누르면 카드 결제가 시작됩니다.**

## 2. 컨테이너

| 컨테이너 | 바탕 이미지 | 무엇이 들어 있나 | 이미지 크기 | 메모리 (실측) |
|---|---|---|---|---|
| `caddy` | `caddy:2.8-alpine` | HTTPS · 화면 파일 · API 앞단 | — | 16MB |
| `backend` | `python:3.11-slim` | FastAPI · Alembic | 452MB | 180MB 안팎 |
| `db` | `postgres:16` | 서비스 DB | — | 50MB 안팎 |
| `ai` | `python:3.10-slim-bookworm` | FastAPI · OpenCV · PyOpenGL · **Meta 렌더 코드** | 1.68GB | **1.1GB** (쉴 때 170MB) |
| `torchserve` | **`python:3.8.13-bullseye`** | PyTorch 2.0 (**CPU 전용**) · 모델 2개 | 5.54GB | **1.9GB** |

### 왜 이렇게 나눴나

| | |
|---|---|
| **파이썬이 다릅니다** | Meta 모델 코드가 **3.8.13** 을 요구합니다. AI 서버는 3.10, Backend 는 3.11 입니다 |
| **무게가 다릅니다** | 모델만 1.5GB 를 씁니다. 같이 두면 Backend 를 재시작할 때 모델도 다시 올려야 합니다 |
| **나중에 떼어낼 수 있게** | 지금은 한 대에 다 올리지만 **이미지와 API 가 분리**돼 있어 서버를 나누기 쉽습니다 |

### 이미지를 만들 때 주의할 것

| 무엇 | 왜 |
|---|---|
| **PyTorch 는 CPU 전용으로** | VM 에 GPU 가 없습니다. 기본 설치는 CUDA 를 4.5GB 더 받아 **이미지가 32GB** 까지 커집니다 |
| **`torchserve` 는 conda 를 쓰지 않습니다** (11-02) | conda 저장소가 바뀌어 옛 miniconda 로는 python 3.8 을 깔 수 없게 됐습니다. 공식 `python:3.8.13` 이미지로 바꿨습니다 |
| **Debian 저장소를 날짜로 고정** | bullseye 저장소가 만료돼 빌드가 깨집니다 (snapshot 으로 고정) |
| `libosmesa6` 를 넣습니다 | 화면이 없는 서버에서 OpenGL 로 그리기 때문입니다 |
| `ffmpeg` 를 넣습니다 | OpenCV 가 H.264 를 만들지 못합니다 ([12 4장](12-ai-architecture.md)) |
| 컨테이너는 `appuser` 로 돕니다 | `root` 로 돌리지 않습니다 |

## 3. 실제 구성 (2026-11-02 ~)

```
사용자 브라우저
   │ HTTPS
   ▼
Azure VM  drawtale-vm (20.196.129.38)  ── 바깥에 열린 것은 80 · 443 · 22
   └ caddy ─┬─ www.drawtale.kr  → 화면 파일 (deploy/www)
            ├─ drawtale.kr      → www 로 이동
            └─ api.drawtale.kr  → backend ─┬─ db (postgres, 볼륨)
                                           ├─ 파일 (볼륨, 서명 주소)
                                           └─ ai ─ torchserve
                                    backend ──→ OpenAI · Anthropic · ElevenLabs
```

| 항목 | 값 |
|---|---|
| 구독 | **Azure for Students** (학생 크레딧 약 13만 원, 2027-09-28 만료) |
| VM | `rg-drawtale-prod` / `drawtale-vm`, Korea Central, **Standard_D2s_v4 (2코어 · 8GB)**, 표준 SSD 64GB, Ubuntu 24.04 |
| 도메인 | `drawtale.kr` (가비아). DNS A 레코드 `@` · `www` · `api` → VM IP |
| HTTPS | Caddy 가 Let's Encrypt 인증서를 자동으로 받고 갱신합니다 |
| 화면 | **Static Web Apps 를 쓰지 않습니다.** Caddy 가 빌드 결과를 함께 줍니다 (리소스 하나 덜, `drawtale.kr` 도 쓸 수 있음) |
| DB · 파일 | **VM 안에 둡니다** (Azure DB · Blob 을 따로 만들지 않음). 크레딧을 VM 에만 쓰려고 |

### 왜 2코어 · 8GB 인가

| | |
|---|---|
| 메모리 | 다섯 컨테이너 합쳐 실측 **3.5GB 안팎** (쉴 때). 8GB 면 여유가 있습니다 |
| 크레딧 | 4코어는 학생 크레딧이 한 달도 안 갑니다 |
| 크기 이름 | `D2s_v5` 는 이 구독 · 지역에서 용량이 없어 막혀 `D2s_v4`(값 같음)를 골랐습니다 |
| 렌더 | 2코어라 PC 보다 느립니다. **여러 명이 동시에 쓸 때는 아직 재지 않았습니다** |

### 비용 · 켜고 끄기

| VM 상태 | 사이트 | 크레딧 |
|---|---|---|
| 실행 중 | 열림 | VM 시간당 $0.118 + 디스크 · IP |
| **중지됨(할당 취소됨)** | **닫힘** | 디스크 · IP 만 (하루 $0.3 안팎) |

- 24시간 켜면 **약 35일**, 하루 8시간이면 **약 75~80일** 에 크레딧이 끝납니다 (디스크 · IP 단가는 추정)
- **지금은 쓸 때만 손으로 켜고 끕니다.** 포털 `drawtale-vm` → 「시작」 / 「중지」. VM 안에서 `shutdown` 으로 끄면 요금이 계속 나갑니다
- 다시 켜면 Docker 와 컨테이너가 스스로 올라옵니다 (`restart: unless-stopped`). 2~3분
- 크레딧이 끝나면 결제되지 않고 **VM 이 멈춥니다.** 「업그레이드」를 누를 때만 결제됩니다

## 4. 무엇을 바깥에 여나

| 무엇 | 바깥에서 닿나 | 왜 |
|---|---|---|
| `caddy` (80 · 443) | **열림** | 화면과 API 의 유일한 입구 |
| SSH (22) | **열림 · 키로만** | 비밀번호 로그인은 꺼져 있습니다. GitHub Actions 가 그때그때 다른 IP 로 들어와 IP 로 막지 못합니다 |
| `backend` · `db` | **닫힘** | caddy · backend 만 안쪽에서 부릅니다 |
| `ai` · `torchserve` | **닫힘** | **AI 서버에는 로그인 검사가 없습니다** ([12 2장](12-ai-architecture.md)) |
| 파일 `/files` | 서명 · 기한이 맞는 주소만 | Blob SAS 와 같은 규칙. 주소 경로만 알아서는 열리지 않습니다 |

**바깥에서 확인했습니다 (11-02):** 8000 · 8001 · 8080 · 5432 모두 닿지 않음.
`python deploy/check_live.py` 보안 점검 **18 / 18 통과** — 보안 헤더 · HSTS · CSP · API 문서 닫힘 · 서명 없는 파일 거부 · CORS.

**CORS 는 `https://www.drawtale.kr` 하나만** 허용합니다 (`.env.prod` 의 `CORS_ORIGINS`).

## 5. 비밀값은 어디에 두나

| 무엇 | 어디에 |
|---|---|
| 앱 비밀값 (API 키 · 카카오 · 구글 · 파일 서명 키) | VM `~/drawtale/drawtale-backend/deploy/.env.prod` (권한 600) |
| DB 비밀번호 | VM `deploy/.env` (compose 가 읽음) |
| 저장소에 올리나 | **올리지 않습니다.** `.gitignore` 에 있습니다 |
| 프론트에는 | **아무 비밀도 두지 않습니다.** 카카오 · 구글 client id 같은 공개값만 빌드 때 넣습니다 |
| 사람이 VM 에 들어가는 키 | 팀장 PC 의 `.pem`. 저장소 · 채팅에 올리지 않습니다 |
| GitHub Actions 배포 키 | 세 저장소의 Actions Secrets. VM 에서는 **`~/remote-deploy.sh` 만** 돌 수 있게 묶었습니다 (`authorized_keys` 의 `command=`) |

**Key Vault 같은 비밀 관리 서비스는 쓰지 않습니다.** 서버가 한 대라 파일로 충분합니다. 서버가 늘거나 사람마다 권한을 나눠야 할 때 다시 봅니다.

**환경변수만 바꿀 때는 다시 빌드하지 않습니다:** `.env.prod` 를 고치고 `docker compose -f docker-compose.prod.yml up -d backend`. 프론트의 `VITE_*` 값은 화면을 다시 빌드해야 합니다.

## 6. 올리는 방법 — 브랜치에 푸시하면 자동

```
팀원이 커밋 · 푸시
      ↓ (여기부터 자동, GitHub Actions)
테스트 / 빌드 ── 실패하면 멈춤, 사이트는 그대로
      ↓ 통과
VM 으로 코드(tar)를 보냄 → ~/remote-deploy.sh 가 반영
      ↓
www.drawtale.kr 갱신
```

| 저장소 | 이 브랜치에 푸시하면 | 하는 일 |
|---|---|---|
| backend | `dev` | `pytest` → `backend` · `db` · `caddy` 다시 만들기, 카드 이야기 씨앗 |
| frontend | `feat/backend-contract` · `dev` | `npm run build`(타입 검사 포함) → `deploy/www` 바꾸기 |
| ai | `dev` | `ai` · `torchserve` 다시 만들기 (안 바뀐 단계는 캐시) |

| 정한 것 | 왜 |
|---|---|
| **PR 은 테스트 · 빌드만** | 다른 사람 코드가 배포 키로 VM 에 닿지 않게 |
| 레지스트리를 쓰지 않고 **VM 에서 빌드** | 단계가 적고 비용이 없습니다. `ai` 저장소가 비공개라 VM 이 직접 받지 않고 Actions 가 코드를 보냅니다 |
| 마이그레이션은 **backend 가 뜰 때마다** `alembic upgrade head` | DB 가 서비스 전용이라 팀 공용 DB 걱정이 없습니다 |
| 세 저장소가 동시에 올라와도 **하나씩** | `flock` 으로 줄을 세웁니다 |

> **`main` 은 배포하지 않습니다.** 앞으로도 위 세 브랜치로 작업한다고 정했습니다 (11-03).
> **VM 이 꺼져 있으면 배포가 실패합니다.** 켠 뒤 GitHub Actions 에서 그 실행을 「Re-run」 합니다.

## 7. 돌아가는지 어떻게 확인하나

| 무엇 | 어떻게 |
|---|---|
| 실제 사이트 전체 | **`python deploy/check_live.py`** — 아무 PC 에서. 돈이 드는 요청은 보내지 않습니다 |
| Backend | `GET https://api.drawtale.kr/health` |
| AI 서버 | VM 안에서 `GET /internal/v1/health` — 모델이 올라왔는지까지 (배포 스크립트가 기다렸다 확인) |
| 순서 | `ai` 는 `torchserve` 가, `backend` 는 `db` 가 **건강해진 뒤에** 뜹니다 (`depends_on`) |

**실제로 해 본 것 (11-02):** 그림 분석 4.5초 · 이야기 한 편(음성 · 영상 포함) 30초, API 로 끝까지 성공.
**브라우저에서 카카오 · 구글 로그인은 아직 확인하지 않았습니다.**

**기록(로그)은** `docker compose logs` 로 봅니다. 따로 모으지 않아 컨테이너를 지우면 사라집니다.

## 8. 백업

| 무엇 | 어떻게 |
|---|---|
| DB | VM cron 이 **매일 03:00(한국)** `pg_dump` → `~/backups` 에 **7일치** (`deploy/backup.sh`) |
| 그림 · 영상 파일 | **백업하지 않습니다** |

> **백업이 같은 VM 디스크에 있습니다.** 잘못된 마이그레이션 · 실수로 지운 자료는 되살리지만,
> VM 이나 디스크가 사라지면 함께 사라집니다.

---

## 9. 지금 아픈 곳

| 무엇 | 내용 |
|---|---|
| **크레딧이 끝나면 멈춘다** | 학생 크레딧만으로 돕니다. 24시간이면 약 35일. 상시 운영하려면 저가 VPS 로 옮기는 것을 다시 봐야 합니다 |
| **백업이 같은 디스크** | VM 이 사라지면 DB 백업도 없습니다. 파일은 백업이 없습니다 |
| **동시 사용을 재지 않았다** | 2코어에서 렌더가 몇 개까지 버티는지 모릅니다 ([02 9장](02-system-architecture.md)) |
| 기록을 모으지 않는다 | 컨테이너를 지우면 로그가 없어집니다 |
| SSH 가 모든 IP 에 열려 있다 | 키로만 들어옵니다. 자동 배포 때문에 IP 로 막지 못합니다 |
| 공용 개발 DB 가 없다 | 구독 만료. 각자 로컬 DB 를 씁니다 |

## 10. 아직 정하지 않은 것

| 무엇 | 지금 |
|---|---|
| 크레딧 뒤 | VPS 로 옮길지 · 언제 |
| 백업을 바깥에 | Blob 등 다른 곳에 둘지 |
| 멈췄을 때 | 대응 절차가 없습니다 ([01](01-requirements.md)) |
| 외부 비용이 한도를 넘으면 | 하루 이야기 한도는 넣었다(백엔드 d0bcdb5). 업체 쪽 한도는 각 콘솔에서 따로 |
