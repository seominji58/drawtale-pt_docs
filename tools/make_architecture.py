"""전체 시스템 아키텍처 한 장 그림 (01-system-architecture.md, 발표 자료용).

    python tools/make_architecture.py      # assets/architecture/system-architecture.png (16:9)

전체 구조가 한눈에 보이도록 영역과 계층만 그린다. 엔드포인트 · 모듈 · 컬럼 같은 세부는 01 문서 본문에 있다.
교체할 손그림 포즈 모델(A2)의 구조는 아직 정하지 않았다 — 「AI 아키텍처」 문서에서 따로 다룬다.
"""

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "architecture"

S = 2
W, H = 1600, 900

INK, SOFT, FAINT, WHITE = "#262B40", "#5B6177", "#8A90A3", "#FFFFFF"
ZONE = {  # 테두리, 바탕, 제목 글자
    "client": ("#3FAE8A", "#EEF8F4", "#1F7A5E"),
    "server": ("#4256C8", "#F2F4FD", "#2E3FA3"),
    "ai": ("#8E6BD8", "#F6F2FD", "#5E3DB0"),
    "model": ("#E0A33B", "#FFF7E8", "#9A6410"),
    "data": ("#3C8DD9", "#EEF5FC", "#1F5F9E"),
    "ext": ("#9AA0AE", "#F7F8FA", "#4A5065"),
}

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


def text(x, y, s, size=14, bold=False, color=INK, anchor="la"):
    d.text(P(x, y), s, font=font(size, bold), fill=color, anchor=anchor)


def blend(hexcolor, a):
    c = tuple(int(hexcolor[i:i + 2], 16) for i in (1, 3, 5))
    return tuple(int(255 + (v - 255) * a) for v in c)


def dashes(x1, y1, x2, y2, color, width=2, on=8, off=6):
    import math
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L
    p = 0.0
    while p < L:
        q = min(p + on, L)
        d.line([P(x1 + ux * p, y1 + uy * p), P(x1 + ux * q, y1 + uy * q)], fill=color, width=width * S)
        p += on + off


def zone(x, y, w, h, kind, title, sub=None, dashed=True):
    line, fill, tc = ZONE[kind]
    r = 16
    d.rounded_rectangle(B(x, y, w, h), radius=r * S, fill=fill)
    if dashed:
        for (a, b, c, e) in ((x + r, y, x + w - r, y), (x + r, y + h, x + w - r, y + h),
                             (x, y + r, x, y + h - r), (x + w, y + r, x + w, y + h - r)):
            dashes(a, b, c, e, line)
        for (cx, cy, a0) in ((x, y, 180), (x + w - 2 * r, y, 270), (x + w - 2 * r, y + h - 2 * r, 0), (x, y + h - 2 * r, 90)):
            d.arc(B(cx, cy, 2 * r, 2 * r), a0, a0 + 90, fill=line, width=2 * S)
    else:
        d.rounded_rectangle(B(x, y, w, h), radius=r * S, outline=line, width=2 * S)
    text(x + 20, y + 18, title, 19, True, tc)
    if sub:
        text(x + 20, y + 48, sub, 12.5, False, SOFT)


def layer(x, y, w, h, kind, name, desc):
    line, _, tc = ZONE[kind]
    d.rounded_rectangle(B(x, y, w, h), radius=10 * S, fill=WHITE, outline=blend(line, 0.55), width=int(1.5 * S))
    text(x + 16, y + h / 2 - 10, name, 14.5, True, tc, anchor="lm")
    text(x + 16, y + h / 2 + 12, desc, 12, False, SOFT, anchor="lm")


def chip(x, y, s, kind):
    line, _, tc = ZONE[kind]
    w = d.textlength(s, font=font(12, True)) / S + 22
    d.rounded_rectangle(B(x, y, w, 26), radius=13 * S, fill=blend(line, 0.18))
    text(x + w / 2, y + 13, s, 12, True, tc, anchor="mm")
    return w


def arrow(x1, y1, x2, y2, color, dashed=False, both=False, label=None, lx=None, ly=None, lcolor=SOFT):
    (dashes if dashed else (lambda a, b, c, e, col, wd=2: d.line([P(a, b), P(c, e)], fill=col, width=wd * S)))(x1, y1, x2, y2, color, 2)

    def head(xa, ya, xb, yb):
        hd = 10
        if xb != xa:
            g = 1 if xb > xa else -1
            d.polygon([P(xb, yb), P(xb - g * hd, yb - 6), P(xb - g * hd, yb + 6)], fill=color)
        else:
            g = 1 if yb > ya else -1
            d.polygon([P(xb, yb), P(xb - 6, yb - g * hd), P(xb + 6, yb - g * hd)], fill=color)
    head(x1, y1, x2, y2)
    if both:
        head(x2, y2, x1, y1)
    if label:
        text(lx if lx is not None else (x1 + x2) / 2, ly if ly is not None else (y1 + y2) / 2 - 16, label, 12, True, lcolor, anchor="mm")


# ─────────── 위: 서비스가 도는 세 영역 ───────────
TY, TH = 96, 430
CX, CWD = 40, 420
SX, SWD = 590, 420
AX, AWD = 1140, 420
LH, LG = 86, 14
L0 = TY + 92

text(40, 34, "DrawTale 전체 시스템 아키텍처", 24, True, INK)
text(40, 66, "아이가 그린 그림 → 캐릭터 → 아이가 고른 네 칸 → 움직이는 이야기", 13.5, False, SOFT)

zone(CX, TY, CWD, TH, "client", "클라이언트 · Web App", "태블릿 · PC 브라우저  ·  아이 · 보호자 · 교사")
for i, (n, dsc) in enumerate([("화면", "그림 올리기 · 그리기, 관절 맞추기, 이야기 만들기 · 보기"),
                              ("상태 · 지원 수준", "진행 중인 선택, 설정, 비회원 · 회원"),
                              ("API 연결", "서버 호출 · 진행 상태 확인 (한 곳에 모음)")]):
    layer(CX + 20, L0 + i * (LH + LG), CWD - 40, LH, "client", n, dsc)
chip(CX + 20, TY + TH - 40, "React · TypeScript · Vite", "client")

zone(SX, TY, SWD, TH, "server", "서버 · Backend", "공개 API  ·  오래 걸리는 일은 Job 으로")
for i, (n, dsc) in enumerate([("API", "그림 · 관절 · 이야기 · 로그인"),
                              ("서비스", "분석 · 이야기 Job, 문장 · 검열 · 음성"),
                              ("데이터 접근", "DB · 파일 저장소")]):
    layer(SX + 20, L0 + i * (LH + LG), SWD - 40, LH, "server", n, dsc)
chip(SX + 20, TY + TH - 40, "FastAPI · Python 3.11", "server")

zone(AX, TY, AWD, TH, "ai", "AI Runtime", "내부 전용  ·  서버만 부른다")
for i, (n, dsc) in enumerate([("AI API", "분석 · 렌더 요청을 받는다"),
                              ("캐릭터 인식", "캐릭터 찾기 · 관절 15개 · 영역 (Meta 사전학습)"),
                              ("애니메이션", "관절 + 동작 → MP4")]):
    layer(AX + 20, L0 + i * (LH + LG), AWD - 40, LH, "ai", n, dsc)
w1 = chip(AX + 20, TY + TH - 40, "FastAPI · TorchServe", "ai")
chip(AX + 28 + w1, TY + TH - 40, "Docker", "ai")

# 위 화살표
arrow(CX + CWD, TY + 215, SX, TY + 215, ZONE["client"][0], both=True, label="HTTPS  /api/v1", ly=TY + 195)
arrow(SX + SWD, TY + 215, AX, TY + 215, ZONE["ai"][0], both=True, label="내부 HTTP", ly=TY + 195)

# ─────────── 아래: 함께 쓰는 것 (위 칸과 같은 열) ───────────
BY, BH = 586, 196
zone(CX, BY, CWD, BH, "ext", "외부 서비스", None, dashed=False)
for i, (n, dsc) in enumerate([("OpenAI", "이야기 문장 · 내용 검열 · 음성"), ("ElevenLabs", "음성 (선택)"), ("카카오 · 구글", "로그인 (회원번호만)")]):
    y = BY + 66 + i * 40
    text(CX + 22, y, n, 14, True, ZONE["ext"][2])
    text(CX + 150, y + 1, dsc, 12.5, False, SOFT)

zone(SX, BY, SWD, BH, "data", "데이터", None, dashed=False)
for i, (n, dsc) in enumerate([("PostgreSQL 16", "캐릭터 · 관절 보정 · Job · 이야기 · 계정"), ("파일 저장소", "그림 · 음성 · 영상 (지금 로컬, 목표 Blob)")]):
    y = BY + 66 + i * 56
    text(SX + 22, y, n, 14, True, ZONE["data"][2])
    text(SX + 22, y + 24, dsc, 12.5, False, SOFT)

zone(AX, BY, AWD, BH, "model", "AI Model 학습 · A2", "손그림 전용 포즈 모델 (진행 중)")
sx = AX + 22
for i, st in enumerate(["Dataset", "전처리", "학습", "평가"]):
    w = chip(sx, BY + 92, st, "model")
    sx += w
    if i < 3:
        text(sx + 11, BY + 105, "→", 14, True, ZONE["model"][0], anchor="mm")
        sx += 22
text(AX + 22, BY + 140, "Amateur Drawings Dataset · 15-Joint 규격 · Colab", 12, False, SOFT)

# 아래 화살표
ec = ZONE["ext"][0]
gy = (TY + TH + BY) / 2                                                # 위아래 줄 사이 빈 공간으로만 지난다
ex = CX + CWD / 2
d.line([P(SX + 60, TY + TH), P(SX + 60, gy), P(ex, gy)], fill=ec, width=2 * S)
arrow(ex, gy, ex, BY, ec)
d.polygon([P(SX + 60, TY + TH), P(SX + 54, TY + TH + 10), P(SX + 66, TY + TH + 10)], fill=ec)
text((ex + SX + 60) / 2, gy - 14, "HTTPS", 11.5, True, SOFT, anchor="mm")
arrow(SX + SWD / 2, TY + TH, SX + SWD / 2, BY, ZONE["data"][0], both=True)
text(SX + SWD / 2 + 10, (TY + TH + BY) / 2, "SQL · 파일", 11.5, True, SOFT, anchor="lm")
arrow(AX + AWD / 2, BY, AX + AWD / 2, TY + TH, ZONE["model"][0], dashed=True)
lw_ = d.textlength("모델 교체 (구조는 추후 AI 아키텍처에서)", font=font(11.5, True)) / S + 24
d.rounded_rectangle(B(AX + AWD / 2 - 12 - lw_, (TY + TH + BY) / 2 - 15, lw_, 30), radius=8 * S, fill=WHITE,
                    outline=ZONE["model"][0], width=int(1.5 * S))
text(AX + AWD / 2 - lw_, (TY + TH + BY) / 2, "모델 교체 (구조는 추후 AI 아키텍처에서)", 11.5, True, ZONE["model"][2], anchor="lm")

# ─────────── 맨 아래: 배포 · 범례 ───────────
FY = 812
d.rounded_rectangle(B(40, FY, W - 80, 58), radius=12 * S, fill="#F4F5F8")
text(62, FY + 29, "배포", 13, True, INK, anchor="lm")
text(112, FY + 29, "지금  로컬 Docker (프론트 · 서버 · AI · DB)        목표  Azure — Static Web Apps (프론트) + VM 1대 (서버 · AI 컨테이너) + Blob",
     12.5, False, SOFT, anchor="lm")
lx = W - 300
arrow(lx, FY + 29, lx + 34, FY + 29, INK)
text(lx + 42, FY + 29, "요청 · 응답", 11.5, False, SOFT, anchor="lm")
dashes(lx + 140, FY + 29, lx + 174, FY + 29, ZONE["model"][0])
text(lx + 182, FY + 29, "추후 연결", 11.5, False, SOFT, anchor="lm")

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / "system-architecture.png", optimize=True)
print("wrote", OUT / "system-architecture.png")
