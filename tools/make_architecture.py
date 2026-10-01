"""전체 시스템 아키텍처 한 장 그림 (01-system-architecture.md, 발표 자료용).

    python tools/make_architecture.py      # assets/architecture/system-architecture.png

영역과 계층은 다 보이게 두되, 칸마다 큰 틀만 적는다. 엔드포인트 · 모듈 · 컬럼 같은 세부는 01 문서 본문에 있다.
AI Model 학습(A2)이 바꿀 포즈 모델의 구조는 아직 정하지 않았다 — 「08 AI 아키텍처」에서 다룬다.
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
    "model": ("#E0A33B", "#FFF8EC", "#9A6410"),
    "plain": ("#C9CDD6", "#FAFAFB", INK),
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


def text(x, y, s, size=13, bold=False, color=INK, anchor="la"):
    d.text(P(x, y), s, font=font(size, bold), fill=color, anchor=anchor)


def blend(hexcolor, a):
    c = tuple(int(hexcolor[i:i + 2], 16) for i in (1, 3, 5))
    return tuple(int(255 + (v - 255) * a) for v in c)


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
    text(x + 16, y + 14, title, 16, True, tc)


def box(x, y, w, h, kind, title, lines=(), dashed=False, size=12.5):
    """계층 하나. 제목 + 큰 틀 한두 줄"""
    line, _, tc = ZONE[kind]
    if dashed:
        d.rounded_rectangle(B(x, y, w, h), radius=8 * S, fill=WHITE)
        for (a, b, c, e) in ((x + 8, y, x + w - 8, y), (x + 8, y + h, x + w - 8, y + h), (x, y + 8, x, y + h - 8), (x + w, y + 8, x + w, y + h - 8)):
            dashes(a, b, c, e, line, 1)
    else:
        d.rounded_rectangle(B(x, y, w, h), radius=8 * S, fill=WHITE, outline=line, width=int(1.5 * S))
    text(x + 12, y + 10, title, 13.5, True, tc)
    for i, ln in enumerate(lines):
        text(x + 12, y + 34 + i * 22, ln, size, False, SOFT)


def bar(x, y, w, h, kind, s, size=12.5):
    line, _, tc = ZONE[kind]
    d.rounded_rectangle(B(x, y, w, h), radius=7 * S, fill=blend(line, 0.16))
    text(x + 12, y + h / 2, s, size, True, tc, anchor="lm")


def bullets(x, y, rows, kind, size=12.5, gap=24):
    for i, r in enumerate(rows):
        text(x, y + i * gap, "•", size, True, ZONE[kind][0])
        text(x + 14, y + i * gap, r, size, False, INK)


def arrow(x1, y1, x2, y2, color, dashed=False, label=None, ly=None):
    if dashed:
        dashes(x1, y1, x2, y2, color, 2)
    else:
        d.line([P(x1, y1), P(x2, y2)], fill=color, width=2 * S)
    hd = 9
    if x2 != x1:
        g = 1 if x2 > x1 else -1
        d.polygon([P(x2, y2), P(x2 - g * hd, y2 - 5), P(x2 - g * hd, y2 + 5)], fill=color)
    else:
        g = 1 if y2 > y1 else -1
        d.polygon([P(x2, y2), P(x2 - 5, y2 - g * hd), P(x2 + 5, y2 - g * hd)], fill=color)
    if label:
        text((x1 + x2) / 2, ly, label, 11, False, SOFT, anchor="mm")


def check(x, y, s, ok=True):
    if ok:  # 맑은 고딕 굵은체에 ✓ 가 없어 선으로 그린다
        d.line([P(x, y + 9), P(x + 5, y + 14), P(x + 13, y + 4)], fill="#3FAE8A", width=int(2.5 * S), joint="curve")
    else:
        text(x, y, "…", 13, True, ZONE["net"][0])
    text(x + 22, y + 1, s, 12.5, False, INK if ok else SOFT)


# ─────────────── 위 줄 ───────────────
CX, CW_ = 18, 236
NX, NW = 318, 168
SX, SW = 550, 584
AX, AW = 1196, 386
TY, TH = 18, 552

# 클라이언트
zone(CX, TY, CW_, TH, "client", "클라이언트 (Web App)")
dx, dy, dw, dh = CX + 18, TY + 48, CW_ - 36, 150
d.rounded_rectangle(B(dx, dy, dw, dh), radius=14 * S, fill="#2F3441")
sx0, sy0, sw0, sh0 = dx + 9, dy + 9, dw - 18, dh - 18
d.rounded_rectangle(B(sx0, sy0, sw0, sh0), radius=6 * S, fill="#F3F4F7")
tiles = ["그림 올리기", "관절 맞추기", "이야기 만들기", "이야기 보기"]
tw2, th2 = (sw0 - 6) / 2, (sh0 - 6) / 2
for i, nm in enumerate(tiles):
    tx, ty = sx0 + (i % 2) * (tw2 + 6), sy0 + (i // 2) * (th2 + 6)
    d.rounded_rectangle(B(tx, ty, tw2, th2), radius=5 * S, fill=STAGE[i])
    text(tx + tw2 / 2, ty + th2 / 2, nm, 11.5, True, WHITE, anchor="mm")
text(CX + CW_ / 2, dy + dh + 12, "태블릿 · PC 브라우저", 11.5, False, FAINT, anchor="ma")
bar(CX + 14, dy + dh + 40, CW_ - 28, 30, "client", "React · TypeScript · Vite")
text(CX + 16, dy + dh + 96, "주요 기능", 14, True, ZONE["client"][2])
bullets(CX + 18, dy + dh + 124, ["그림 올리기 · 화면에 그리기", "캐릭터 확인 · 관절 보정", "네 칸 이야기 만들기", "이야기 보기 · 순서 맞추기", "지원 수준 · 로그인"], "client")

# 배포 · 네트워크
zone(NX, TY, NW, TH, "net", "배포 · 네트워크")
box(NX + 12, TY + 50, NW - 24, 70, "net", "지금", ["로컬 (Docker)"])
box(NX + 12, TY + 132, NW - 24, 70, "net", "목표", ["Azure (배포 전)"])
text(NX + 14, TY + 226, "역할", 14, True, ZONE["net"][2])
bullets(NX + 16, TY + 254, ["HTTPS · CORS", "그림 · 영상 파일 제공", "AI 서버는 비공개"], "net")

# 서버
zone(SX, TY, SW, TH, "server", "서버 Backend (FastAPI · Python 3.11)")
bar(SX + 14, TY + 46, SW - 28, 32, "server", "Uvicorn  |  Port 8000  |  오래 걸리는 일은 Job 으로")
hw = (SW - 28 - 14) / 2
box(SX + 14, TY + 92, hw, 112, "server", "API Layer", ["공개 API  /api/v1", "캐릭터 · 이야기 · 진행 상태 · 로그인"])
box(SX + 28 + hw, TY + 92, hw, 112, "server", "Service Layer", ["분석 · 이야기 Job 실행", "문장 생성 · 검열 · 음성"])
box(SX + 14, TY + 218, SW - 28, 112, "server", "External API Layer",
    ["OpenAI (문장 · 검열 · 음성)  ·  ElevenLabs (선택)  ·  카카오 · 구글 로그인", "외부가 실패해도 대신하는 경로로 이야기는 만들어진다"])
box(SX + 14, TY + 344, SW - 28, 82, "server", "Data Access Layer", ["SQLAlchemy · Alembic  →  PostgreSQL · 파일 저장소"])
box(SX + 14, TY + 440, SW - 28, 96, "server", "보안 · 개인정보", ["API 키는 서버에만  ·  아이 계정 없음  ·  소셜은 회원번호만", "토큰은 해시로 저장"])

# AI Runtime
zone(AX, TY, AW, TH, "ai", "AI Runtime (내부 전용 · Docker)")
box(AX + 12, TY + 50, AW - 24, 88, "ai", "AI 서버", ["분석 · 렌더 요청을 받는 내부 API"])
box(AX + 12, TY + 152, AW - 24, 88, "ai", "모델 서빙 (TorchServe)", ["Meta 사전학습 모델 — 캐릭터 · 관절 찾기"])
box(AX + 12, TY + 254, AW - 24, 112, "ai", "처리 흐름", ["그림 → 캐릭터 · 관절 15개 · 영역", "관절 + 동작 → 애니메이션 MP4"])
bar(AX + 12, TY + 380, AW - 24, 30, "ai", "관절은 원본 그림 픽셀 좌표로 주고받는다", 12)
box(AX + 12, TY + 424, AW - 24, 112, "model", "모델 교체 지점 (추후)",
    ["A2 손그림 포즈 모델로 바꿀 자리", "교체 구조는 AI 아키텍처에서 정한다"], dashed=True)

# 위 줄 화살표
arrow(CX + CW_, 262, NX, 262, ZONE["client"][0], label="HTTPS", ly=248)
arrow(NX, 300, CX + CW_, 300, "#9AA0AE", dashed=True, label="응답", ly=314)
arrow(NX + NW, 262, SX, 262, ZONE["net"][0], label="HTTP", ly=248)
arrow(SX, 300, NX + NW, 300, "#9AA0AE", dashed=True, label="응답", ly=314)
arrow(SX + SW, 262, AX, 262, ZONE["ai"][0], label="내부", ly=248)
arrow(AX, 300, SX + SW, 300, "#9AA0AE", dashed=True, label="결과", ly=314)

# ─────────────── 아래 줄 ───────────────
BY = 588
BH = H - 18 - BY
zone(CX, BY, CW_, 200, "plain", "연결 방식")
leg = [(ZONE["client"][0], False, "HTTPS (브라우저 ↔ 서버)"), (ZONE["ai"][0], False, "내부 HTTP (서버 ↔ AI)"),
       (ZONE["db"][0], False, "SQL (서버 ↔ DB)"), (ZONE["model"][0], True, "추후 연결"), ("#9AA0AE", True, "응답 (점선)")]
for i, (col, dsh, lbl) in enumerate(leg):
    yy = BY + 54 + i * 28
    arrow(CX + 16, yy, CX + 48, yy, col, dashed=dsh)
    text(CX + 58, yy, lbl, 11.5, False, SOFT, anchor="lm")

zone(CX, BY + 214, CW_, BH - 214, "model", "데이터 흐름")
for i, (k, v) in enumerate([("그림", "분석 → 캐릭터 · 관절"), ("보정", "관절 저장"), ("이야기", "문장 · 음성 · 영상"), ("보기", "결과 재생")]):
    yy = BY + 214 + 50 + i * 34
    text(CX + 18, yy, k, 12.5, True, ZONE["model"][2])
    text(CX + 74, yy, v, 12.5, False, INK)

zone(NX, BY, SX + SW - NX, BH, "db", "데이터 (PostgreSQL 16 · 파일 저장소)")
pw = (SX + SW - NX - 28 - 24) / 3
px0 = NX + 14
box(px0, BY + 46, pw, BH - 60, "db", "주요 테이블")
for i, (t, sub) in enumerate([("characters", "캐릭터 · AI 관절"), ("joint_corrections", "관절 보정"), ("jobs", "진행 상태"),
                              ("stories", "이야기"), ("users · social_accounts · auth_tokens", "계정")]):
    yy = BY + 80 + i * 66
    text(px0 + 12, yy, t, 12.5, True, ZONE["db"][2])
    text(px0 + 12, yy + 22, sub, 11.5, False, SOFT)
px1 = px0 + pw + 12
box(px1, BY + 46, pw, BH - 60, "db", "저장 방식")
for i, (k, v) in enumerate([("DB", "PostgreSQL 16"), ("ORM", "SQLAlchemy · Alembic"), ("파일", "그림 · 음성 · 영상"), ("목표", "Azure Blob")]):
    yy = BY + 80 + i * 66
    text(px1 + 12, yy, k, 12.5, True, ZONE["db"][2])
    text(px1 + 12, yy + 22, v, 11.5, False, SOFT)
px2 = px1 + pw + 12
box(px2, BY + 46, pw, BH - 60, "db", "데이터 원칙")
for i, (k, v) in enumerate([("관절", "원본 그림 픽셀 좌표 15개"), ("Job", "대기 → 처리 중 → 완료 · 실패"), ("계정", "보호자 · 교사의 것, 회원번호만"),
                            ("비회원", "이야기는 탭을 닫으면 사라짐")]):
    yy = BY + 80 + i * 66
    text(px2 + 12, yy, k, 12.5, True, ZONE["db"][2])
    text(px2 + 12, yy + 22, v, 11.5, False, SOFT)
arrow(SX + 240, TY + TH, SX + 240, BY, ZONE["db"][0])

# 오른쪽 아래: A2 학습 + 환경 요약
zone(AX, BY, AW, 196, "model", "AI Model 학습 · A2 (진행 중)")
sx = AX + 18
for i, st in enumerate(["Dataset", "전처리", "학습", "평가"]):
    w = tw(st, 12.5, True) + 22
    d.rounded_rectangle(B(sx, BY + 56, w, 28), radius=14 * S, fill=blend(ZONE["model"][0], 0.2))
    text(sx + w / 2, BY + 70, st, 12.5, True, ZONE["model"][2], anchor="mm")
    sx += w
    if i < 3:
        text(sx + 12, BY + 70, "→", 14, True, ZONE["model"][0], anchor="mm")
        sx += 24
text(AX + 18, BY + 104, "손그림 전용 포즈 모델 (15-Joint)", 12.5, False, INK)
text(AX + 18, BY + 128, "Amateur Drawings Dataset · Colab", 12, False, SOFT)
text(AX + 18, BY + 156, "더 나을 때만 AI Runtime 에 교체 (구조는 추후)", 12, True, ZONE["model"][2])
dashes(AX + AW / 2, BY, AX + AW / 2, TY + TH, ZONE["model"][0])
d.polygon([P(AX + AW / 2, TY + TH), P(AX + AW / 2 - 5, TY + TH + 9), P(AX + AW / 2 + 5, TY + TH + 9)], fill=ZONE["model"][0])

zone(AX, BY + 210, AW, BH - 210, "plain", "현재 환경 요약")
for i, (sline, ok) in enumerate([("React 웹앱 + FastAPI 서버 + AI Runtime", True), ("Meta 사전학습 모델로 캐릭터 · 관절 인식", True),
                                 ("실제 모델로 처음부터 끝까지 동작", True), ("Azure 배포 · A2 모델 교체는 다음 단계", False)]):
    check(AX + 18, BY + 210 + 50 + i * 36, sline, ok)

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / "system-architecture.png", optimize=True)
print("wrote", OUT / "system-architecture.png")
