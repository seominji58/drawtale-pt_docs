# 03. 플로우차트

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.1 (초안) |
| 기준일 | 2026-09-30 |
| 근거 | 화면 설계서 v0.3, 백엔드 `services/jobs.py` · `story_writer.py`, AI `runtime/ai_server`, 프론트 `src/api/index.ts` |

![DrawTale 플로우차트 한 장](assets/flowchart/flowchart.png)

위 그림은 전체 흐름을 한 장으로 줄인 것이다 (`tools/poster/flowchart.html`). 가로는 여정 6단계, 세로는 누가 하는지(아이 · 어른 / 화면 / 서버 / AI)다. 자세한 분기는 아래 Mermaid 흐름도 10개에 그대로 있다.

사용자가 화면을 지나는 순서와, 그 뒤에서 서버가 처리하는 순서를 그린다. 그림은 Mermaid로 되어 있어 GitHub에서 바로 보인다.

| 번호 | 흐름 | 관점 |
|---|---|---|
| 1 | 전체 사용자 흐름 | 화면 |
| 2 | 처음 실행 · 로그인 | 화면 + 서버 |
| 3 | 그림 입력 | 화면 |
| 4 | 캐릭터 분석 | 서버 |
| 5 | 캐릭터 확인 · 관절 보정 | 화면 + 서버 |
| 6 | 이야기 만들기 (네 칸 + 말로 덧붙이기) | 화면 |
| 7 | 이야기 생성 | 서버 |
| 8 | 이야기 보기 · 순서 맞추기 | 화면 |
| 9 | 오류 처리 | 화면 + 서버 |
| 10 | Job 상태 | 서버 |

기호: 사각형은 화면이나 처리, 마름모는 판단, 점선 화살표는 조건부 또는 드문 길이다.

---

## 1. 전체 사용자 흐름

```mermaid
flowchart TD
    A([앱 열기]) --> F{처음 실행?}
    F -->|예| S14[S-14 처음 실행]
    F -->|아니오| S01
    S14 -->|바로 시작하기| S01
    S14 -->|로그인 · 회원가입| AUTH[S-15 · S-16] --> S01

    S01[S-01 시작] --> T{비회원이고<br/>체험을 다 썼나?}
    T -->|예| S14
    T -->|아니오| S02[S-02 그림 안내]
    S01 -->|내 이야기| S12[S-12 내 이야기] --> S09
    S01 -.->|3초 길게| S13[S-13 어른 설정]

    S02 --> S03[S-03 그림 올리기]
    S03 --> S04[S-04 캐릭터 만드는 중]
    S04 --> S05[S-05 캐릭터 확인]
    S05 -.->|어른에게 도움 받기| S06[S-06 관절 맞추기] -.-> S05
    S05 --> S07[S-07 이야기 만들기]
    S07 --> S08[S-08 이야기 만드는 중]
    S08 --> S09[S-09 이야기 보기]
    S09 --> S10[S-10 순서 맞추기]
    S10 --> S11[S-11 다 했어요]
    S11 -->|새 이야기 만들기<br/>같은 캐릭터| S07
    S11 -->|처음으로| S01
    S11 -->|다시 보기| S09

    S04 -.->|실패| E[E-01 오류]
    S08 -.->|실패| E
```

**그림 → 친구 → 이야기 → 놀이.** 아이는 네 구간을 지난다 (C-03 진행 표시). 어른은 처음 실행(S-14), 관절 보정(S-06), 설정(S-13)에서만 들어온다.

---

## 2. 처음 실행 · 로그인

```mermaid
flowchart TD
    S14[S-14 처음 실행] --> Q{체험이 남았나?}
    Q -->|예| G[바로 시작하기<br/>비회원 표시를 sessionStorage 에] --> S01([S-01])
    Q -->|아니오| S15
    S14 -->|로그인| S15[S-15 로그인]
    S14 -->|회원가입| S16

    S15 -->|카카오 · 구글| P[제공자 로그인 화면]
    P -->|취소| S15
    P -->|인가 코드 + state| C[S-15C 돌아오기]
    C --> ST{state 가 맞나?}
    ST -->|아니오| CF[로그인을 마치지 못했습니다] --> S15
    ST -->|예| BE[[POST /api/v1/auth/provider<br/>code, redirect_uri, agreed]]
    BE --> R{백엔드 응답}
    R -->|200 token| OK[토큰을 localStorage 에] --> S01
    R -->|409 SIGNUP_REQUIRED<br/>처음 온 사람| S16[S-16 회원가입]
    R -->|그 밖| CF

    S16 --> AG{약관에 동의했나?}
    AG -->|아니오| S16
    AG -->|예, 소셜로 가입| P2[제공자 로그인 화면] --> C2[S-15C] --> BE2[[agreed: true 로 다시 로그인<br/>계정 생성]] --> OK
```

백엔드 안에서는 이렇게 처리한다.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend
    participant P as 카카오 · 구글
    FE->>BE: POST /api/v1/auth/{provider} {code, redirect_uri, agreed}
    BE->>P: code + client_secret → 토큰
    BE->>P: 회원 정보 조회 (회원번호만)
    alt 처음 보는 회원번호 + agreed=false
        BE-->>FE: 409 SIGNUP_REQUIRED
    else 기존 회원 또는 agreed=true
        BE->>BE: 사용자 · 소셜 계정 저장, 토큰 발급 (SHA-256 해시만 저장, 30일)
        BE-->>FE: 200 {token, account}
    end
```

---

## 3. 그림 입력

```mermaid
flowchart TD
    S03[S-03 그림 올리기] --> H{어떻게?}
    H -->|그림 찍기| CAM[카메라]
    H -->|앨범에서 고르기| ALB[파일 선택]
    H -->|화면에 그리기| D0

    CAM --> V
    ALB --> V{이미지이고<br/>10MB 이하인가?}
    V -->|아니오| S03
    V -->|예| SH[긴 변 1600px<br/>JPEG 0.85 로 줄이기] --> PV

    subgraph S03D[S-03D 화면에 그리기]
        D0[머리] --> D1[몸] --> D2[팔] --> D3[다리]
        D3 --> CK{모든 부위가<br/>몸에 붙어 있나?}
        CK -->|아니오| WARN[떨어진 부위 안내<br/>고치러 가기] --> D2
        CK -->|예| PNG[흰 바탕 PNG]
    end
    PNG --> PV

    PV[미리보기] --> PK{이 그림으로?}
    PK -->|다시 고르기| S03
    PK -->|이 그림으로| S04([S-04 분석])
```

- 화면에 그리기는 단계마다 **손으로 그리기** 또는 **도장 찍기**를 고른다 (Level 1은 도장이 기본). 단계 칸을 눌러 언제든 앞 부위로 돌아간다
- 떨어진 조각을 검사하는 이유: AI는 가장 큰 덩어리 하나만 캐릭터로 쓴다. 떨어진 머리·팔은 캐릭터에서 빠진다

---

## 4. 캐릭터 분석

사용자가 올린 그림이 관절이 있는 캐릭터가 되기까지.

```mermaid
flowchart LR
    IN[/그림/] --> UP[Backend<br/>파일 저장<br/>Character · Job 생성]
    UP --> BG[[백그라운드 Job]]
    BG --> AN[AI 서버<br/>POST /internal/v1/analyze]
    subgraph AIR[AI Runtime]
        AN --> RS[최대 1000px 로 줄이기]
        RS --> DET[캐릭터 검출<br/>TorchServe<br/>drawn_humanoid_detector]
        DET --> Q{찾았나?}
        Q -->|아니오| NO[NO_CHARACTER_DETECTED]
        Q -->|예| CROP[검출 상자로 자르기]
        CROP --> POSE[관절 추정<br/>drawn_humanoid_pose_estimator]
        CROP --> MASK[마스크<br/>이진화 · 닫힘 · flood fill]
        POSE --> J15[관절 15개<br/>원본 픽셀 좌표로 변환]
        MASK --> SES[(세션 폴더<br/>원본 · 마스크 · 분석 JSON)]
        J15 --> SES
    end
    J15 --> SAVE[Backend<br/>bbox · 관절 · request_id 저장<br/>Job succeeded]
    NO --> FAIL[Backend<br/>Job failed]
```

```mermaid
sequenceDiagram
    autonumber
    participant FE as Frontend (S-04)
    participant BE as Backend
    participant AI as AI 서버
    FE->>BE: POST /api/v1/characters (image)
    BE-->>FE: 202 {character_id, job_id, status: pending}
    BE->>AI: POST /internal/v1/analyze (file)
    loop 1.5초마다, 최대 30초
        FE->>BE: GET /api/v1/jobs/{job_id}
        BE-->>FE: pending / running / succeeded / failed
    end
    AI-->>BE: {success, bbox, joints[15], request_id, …}
    FE->>BE: GET /api/v1/characters/{character_id}
    BE-->>FE: 이미지 크기, 관절 15개
    Note over FE: 원본 픽셀 → 0~1 로 바꿔 S-05 에서 그린다
```

- AI의 실패는 HTTP 200 + `"success": false` + `"message": "CODE: 설명"`으로 온다. 백엔드가 `CODE`를 읽어 Job 오류 코드로 바꾼다
- 분석 세션(`request_id`)은 이야기를 만들 때 렌더에 다시 쓴다

---

## 5. 캐릭터 확인 · 관절 보정

```mermaid
flowchart TD
    S05[S-05 캐릭터 확인<br/>브라우저 미리보기] --> OK{잘 움직이나?}
    OK -->|이 친구로 할래요| S07([S-07])
    OK -->|다시 찍기| S03([S-03])
    OK -->|어른에게 도움 받기| S06[S-06 관절 맞추기 · 어른]

    S06 --> DRAG[관절점 끌어 옮기기<br/>옮긴 관절에 「옮김」]
    DRAG --> PRE{움직여 보기}
    PRE --> DRAG
    DRAG --> DONE{다 했어요}
    DONE --> MV{옮긴 관절이 있나?}
    MV -->|없음| S05
    MV -->|있음| PATCH[[PATCH /api/v1/characters/id/joints<br/>15개 전부, 원본 픽셀]]
    PATCH -->|200| S05
    PATCH -->|실패| ERR[저장하지 못했습니다<br/>다시 누르기] --> DONE
    S06 -->|되돌리기| DROP[저장 안 한 보정 버리기] --> S05
```

- 서버는 보정을 이력으로 쌓고, 렌더에는 **가장 최근 보정**을 쓴다. 보정이 없으면 AI 관절을 쓴다
- 되돌리기가 보정을 버리는 이유: 서버 렌더는 저장된 관절만 쓴다. 화면에만 남은 보정은 이야기에 반영되지 않는다

---

## 6. 이야기 만들기 (S-07)

```mermaid
flowchart TD
    START([S-05 에서 확정]) --> K[다음 빈 칸<br/>장소 → 문제 → 행동 → 결과]
    K --> Q[질문 읽기<br/>Level 1·2 자동, Level 3 은 버튼으로]
    Q --> C[카드 고르기<br/>Level 1: 2장 · Level 2: 4장 · Level 3: 6장]
    C --> L1{Level 1?}
    L1 -->|예| CF{이걸로 할까요?}
    CF -->|다시| C
    CF -->|예| V
    L1 -->|아니오| V{말로 덧붙이기가 켜져 있고<br/>문제 · 행동 · 결과 칸인가?}
    V -->|아니오| NX
    V -->|예| ASK[더 말해 볼래요?<br/>안 해도 돼요]
    ASK -->|누르고 말하기| STT[브라우저 음성 인식<br/>50자까지]
    STT -->|들었다| SAY[그 말이 들어간 문장을 읽어 줌]
    STT -->|못 들었다 · 마이크 거부| HINT[아이 말로 안내] --> ASK
    SAY --> ASK
    ASK -->|카드 다시 고르기| C
    ASK -->|다음| NX{네 칸이 다 찼나?}
    NX -->|아니오| K
    NX -->|예| S08([S-08 이야기 만드는 중])

    K -.->|되돌리기로 앞 칸을 바꾸면| RESET[뒤 칸 선택 초기화]
```

- 인물은 S-05에서 이미 정해졌으므로 고르는 칸에 없다
- 서버에는 칸마다 **카드 라벨**을, 말로 덧붙인 칸은 **아이 말**을 보낸다 (각 50자)

---

## 7. 이야기 생성 (서버)

`POST /api/v1/stories`가 만든 Job 하나 안에서 일어나는 일이다.

```mermaid
flowchart TD
    IN[/네 칸<br/>place · problem · action · result/] --> JOB[[story Job 시작<br/>status: running]]

    JOB --> KEY{OPENAI_API_KEY 가 있나?}
    KEY -->|없음| TPL[틀 문장<br/>오늘 나는 …에 갔어요. 그런데 ….]
    KEY -->|있음| M1{입력 검열<br/>omni-moderation}
    M1 -->|걸림| BLK[CONTENT_BLOCKED<br/>Job failed]
    M1 -->|통과| GPT[gpt-4o-mini<br/>네 문장 · 15~25자 · 쉬운 낱말<br/>주인공 나 · ~어요 · 슬픈 결말 금지]
    GPT -->|실패 · 빈 응답| TPL
    GPT --> M2{결과 검열}
    M2 -->|걸림| BLK
    M2 -->|통과| TEXT[text]
    TPL --> TEXT

    TEXT --> TTS{음성 합성<br/>TTS_PROVIDER}
    TTS -->|성공| MP3[(results/id.mp3)]
    TTS -->|키 없음 · 실패| NOA[audio 없음<br/>이야기는 계속]

    MP3 --> MOT
    NOA --> MOT[행동 문구로 동작 고르기<br/>달려·뛰·점프·춤·운동 → jumping_gentle<br/>그 밖 → wave_hello_gentle]
    MOT --> SID{AI 분석 세션이 있나?}
    SID -->|없음 · 목 AI| IMG[애니메이션 자리에 원본 그림]
    SID -->|있음| RND[[AI 서버 render<br/>request_id · 최근 관절 · 동작]]
    RND -->|UNKNOWN_MOTION| BASE[원래 동작으로 다시 렌더<br/>wave_hello · jumping] --> MP4
    RND -->|성공 약 35~40초| MP4[(results/id.mp4)]
    RND -->|그 밖 실패| FAIL[Job failed<br/>AI 오류 코드]

    MP4 --> DONE[[Job succeeded]]
    IMG --> DONE
```

AI 서버 안의 렌더는 이렇게 흐른다.

```mermaid
flowchart LR
    R[/request_id · 관절 15개 · 동작/] --> S[(세션에서<br/>원본 · 마스크)]
    S --> CFG[캐릭터 설정 만들기<br/>관절 → 뼈대]
    CFG --> FIT[관절이 캐릭터 영역 밖이면<br/>안으로 맞추기]
    FIT --> AD[Meta Animated Drawings<br/>동작 BVH 를 뼈대에 입혀 렌더]
    AD --> GIF[GIF] --> FF[ffmpeg<br/>H.264 MP4] --> OUT[/MP4 본문<br/>X-Processing-Time-Ms/]
```

**실패해도 이야기를 돌려주는 곳과 돌려주지 않는 곳**

| 실패 | 처리 |
|---|---|
| 문장 생성 실패, 키 없음 | 틀 문장으로 계속 |
| 음성 합성 실패, 키 없음 | 음성 없이 계속 (화면은 브라우저 음성으로 읽는다) |
| AI가 순화 동작을 모름 | 원래 동작으로 다시 렌더 |
| AI 세션 없음, 목 AI | 원본 그림으로 계속 |
| **검열에 걸림** | **멈춘다.** 아이에게 다시 고르게 한다 |
| 렌더의 그 밖 실패 | 멈춘다. `ENGINE_ERROR` |

---

## 8. 이야기 보기 · 순서 맞추기

```mermaid
flowchart TD
    S09[S-09 이야기 보기<br/>MP4 반복 · 문장 블록] --> P{들려주기}
    P --> AU{audio_url 이 있나?}
    AU -->|있음| FILE[음성 파일 재생]
    AU -->|없음| TTS[브라우저 음성<br/>한 문장씩 읽으며 짚기]
    FILE --> S09
    TTS --> S09
    S09 -->|순서 맞추기| S10

    S10[S-10 순서 맞추기<br/>문장 카드를 섞어 놓기] --> PICK[카드 고르기<br/>그 문장을 읽어 줌]
    PICK --> SLOT[빈 자리 고르기]
    SLOT --> FULL{다 찼나?}
    FULL -->|아니오| PICK
    FULL -->|예, 다 했어요| JUDGE{순서가 맞나?}
    JUDGE -->|아니오| BACK[카드가 원위치로<br/>부정 표현 없음] --> PICK
    JUDGE -->|예| S11[S-11 다 했어요]
    S11 --> GN{비회원이고<br/>안내를 아직 안 했나?}
    GN -->|예| NOTE[로그인 안내 한 번]
```

- 조작은 **탭 두 번**이 기본이다. 채워진 자리를 누르면 카드가 위로 돌아간다
- Level 1은 카드 2장

---

## 9. 오류 처리

```mermaid
flowchart LR
    subgraph SRC[어디서 나나]
        A1[AI analyze<br/>NO_CHARACTER_DETECTED<br/>INVALID_IMAGE · MODEL_UNAVAILABLE]
        A2[Backend<br/>FILE_TOO_LARGE · AI_TIMEOUT<br/>CONTENT_BLOCKED · INTERNAL_ERROR]
        A3[Frontend<br/>대기 시간 초과]
    end

    A1 --> MAP{프론트<br/>ERROR_MAP}
    A2 --> MAP
    A3 --> MAP

    MAP -->|NO_CHARACTER_DETECTED| E1[NO_CHARACTER<br/>그림에서 친구를 못 찾았어요]
    MAP -->|INVALID_IMAGE · FILE_TOO_LARGE| E2[UNSUPPORTED_IMAGE<br/>이 그림은 열 수 없어요]
    MAP -->|AI_TIMEOUT · 시간 초과| E3[ENGINE_TIMEOUT<br/>시간이 오래 걸리고 있어요]
    MAP -->|CONTENT_BLOCKED| E4[CONTENT_BLOCKED<br/>이 이야기는 만들 수 없어요]
    MAP -->|그 밖 전부| E5[ENGINE_ERROR<br/>잠깐 문제가 생겼어요]

    E1 --> U[S-03 다시 찍기]
    E2 --> U
    E3 --> U
    E4 --> ST[덧붙인 말 지우고<br/>S-07 다시 고르기]
    E5 --> H[S-01 처음으로]
```

- 모든 E-01에는 2차 행동 「처음으로」가 있다
- 서버의 `message`(어른용 한국어 문장)는 아이 화면에 띄우지 않는다
- 오류가 아닌 부분 실패(음성 없음, 애니메이션 대신 그림)는 E-01로 가지 않는다 (7장)
- S-03의 형식·용량 검사, S-06의 저장 실패, S-07의 음성 인식 실패는 E-01로 가지 않고 그 화면에서 안내한다

---

## 10. Job 상태

분석과 이야기 생성은 같은 Job 모양을 쓴다 (`type`: `analyze` · `story`).

```mermaid
stateDiagram-v2
    [*] --> pending: POST (202 + job_id)
    pending --> running: 백그라운드 시작
    running --> succeeded: 결과 저장
    running --> failed: error.code · error.message
    succeeded --> [*]: 프론트가 결과 조회
    failed --> [*]: 프론트가 E-01
```

| 상태 | 프론트 처리 | 대기 점 |
|---|---|---|
| `pending` | 1.5초 뒤 다시 묻는다 | ●○○ |
| `running` | 1.5초 뒤 다시 묻는다 | ●●○ |
| `succeeded` | 묻기를 멈추고 결과를 조회한다 | ●●● |
| `failed` | 묻기를 멈추고 `error.code`로 E-01 | — |

- 프론트 대기 한도: 분석 30초, 이야기 300초. 넘으면 `ENGINE_TIMEOUT`
- 「그만하기」는 3초 뒤에 나타나고, 누르면 묻기를 멈춘다. 서버의 Job은 계속 돈다
- Job은 백엔드 프로세스 안(`BackgroundTasks`)에서 돈다. 백엔드를 다시 켜면 진행 중인 Job은 끝나지 않는다 ([01. 시스템 아키텍처](01-system-architecture.md) 8장)
