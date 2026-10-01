"""시스템 아키텍처 한 장 그림 (01-system-architecture.md, 발표 자료용).

    python tools/make_architecture.py      # assets/architecture/system-architecture.png

내용은 2026-09-30 코드 기준이다 (프론트 feat/backend-contract · 백엔드 dev · AI feat/gentle-motions).
구조가 바뀌면 아래 표의 글자를 고치고 다시 만든다.
"""

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "architecture"

S = 2
W, H = 1600, 1080

INK, SOFT, FAINT, WHITE = "#262B40", "#5B6177", "#8A90A3", "#FFFFFF"
ZONE = {  # 테두리, 바탕, 제목 글자
    "client": ("#3FAE8A", "#EEF8F4", "#1F7A5E"),
    "net": ("#E0A33B", "#FFF7E8", "#9A6410"),
    "server": ("#4256C8", "#F2F4FD", "#2E3FA3"),
    "ai": ("#8E6BD8", "#F6F2FD", "#5E3DB0"),
    "db": ("#3C8DD9", "#EEF5FC", "#1F5F9E"),
    "plain": ("#C9CDD6", "#FAFAFB", INK),
    "flow": ("#E0A33B", "#FFF8EC", "#9A6410"),
}
STAGE = ["#7FB2F0", "#F4909F", "#74CDAE", "#F5C46B"]

FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/usr/share/fonts/truetype/nanum"), Path("/Library/Fonts")]
FONT_FILES = {False: ["malgun.ttf", "NanumGothic.ttf"], True: ["malgunbd.ttf", "NanumGothicBold.ttf"]}


@lru_cache(maxsize=None)
def font(size, bold=False):
    for d in FONT_DIRS:
        for f in FONT_FILES[bold]:
            if (d / f).exists():
                return ImageFont.truetype(str(d / f), int(size * S))
    raise SystemExit("한글 글꼴을 찾지 못했습니다")


img = Image.new("RGB", (W * S, H * S), WHITE)
d = ImageDraw.Draw(img)
P = lambda x, y: (x * S, y * S)
B = lambda x, y, w, h: [x * S, y * S, (x + w) * S, (y + h) * S]


def tw(s, size, bold=False):
    return d.textlength(s, font=font(size, bold)) / S


def text(x, y, s, size=11.5, bold=False, color=INK, anchor="la"):
    d.text(P(x, y), s, font=font(size, bold), fill=color, anchor=anchor)


def wrap(s, size, bold, width):
    out, cur = [], ""
    for word in s.split(" "):
        t = f"{cur} {word}".strip()
        if tw(t, size, bold) <= width:
            cur = t
            continue
        if cur:
            out.append(cur)
        cur = word
    if cur:
        out.append(cur)
    return out


def para(x, y, s, size=11.5, bold=False, color=INK, width=200, lh=1.45):
    for i, ln in enumerate(wrap(s, size, bold, width)):
        text(x, y + i * size * lh, ln, size, bold, color)
    return y + len(wrap(s, size, bold, width)) * size * lh


def dashes(x1, y1, x2, y2, color, width=2, on=7, off=5):
    import math
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L
    p = 0.0
    while p < L:
        q = min(p + on, L)
        d.line([P(x1 + ux * p, y1 + uy * p), P(x1 + ux * q, y1 + uy * q)], fill=color, width=width * S)
        p += on + off


def zone(x, y, w, h, kind, title):
    line, fill, tc = ZONE[kind]
    r = 14
    d.rounded_rectangle(B(x, y, w, h), radius=r * S, fill=fill)
    for (a, b, c, e) in ((x + r, y, x + w - r, y), (x + r, y + h, x + w - r, y + h),
                         (x, y + r, x, y + h - r), (x + w, y + r, x + w, y + h - r)):
        dashes(a, b, c, e, line)
    for (cx, cy, a0) in ((x, y, 180), (x + w - 2 * r, y, 270), (x + w - 2 * r, y + h - 2 * r, 0), (x, y + h - 2 * r, 90)):
        d.arc(B(cx, cy, 2 * r, 2 * r), a0, a0 + 90, fill=line, width=2 * S)
    text(x + 14, y + 12, title, 15, True, tc)


def box(x, y, w, h, kind, title=None, fill=WHITE):
    line, _, tc = ZONE[kind]
    d.rounded_rectangle(B(x, y, w, h), radius=8 * S, fill=fill, outline=line, width=int(1.5 * S))
    if title:
        text(x + 10, y + 8, title, 12.5, True, tc)


def bar(x, y, w, h, kind, s, size=11.5):
    line, fill, tc = ZONE[kind]
    d.rounded_rectangle(B(x, y, w, h), radius=7 * S, fill=blend(line, 0.16))
    text(x + 10, y + h / 2, s, size, True, tc, anchor="lm")


def blend(hexcolor, a):
    c = tuple(int(hexcolor[i:i + 2], 16) for i in (1, 3, 5))
    return tuple(int(255 + (v - 255) * a) for v in c)


def items(x, y, rows, width, size=11, color=INK, bullet="•", bc=None, lh=1.55):
    for r in rows:
        main, sub = (r if isinstance(r, tuple) else (r, None))
        text(x, y, bullet, size, False, bc or color)
        yy = para(x + 11, y, main, size, False, color, width - 11, lh)
        if sub:
            yy = para(x + 11, yy - size * 0.25, sub, size - 1.5, False, FAINT, width - 11, 1.35)
        y = yy + 2
    return y


def kv(x, y, rows, kw, width, size=11, kc=None, lh=1.75):
    for k, v in rows:
        text(x, y, k, size, True, kc or INK)
        para(x + kw, y, v, size, False, SOFT, width - kw, 1.35)
        y += size * lh + (size * 1.35 if tw(v, size) > width - kw else 0)
    return y


def arrow(x1, y1, x2, y2, color, dashed=False, label=None, ly=None):
    if dashed:
        dashes(x1, y1, x2, y2, color, 2)
    else:
        d.line([P(x1, y1), P(x2, y2)], fill=color, width=2 * S)
    hd = 8
    if x2 != x1:
        sgn = 1 if x2 > x1 else -1
        d.polygon([P(x2, y2), P(x2 - sgn * hd, y2 - 5), P(x2 - sgn * hd, y2 + 5)], fill=color)
    else:
        sgn = 1 if y2 > y1 else -1
        d.polygon([P(x2, y2), P(x2 - 5, y2 - sgn * hd), P(x2 + 5, y2 - sgn * hd)], fill=color)
    if label:
        text((x1 + x2) / 2, ly if ly is not None else y1 - 14, label, 10.5, False, SOFT, anchor="mm")


# ─────────────── 위 줄 ───────────────
CX, CW_ = 18, 236
NX, NW = 318, 168
SX, SW = 550, 584
AX, AW = 1196, 386
TOPY, TOPH = 18, 552

# 클라이언트
zone(CX, TOPY, CW_, TOPH, "client", "클라이언트 (Web App)")
dx, dy, dw, dh = CX + 18, TOPY + 44, CW_ - 36, 150
d.rounded_rectangle(B(dx, dy, dw, dh), radius=14 * S, fill="#2F3441")
sx0, sy0, sw0, sh0 = dx + 9, dy + 9, dw - 18, dh - 18
d.rounded_rectangle(B(sx0, sy0, sw0, sh0), radius=6 * S, fill="#F3F4F7")
labels = [("S-03", "그림 올리기 · 그리기"), ("S-06", "관절 맞추기 (어른)"), ("S-07", "이야기 만들기"), ("S-09", "이야기 보기")]
tw2, th2 = (sw0 - 6) / 2, (sh0 - 6) / 2
for i, (sid, nm) in enumerate(labels):
    tx, ty = sx0 + (i % 2) * (tw2 + 6), sy0 + (i // 2) * (th2 + 6)
    d.rounded_rectangle(B(tx, ty, tw2, th2), radius=5 * S, fill=STAGE[i])
    text(tx + 7, ty + 8, sid, 10, True, WHITE)
    para(tx + 7, ty + 24, nm, 10, False, WHITE, tw2 - 12, 1.3)
text(CX + CW_ / 2, dy + dh + 10, "태블릿 · PC 브라우저 (가로 1024×768 기준)", 10.5, False, FAINT, anchor="ma")
bar(CX + 14, dy + dh + 32, CW_ - 28, 26, "client", "React 18 · TypeScript · Vite", 11.5)
bar(CX + 14, dy + dh + 62, CW_ - 28, 26, "client", "zustand · Canvas 2D (라이브러리 최소)", 11)
y = dy + dh + 104
text(CX + 14, y, "주요 기능", 13, True, ZONE["client"][2])
items(CX + 16, y + 24, [
    "그림 찍기 · 앨범 · 화면에 그리기",
    "캐릭터 움직임 미리보기 (브라우저)",
    "관절 보정 화면 (어른)",
    "네 칸 고르기 + 말로 덧붙이기",
    "Job 상태 묻기 (1.5초)",
    "MP4 · 음성 재생, 문장 짚기",
    "지원 수준 1·2·3, 소셜 로그인",
], CW_ - 30, 11, INK, bc=ZONE["client"][0], lh=1.5)
box(CX + 14, TOPY + TOPH - 64, CW_ - 28, 50, "client")
text(CX + 24, TOPY + TOPH - 56, "브라우저 내장 Web Speech API", 11, True, ZONE["client"][2])
text(CX + 24, TOPY + TOPH - 36, "말로 덧붙이기(STT) · 질문 읽기(TTS)", 10.5, False, SOFT)

# 배포 · 네트워크
zone(NX, TOPY, NW, TOPH, "net", "배포 · 네트워크")
box(NX + 12, TOPY + 44, NW - 24, 92, "net", "지금 (로컬)")
para(NX + 22, TOPY + 68, "Vite 개발 서버 :5173 → 프록시 /api/v1 → :8000", 10.5, False, SOFT, NW - 44)
box(NX + 12, TOPY + 148, NW - 24, 116, "net", "목표 (Azure, 배포 전)")
para(NX + 22, TOPY + 172, "Static Web Apps (프론트) · VM 1대에 Backend + AI 컨테이너", 10.5, False, SOFT, NW - 44)
text(NX + 14, TOPY + 286, "역할", 13, True, ZONE["net"][2])
items(NX + 16, TOPY + 310, ["HTTPS (TLS)", "CORS 허용 목록", "/files 정적 파일 (그림 · mp3 · mp4)", "AI 서버는 외부 비공개", "API 키는 서버 환경변수에만"],
      NW - 30, 11, INK, bc=ZONE["net"][0], lh=1.5)

# 서버
zone(SX, TOPY, SW, TOPH, "server", "서버 Backend (FastAPI + Uvicorn + Python 3.11)")
bar(SX + 14, TOPY + 42, SW - 28, 30, "server", "Uvicorn (ASGI)  |  Port 8000  |  BackgroundTasks Job  |  Swagger /docs  |  /files", 11.5)
hw = (SW - 28 - 12) / 2
box(SX + 14, TOPY + 84, hw, 196, "server", "Router  /api/v1")
items(SX + 24, TOPY + 110, [
    ("POST /characters", "그림 업로드 → 분석 Job"),
    ("GET /jobs/{id}", "진행 상태 (polling)"),
    ("GET · PATCH /characters/{id}", "관절 조회 · 보정 저장"),
    ("POST · GET /stories", "이야기 생성 · 결과"),
    ("POST /auth/{provider}", "카카오 · 구글 로그인"),
], hw - 20, 11, INK, bc=ZONE["server"][0], lh=1.4)
box(SX + 26 + hw, TOPY + 84, hw, 196, "server", "Service Layer")
items(SX + 36 + hw, TOPY + 110, [
    ("jobs", "analyze · story Job 실행"),
    ("story_writer", "네 문장 생성 · 검열"),
    ("tts", "OpenAI · ElevenLabs 선택"),
    ("ai_client", "AI 호출 · 오류 코드 변환"),
    ("social · storage", "회원번호만 · local → Blob"),
], hw - 20, 11, INK, bc=ZONE["server"][0], lh=1.4)
box(SX + 14, TOPY + 292, SW - 28, 168, "server", "External API Layer")
bw = (SW - 28 - 30) / 2
box(SX + 24, TOPY + 318, bw, 132, "server", "OpenAI · OAuth", fill="#FBFCFF")
items(SX + 34, TOPY + 342, ["gpt-4o-mini — 네 칸 → 네 문장", "omni-moderation — 입력 · 결과 검열", "gpt-4o-mini-tts / ElevenLabs — 낭독", "카카오 · 구글 — 회원번호만"],
      bw - 20, 10.5, INK, bc=ZONE["server"][0], lh=1.45)
box(SX + 34 + bw, TOPY + 318, bw, 132, "server", "외부가 실패하면", fill="#FBFCFF")
items(SX + 44 + bw, TOPY + 342, ["키 없음 · 실패 → 틀 문장", "음성 실패 → 브라우저 음성", "순화 동작 모름 → 원래 동작", "검열에 걸림 → 만들지 않음"],
      bw - 20, 10.5, INK, bc=ZONE["server"][0], lh=1.45)
box(SX + 14, TOPY + 472, SW - 28, 66, "server", "Data Access Layer")
text(SX + 24, TOPY + 500, "SQLAlchemy 2.1 ORM  |  Alembic 마이그레이션  |  psycopg 3  |  Job 마다 세션", 11, False, SOFT)

# AI Runtime
zone(AX, TOPY, AW, TOPH, "ai", "AI Runtime (내부 전용 · Docker)")
box(AX + 12, TOPY + 42, AW - 24, 108, "ai", "AI 서버  FastAPI :8001")
items(AX + 22, TOPY + 68, [("POST /internal/v1/analyze", "검출 · 관절 15개 · 마스크, request_id"),
                           ("POST /internal/v1/render", "관절 + 동작 → MP4"),
                           ("DELETE /sessions/{id} · GET /health", None)], AW - 44, 11, INK, bc=ZONE["ai"][0], lh=1.35)
box(AX + 12, TOPY + 162, AW - 24, 100, "ai", "TorchServe :8080  (Meta 사전학습, 학습 없이 사용)")
items(AX + 22, TOPY + 188, ["drawn_humanoid_detector — 캐릭터 찾기", "drawn_humanoid_pose_estimator — 관절 찾기"], AW - 44, 11, INK, bc=ZONE["ai"][0])
bar(AX + 22, TOPY + 228, AW - 44, 24, "ai", "관절 15개 → 원본 그림 픽셀 좌표 JSON", 10.5)
box(AX + 12, TOPY + 274, AW - 24, 160, "ai", "분석 · 렌더 파이프라인")
kv(AX + 22, TOPY + 300, [
    ("분석", "1000px 축소 → 검출 → 자르기 → 관절 → 원본 좌표"),
    ("마스크", "적응형 이진화 · 닫힘 · flood fill, 가장 큰 덩어리"),
    ("렌더", "Animated Drawings + BVH → GIF → ffmpeg MP4"),
    ("동작", "wave_hello_gentle · jumping_gentle (순화)"),
    ("시간", "분석 3~5초 · 렌더 35~40초"),
], 48, AW - 44, 10.5, ZONE["ai"][2], lh=1.95)
box(AX + 12, TOPY + 446, AW - 24, 92, "ai", "세션 · 모델 교체 지점")
items(AX + 22, TOPY + 472, ["request_id 폴더 — 원본 · 마스크 · analysis.json", "A2 손그림 포즈 모델 (RTMPose 계열) — 더 나을 때만 교체"],
      AW - 44, 10.5, INK, bc=ZONE["ai"][0], lh=1.45)

# 위 줄 화살표
c_net, c_srv, c_ai = ZONE["client"][0], ZONE["net"][0], ZONE["ai"][0]
arrow(CX + CW_, 262, NX, 262, c_net, label="HTTPS", ly=248)
arrow(NX, 300, CX + CW_, 300, "#9AA0AE", dashed=True, label="JSON", ly=314)
arrow(NX + NW, 262, SX, 262, c_srv, label="HTTP", ly=248)
arrow(SX, 300, NX + NW, 300, "#9AA0AE", dashed=True, label="응답", ly=314)
arrow(SX + SW, 262, AX, 262, c_ai, label="내부", ly=248)
arrow(AX, 300, SX + SW, 300, "#9AA0AE", dashed=True, label="결과", ly=314)

# ─────────────── 아래 줄 ───────────────
BY = 588
BH = H - 18 - BY
zone(CX, BY, CW_, 222, "plain", "연결 방식")
leg = [(ZONE["client"][0], False, "HTTPS (브라우저 ↔ 서버)"), (ZONE["net"][0], False, "HTTP (게이트웨이 ↔ 서버)"),
       (ZONE["ai"][0], False, "내부 HTTP (서버 ↔ AI)"), (ZONE["db"][0], False, "SQLAlchemy (서버 ↔ DB)"),
       (ZONE["server"][0], False, "HTTPS (서버 ↔ 외부 API)"), ("#9AA0AE", True, "응답 흐름 (점선)")]
for i, (col, dsh, lbl) in enumerate(leg):
    yy = BY + 50 + i * 27
    arrow(CX + 16, yy, CX + 48, yy, col, dashed=dsh)
    text(CX + 58, yy, lbl, 10.5, False, SOFT, anchor="lm")

zone(CX, BY + 236, CW_, BH - 236, "flow", "데이터 흐름")
flows = [("[그림]", "업로드 → analyze Job"), ("", "검출 → 관절 15개 → DB"), ("[보정]", "관절 PATCH → 보정 이력"),
         ("[이야기]", "네 칸 → 검열 → GPT"), ("", "음성 → 렌더 MP4 → 저장"), ("[보기]", "1.5초 polling → 재생")]
for i, (k, v) in enumerate(flows):
    yy = BY + 236 + 44 + i * 26
    if k:
        text(CX + 16, yy, k, 10.5, True, ZONE["flow"][2])
    text(CX + 74, yy, v, 10.5, False, INK)

zone(NX, BY, SX + SW - NX, BH, "db", "PostgreSQL 16 (Database)")
pw = (SX + SW - NX - 28 - 24) / 3
px0 = NX + 14
box(px0, BY + 42, pw, BH - 56, "db", "주요 테이블")
tables = [("characters", "이미지 크기 | bbox | AI 관절 | 세션 id"), ("joint_corrections", "관절 보정 이력"),
          ("jobs", "type | status | error_code"), ("stories", "네 칸 | text | 음성 · 영상 경로"),
          ("users", "약관 동의 시각"), ("social_accounts", "provider | 회원번호"), ("auth_tokens", "token_hash | expires_at")]
for i, (t, sub) in enumerate(tables):
    yy = BY + 70 + i * 50
    text(px0 + 12, yy, t, 12, True, ZONE["db"][2])
    text(px0 + 12, yy + 19, sub, 10, False, FAINT)
px1 = px0 + pw + 12
box(px1, BY + 42, pw, BH - 56, "db", "DB 연결 정보")
kv(px1 + 12, BY + 72, [("DBMS", "PostgreSQL 16"), ("ORM", "SQLAlchemy 2.1"), ("마이그레이션", "Alembic (3개)"),
                       ("드라이버", "psycopg 3"), ("포트", "5432 (로컬 5433)"), ("파일", "storage/uploads · results"),
                       ("공통 컬럼", "id (UUID) · created_at · updated_at")], 84, pw - 24, 11, ZONE["db"][2], lh=2.6)
px2 = px1 + pw + 12
box(px2, BY + 42, pw, BH - 56, "db", "주요 컬럼 특이사항")
notes = [("characters.ai_joints", "JSON 15개 · image_px 좌표"), ("joint_corrections.joints", "가장 최근 보정을 렌더에 사용"),
         ("jobs.status", "pending / running / succeeded / failed"), ("jobs.type", "analyze / story"),
         ("stories.place ~ result", "자유 문자열 50자 · 카드 라벨 또는 아이 말"), ("auth_tokens.token_hash", "SHA-256 · 기본 30일")]
for i, (t, sub) in enumerate(notes):
    yy = BY + 70 + i * 58
    text(px2 + 12, yy, t, 11.5, True, ZONE["db"][2])
    para(px2 + 12, yy + 19, sub, 10, False, FAINT, pw - 24, 1.3)
arrow(SX + 240, TOPY + TOPH, SX + 240, BY, ZONE["db"][0])

zone(AX, BY, AW, BH, "plain", "현재 환경 요약")
summary = ["React 웹앱 (Vite) · 태블릿 가로 기준", "FastAPI + Uvicorn (Python 3.11)", "PostgreSQL 16 + Alembic",
           "Meta Animated Drawings 사전학습 (TorchServe)", "관절 15개 · 원본 픽셀 좌표", "Job polling 1.5초 · 렌더 MP4",
           "OpenAI 문장 · 검열 · 음성 (없으면 대체)", "실제 모델로 S-01~S-11 끝까지 동작", "Azure 배포 전 (로컬 Docker)"]
for i, sline in enumerate(summary):
    yy = BY + 50 + i * 44
    ok = not sline.startswith("Azure")
    if ok:  # 맑은 고딕 굵은체에 ✓ 가 없어 선으로 그린다
        d.line([P(AX + 19, yy + 9), P(AX + 24, yy + 14), P(AX + 32, yy + 4)], fill="#3FAE8A", width=int(2.5 * S), joint="curve")
    else:
        text(AX + 18, yy, "…", 13, True, ZONE["net"][0])
    text(AX + 40, yy + 1, sline, 11.5, False, INK if ok else SOFT)

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / "system-architecture.png", optimize=True)
print("wrote", OUT / "system-architecture.png")
