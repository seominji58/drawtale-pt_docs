"""화면 설계서(04-screen-spec.md)의 화면 그림을 만든다.

    python tools/make_screens.py        # assets/screens/*.png

S-06 관절 맞추기만 실제 캐릭터 그림 위에 관절점을 올리고, 나머지는 회색 와이어프레임이다.
그림의 동그라미 숫자는 설계서 요소표의 번호다 (S-05 의 ③ = S-05-03).
점선으로 그린 요소는 조건이 맞을 때만 나타난다.

필요한 것: Pillow, 한글 글꼴 (맑은 고딕 또는 나눔고딕)
"""

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "screens"
CHAR = ROOT / "assets" / "source" / "meta-char1.png"

S = 2                  # 해상도 배율. 발표 자료에 붙여도 흐리지 않게
W, H = 1024, 768       # 기준 화면 (태블릿 가로)
PAD = 36               # 기기 테두리 두께
RAIL, ACTS = 72, 120   # 위 레일, 아래 행동 줄 높이

BG = "#F3F4F7"
CARD = "#FFFFFF"
LINE = "#A3A9B7"
INK = "#3B4150"
SOFT = "#6F7584"
FAINT = "#E4E7ED"
DARK = "#4A5160"
SEL = "#D6DAE2"
MARK = "#4C5CC4"

FONT_DIRS = [
    Path("C:/Windows/Fonts"),
    Path("/usr/share/fonts/truetype/nanum"),
    Path("/Library/Fonts"),
    Path("/System/Library/Fonts"),
]
FONT_FILES = {
    False: ["malgun.ttf", "NanumGothic.ttf", "AppleSDGothicNeo.ttc"],
    True: ["malgunbd.ttf", "NanumGothicBold.ttf", "AppleSDGothicNeo.ttc"],
}


@lru_cache(maxsize=None)
def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    for d in FONT_DIRS:
        for f in FONT_FILES[bold]:
            if (d / f).exists():
                return ImageFont.truetype(str(d / f), size * S)
    raise SystemExit("한글 글꼴을 찾지 못했습니다 (맑은 고딕 또는 나눔고딕)")


class Wire:
    """기기 테두리 안에 1024×768 화면 하나를 그린다. 좌표는 화면 기준 논리 픽셀이다."""

    def __init__(self, adult: bool = False, caption: str | None = None):
        self.adult = adult
        self.img = Image.new("RGB", ((W + 2 * PAD) * S, (H + 2 * PAD) * S), "#FFFFFF")
        self.d = ImageDraw.Draw(self.img)
        self.d.rounded_rectangle(
            [0, 0, (W + 2 * PAD) * S - 1, (H + 2 * PAD) * S - 1], radius=40 * S, fill="#2F3441"
        )
        self.d.rounded_rectangle(self.box(0, 0, W, H), radius=14 * S, fill=BG)
        self.marks: list[tuple[str, float, float]] = []
        if caption:
            self.d.text(
                ((W + PAD) * S, (H + PAD + 10) * S), caption, font=font(11), fill="#9AA0AE", anchor="ra"
            )

    # ── 좌표 ──
    def pt(self, x, y):
        return ((x + PAD) * S, (y + PAD) * S)

    def box(self, x, y, w, h):
        return [(x + PAD) * S, (y + PAD) * S, (x + w + PAD) * S, (y + h + PAD) * S]

    # ── 도형 ──
    def rect(self, x, y, w, h, fill=CARD, line=LINE, r=16, width=2, dash=False):
        if dash:
            self.d.rounded_rectangle(self.box(x, y, w, h), radius=r * S, fill=fill)
            self._dash_box(x, y, w, h, r, line, width)
        else:
            self.d.rounded_rectangle(
                self.box(x, y, w, h), radius=r * S, fill=fill,
                outline=line if line else None, width=width * S if line else 0,
            )

    def _dash_line(self, x1, y1, x2, y2, color, width, on=8, off=6):
        length = abs(x2 - x1) + abs(y2 - y1)
        horiz = y1 == y2
        pos = 0.0
        while pos < length:
            end = min(pos + on, length)
            if horiz:
                a, b = (x1 + pos, y1), (x1 + end, y1)
            else:
                a, b = (x1, y1 + pos), (x1, y1 + end)
            self.d.line([self.pt(*a), self.pt(*b)], fill=color, width=width * S)
            pos += on + off

    def _dash_box(self, x, y, w, h, r, color, width):
        self._dash_line(x + r, y, x + w - r, y, color, width)
        self._dash_line(x + r, y + h, x + w - r, y + h, color, width)
        self._dash_line(x, y + r, x, y + h - r, color, width)
        self._dash_line(x + w, y + r, x + w, y + h - r, color, width)
        for (cx, cy, a0) in ((x, y, 180), (x + w - 2 * r, y, 270), (x + w - 2 * r, y + h - 2 * r, 0),
                             (x, y + h - 2 * r, 90)):
            self.d.arc(self.box(cx, cy, 2 * r, 2 * r), a0, a0 + 90, fill=color, width=width * S)

    def dash_ellipse(self, x, y, w, h, color=LINE, width=3):
        for a in range(0, 360, 14):
            self.d.arc(self.box(x, y, w, h), a, a + 8, fill=color, width=width * S)

    def circle(self, cx, cy, r, fill=CARD, line=LINE, width=2):
        self.d.ellipse(self.box(cx - r, cy - r, 2 * r, 2 * r), fill=fill,
                       outline=line, width=width * S if line else 0)

    def line(self, pts, color=LINE, width=2):
        self.d.line([self.pt(*p) for p in pts], fill=color, width=width * S)

    def image_ph(self, x, y, w, h, label=None, r=16, fill="#EEF0F4"):
        """그림이 들어갈 자리. 와이어프레임 관례대로 X 를 긋는다."""
        self.rect(x, y, w, h, fill=fill, line=LINE, r=r)
        self.line([(x + r / 2, y + r / 2), (x + w - r / 2, y + h - r / 2)], "#CDD1DA", 2)
        self.line([(x + w - r / 2, y + r / 2), (x + r / 2, y + h - r / 2)], "#CDD1DA", 2)
        if label:
            tw = self.d.textlength(label, font=font(15)) / S + 24
            self.rect(x + w / 2 - tw / 2, y + h / 2 - 16, tw, 32, fill=fill, line=None, r=8)
            self.text(x + w / 2, y + h / 2, label, 15, color=SOFT, anchor="mm")

    # ── 글자 ──
    def wrap(self, s, size, bold, width):
        f = font(size, bold)
        lines, cur = [], ""
        for word in s.split(" "):
            test = f"{cur} {word}".strip()
            if self.d.textlength(test, font=f) / S <= width:
                cur = test
                continue
            if cur:
                lines.append(cur)
            cur = ""
            for ch in word:   # 한 낱말이 칸보다 길면 글자 단위로 자른다
                if self.d.textlength(cur + ch, font=f) / S > width:
                    lines.append(cur)
                    cur = ""
                cur += ch
        if cur:
            lines.append(cur)
        return lines

    def text(self, x, y, s, size=18, bold=False, color=INK, anchor="la", width=None, gap=1.45):
        if width is None:
            self.d.text(self.pt(x, y), s, font=font(size, bold), fill=color, anchor=anchor)
            return y + size * gap
        lines = self.wrap(s, size, bold, width)
        for i, ln in enumerate(lines):
            self.d.text(self.pt(x, y + i * size * gap), ln, font=font(size, bold), fill=color,
                        anchor=anchor)
        return y + len(lines) * size * gap

    def pill(self, x, y, s, size=20, bold=False, fill="#EEF0F4", color=INK, pad=16, h=None):
        tw = self.d.textlength(s, font=font(size, bold)) / S
        h = h or size + 22
        self.rect(x, y, tw + 2 * pad, h, fill=fill, line=None, r=h / 2)
        self.text(x + pad + tw / 2, y + h / 2, s, size, bold, color, anchor="mm")
        return tw + 2 * pad

    # ── 부품 ──
    def button(self, x, y, w, h, label, kind="secondary", dash=False, size=None):
        size = size or (18 if self.adult else 22)
        if kind == "primary":
            self.rect(x, y, w, h, fill=DARK, line=None if not dash else LINE, r=h / 2, dash=dash)
            self.text(x + w / 2, y + h / 2, label, size, True, "#FFFFFF", anchor="mm")
        elif kind == "disabled":
            self.rect(x, y, w, h, fill="#E9EBEF", line=None, r=h / 2)
            self.text(x + w / 2, y + h / 2, label, size, True, "#A3A9B7", anchor="mm")
        else:
            self.rect(x, y, w, h, fill=CARD, line=LINE, r=h / 2, dash=dash)
            self.text(x + w / 2, y + h / 2, label, size, True, INK, anchor="mm")

    def link(self, x, y, s, size=17, color=INK, anchor="la"):
        f = font(size, True)
        tw = self.d.textlength(s, font=f) / S
        x0 = x - tw / 2 if anchor == "ma" else x
        self.text(x0, y, s, size, True, color)
        self.line([(x0, y + size + 4), (x0 + tw, y + size + 4)], color, 1)
        return tw

    def round(self, x, y, label):
        self.circle(x + 28, y + 28, 28, fill=CARD, line=LINE)
        self.text(x + 28, y + 28, label, 14, True, INK, anchor="mm")

    def dots(self, cx, cy, n, on, r=7, gap=14, filled_upto=False):
        total = n * 2 * r + (n - 1) * gap
        x = cx - total / 2 + r
        for i in range(n):
            lit = (i < on) if filled_upto else (i == on - 1)
            self.circle(x, cy, r, fill=INK if lit else CARD, line=INK if lit else LINE)
            x += 2 * r + gap

    def toggle(self, x, y, on=False):
        self.rect(x, y, 56, 30, fill=DARK if on else FAINT, line=None, r=15)
        self.circle(x + (41 if on else 15), y + 15, 11, fill=CARD, line=None)

    def field(self, x, y, w, label, placeholder, note=None):
        self.text(x, y, label, 15, True, SOFT)
        self.rect(x, y + 22, w, 44, fill=CARD, line=LINE, r=10)
        self.text(x + 14, y + 44, placeholder, 16, color="#A3A9B7", anchor="lm")
        if note:
            self.text(x, y + 72, note, 14, color="#A93E51")

    def mark(self, n, x, y):
        self.marks.append((str(n), x, y))

    # ── 화면 틀 (components/Screen.tsx) ──
    def frame(self, back=True, seg=None, speech=True, title=None, end=None, acts=()):
        if back:
            self.round(20, 8, "뒤로")
        if title:
            self.text(W / 2, RAIL / 2, title, 22, True, anchor="mm")
        elif seg:
            self.dots(W / 2, RAIL / 2, 4, seg)
        if end:
            end()
        elif speech:
            self.round(W - 76, 8, "소리")
        self.line([(0, RAIL), (W, RAIL)], FAINT, 1)
        if acts:
            h = 64 if self.adult else 88
            bw = 220 if self.adult else 250
            gap = 24
            total = len(acts) * bw + (len(acts) - 1) * gap
            x = W / 2 - total / 2
            y = H - ACTS + (ACTS - h) / 2
            self.line([(0, H - ACTS), (W, H - ACTS)], FAINT, 1)
            for a in acts:
                label, kind, *rest = a
                self.button(x, y, bw, h, label, kind, dash=bool(rest and rest[0]))
                x += bw + gap

    def save(self, name):
        for n, x, y in self.marks:
            r = 15 if len(n) < 2 else 17
            self.circle(x, y, r, fill=MARK, line="#FFFFFF", width=2)
            self.text(x, y, n, 15 if len(n) < 2 else 13, True, "#FFFFFF", anchor="mm")
        OUT.mkdir(parents=True, exist_ok=True)
        self.img.save(OUT / f"{name}.png", optimize=True)
        print("wrote", name)


# ─────────────────────────── 화면 ───────────────────────────

def common():
    w = Wire()
    w.frame(back=True, seg=2, speech=True, acts=[("다음", "primary")])
    w.rect(0, 0, W, 6, fill="#F4909F", line=None, r=0)                       # C-05
    w.rect(32, RAIL + 24, W - 64, H - RAIL - ACTS - 100, fill=CARD, line=LINE, dash=True)
    w.text(W / 2, 250, "무대 · 콘텐츠 영역", 22, True, SOFT, anchor="mm")
    w.text(W / 2, 285, "각 화면은 이 안만 채운다", 16, color=SOFT, anchor="mm")
    w.circle(W / 2, 360, 34, fill="#EEF0F4", line=LINE)                       # C-06
    w.text(W / 2, 410, "기다리는 중", 15, color=SOFT, anchor="mm")
    w.text(W / 2 - 170, H - ACTS - 44, "잘 움직이지 않나요?", 17, color=SOFT)  # C-07
    w.link(W / 2 + 10, H - ACTS - 44, "어른에게 도움 받기")
    w.mark(1, 22, 12); w.mark(2, W - 22, 12); w.mark(3, W / 2 - 60, 22)
    w.mark(4, W / 2 - 130, H - 88); w.mark(5, 60, 16); w.mark(6, W / 2 - 50, 330)
    w.mark(7, W / 2 - 190, H - ACTS - 44)
    w.save("C-common")


def s01():
    w = Wire()

    def settings():
        w.round(W - 76, 8, "설정")
        w.d.arc(w.box(W - 80, 4, 64, 64), -90, 120, fill=DARK, width=4 * S)
    w.frame(back=False, speech=False, end=settings,
            acts=[("이야기 만들기", "primary"), ("내 이야기", "disabled")])
    w.rect(160, RAIL + 24, 704, 460, fill=CARD, line=LINE, r=24)
    w.image_ph(372, RAIL + 50, 280, 400, "캐릭터 인사 삽화")
    w.rect(W - 340, 80, 250, 40, fill="#FFF4D6", line="#E5BE5E", r=12, dash=True)
    w.text(W - 215, 100, "3초 동안 꾹 눌러 주세요", 15, anchor="mm")
    w.mark(1, W - 52, 70); w.mark(2, 160, RAIL + 24); w.mark(3, 262, H - 104)
    w.mark(4, 536, H - 104); w.mark(5, W - 340, 80)
    w.save("S-01")


def s02():
    w = Wire()
    w.frame(seg=1, acts=[("그림 찍기", "primary")])
    w.text(W / 2, 108, "이런 그림이 좋아요", 30, True, anchor="mm")
    cards = [("좋아요", "사람을 한 명만 그려요", False),
             ("좋아요", "하얀 종이에 그려요", False),
             ("이러면 더 잘 움직여요", "팔과 다리를 몸에서 조금 떨어지게 그려요", False),
             ("아직 어려워요", "여러 명은 아직 어려워요", True)]
    cw, gap, x = 221, 20, 40
    for i, (label, desc, dash) in enumerate(cards):
        w.rect(x, 150, cw, 460, fill=CARD, line=LINE, r=20, dash=dash)
        w.image_ph(x + 20, 170, cw - 40, 250, "예시 그림")
        w.text(x + cw / 2, 446, label, 18, True, anchor="mm")
        w.text(x + 20, 476, desc, 16, color=SOFT, width=cw - 40)
        w.mark(i + 2, x, 150)
        x += cw + gap
    w.mark(1, W / 2 - 150, 108); w.mark(6, 400, H - 104)
    w.save("S-02")


def s03():
    w = Wire()
    w.frame(seg=1, acts=[("그림 찍기", "primary"), ("화면에 그리기", "secondary"),
                         ("앨범에서 고르기", "secondary")])
    w.rect(112, RAIL + 20, 800, 420, fill=CARD, line=LINE, r=24, dash=True)
    w.image_ph(412, RAIL + 90, 200, 260, "종이 삽화")
    w.text(W / 2, 540, "종이에 그린 그림을 찍거나, 화면에 그려 주세요", 18, color=SOFT, anchor="mm")
    w.rect(356, 568, 312, 44, fill=BG, line=LINE, r=12, dash=True)
    w.text(376, 590, "확인용", 15, color=SOFT, anchor="lm")
    w.link(440, 579, "샘플 그림으로 해보기", 16)
    w.mark(1, 112, RAIL + 20); w.mark(2, 292, 540); w.mark(3, 134, H - 104)
    w.mark(4, 408, H - 104); w.mark(5, 682, H - 104); w.mark(8, 356, 568)
    w.save("S-03")

    w = Wire()
    w.frame(seg=1, acts=[("다시 고르기", "secondary"), ("이 그림으로", "primary")])
    w.rect(112, RAIL + 20, 800, 480, fill=CARD, line=LINE, r=24)
    w.image_ph(362, RAIL + 40, 300, 440, "고른 그림")
    w.mark(1, 112, RAIL + 20); w.mark(6, 262, H - 104); w.mark(7, 536, H - 104)
    w.save("S-03-selected")


def s03d():
    w = Wire()
    w.frame(seg=1, acts=[("되돌리기", "secondary"), ("다음", "primary")])
    w.text(W / 2, 100, "머리를 그려 볼까요?", 28, True, anchor="mm")
    w.text(W / 2, 136, "점선을 따라 그려요", 17, color=SOFT, anchor="mm")
    w.rect(32, 164, 712, 396, fill="#EEF0F4", line=LINE, r=20)
    w.rect(240, 176, 296, 372, fill=CARD, line=LINE, r=12)
    w.dash_ellipse(338, 200, 100, 100)
    w.text(388, 340, "머리 자리 (점선 안내)", 14, color=SOFT, anchor="mm")
    # 고른 도구: 밝은 배경 + 체크 (색만으로 구분하지 않는다)
    w.rect(764, 164, 228, 64, fill=SEL, line=LINE, r=32)
    w.line([(806, 196), (814, 205), (830, 186)], INK, 3)
    w.text(890, 196, "손으로 그리기", 17, True, anchor="mm")
    w.button(764, 240, 228, 64, "도장 찍기", "secondary", size=17)
    for i, p in enumerate(["머리", "몸", "팔", "다리"]):
        bx, by = 764 + (i % 2) * 118, 330 + (i // 2) * 100
        w.rect(bx, by, 110, 88, fill=SEL if i == 0 else CARD, line=LINE, r=16)
        w.text(bx + 55, by + 44, p, 18, True, anchor="mm")
    w.rect(32, 572, 960, 48, fill="#FDE3E7", line="#E8697D", r=12, dash=True)
    w.text(52, 596, "팔이 몸에서 떨어져 있어요. 붙게 그려 볼까요?", 16, anchor="lm")
    w.link(430, 586, "팔 고치러 가기", 16)
    w.mark(1, W / 2 - 150, 100); w.mark(2, W / 2 - 90, 136); w.mark(3, 32, 164)
    w.mark(4, 764, 164); w.mark(5, 764, 330); w.mark(6, 262, H - 104); w.mark(7, 536, H - 104)
    w.mark(8, 32, 572)
    w.save("S-03D")


def waiting(name, seg, msg, art, diag):
    w = Wire()
    w.frame(seg=seg, acts=[("그만하기", "secondary", True)])
    w.circle(W / 2, 220, 100, fill="#EEF0F4", line=LINE)
    w.text(W / 2, 220, art, 15, color=SOFT, anchor="mm")
    w.text(W / 2, 370, msg, 28, True, anchor="mm")
    w.dots(W / 2, 420, 3, 2, r=9, gap=18, filled_upto=True)
    w.rect(W / 2 - 170, 460, 340, 40, fill=BG, line=LINE, r=10, dash=True)
    w.text(W / 2, 480, diag, 15, color=SOFT, anchor="mm")
    w.mark(1, W / 2 - 100, 130); w.mark(2, W / 2 - 170, 370); w.mark(3, W / 2 - 60, 420)
    w.mark(4, W / 2 - 125, H - 104); w.mark(5, W / 2 - 170, 460)
    w.save(name)


def s05():
    w = Wire()
    w.frame(seg=2, acts=[("다시 찍기", "secondary"), ("이 친구로 할래요", "primary")])
    w.text(W / 2, 100, "내 친구가 움직여요", 28, True, anchor="mm")
    w.rect(212, 136, 600, 420, fill=CARD, line=LINE, r=24)
    w.image_ph(362, 152, 300, 388, "캐릭터 · 움직임 미리보기")
    w.text(W / 2 - 110, 578, "잘 움직이지 않나요?", 17, color=SOFT)
    w.link(W / 2 + 60, 578, "어른에게 도움 받기")
    w.mark(1, W / 2 - 140, 100); w.mark(2, 212, 136); w.mark(3, 262, H - 104)
    w.mark(4, 536, H - 104); w.mark(5, W / 2 - 128, 588)
    w.save("S-05")


# S-06 은 실제 그림으로 그린다. 관절은 Meta 예제 char1 의 char_cfg.yaml 값 (원본 508×602 px)
JOINTS = {
    "hip": (264, 397), "torso": (247, 232), "neck": (231, 119),
    "right_shoulder": (151, 245), "right_elbow": (99, 278), "right_hand": (46, 311),
    "left_shoulder": (343, 218), "left_elbow": (396, 245), "left_hand": (449, 278),
    "right_hip": (191, 404), "right_knee": (165, 476), "right_foot": (138, 556),
    "left_hip": (337, 390), "left_knee": (376, 456), "left_foot": (409, 549),
}
BONES = [("hip", "torso"), ("torso", "neck"), ("torso", "right_shoulder"),
         ("right_shoulder", "right_elbow"), ("right_elbow", "right_hand"),
         ("torso", "left_shoulder"), ("left_shoulder", "left_elbow"), ("left_elbow", "left_hand"),
         ("hip", "right_hip"), ("right_hip", "right_knee"), ("right_knee", "right_foot"),
         ("hip", "left_hip"), ("left_hip", "left_knee"), ("left_knee", "left_foot")]
NAMES = {
    "neck": "얼굴", "torso": "몸통", "hip": "엉덩이",
    "right_shoulder": "오른쪽 어깨", "right_elbow": "오른쪽 팔꿈치", "right_hand": "오른쪽 손목",
    "left_shoulder": "왼쪽 어깨", "left_elbow": "왼쪽 팔꿈치", "left_hand": "왼쪽 손목",
    "right_hip": "오른쪽 골반", "right_knee": "오른쪽 무릎", "right_foot": "오른쪽 발목",
    "left_hip": "왼쪽 골반", "left_knee": "왼쪽 무릎", "left_foot": "왼쪽 발목",
}
ORDER = list(JOINTS)
MOVED = "left_elbow"
BEFORE = (448, 318)   # AI 가 잘못 짚었던 자리 (예시)


def s06(blank=False):
    """blank=True 면 ① 칸에서 캐릭터 그림 · 뼈대 · 나머지 관절점을 비운 판.
    끌어 옮기는 관절점과 「끌어서 옮기기」 표시만 같은 자리에 남긴다. 발표에서 다른 그림을 얹을 때 쓴다."""
    w = Wire(adult=True, caption=None if blank else "캐릭터 그림: Meta Animated Drawings 예제 char1 (MIT License)")
    w.frame(title="어른이 맞춰 주세요", speech=False,
            acts=[("움직여 보기", "secondary"), ("다 했어요", "primary")])

    sx, sy, sw, sh = 24, RAIL + 16, 560, 480
    w.rect(sx, sy, sw, sh, fill=CARD, line=LINE, r=16)
    src = Image.open(CHAR).convert("RGB")
    scale = min((sw - 24) / src.width, (sh - 24) / src.height)
    iw, ih = int(src.width * scale), int(src.height * scale)
    ox, oy = sx + (sw - iw) / 2, sy + (sh - ih) / 2
    if not blank:
        w.img.paste(src.resize((iw * S, ih * S), Image.LANCZOS), (int((ox + PAD) * S), int((oy + PAD) * S)))

    def P(xy):
        return (ox + xy[0] * scale, oy + xy[1] * scale)

    if not blank:
        for a, b in BONES:
            w.line([P(JOINTS[a]), P(JOINTS[b])], "#7386F5", 3)

    # 끌어 옮기는 중인 관절: 전 자리는 흐린 점선 원, 화살표, 새 자리는 노란 테
    bx, by = P(BEFORE)
    nx, ny = P(JOINTS[MOVED])
    w.dash_ellipse(bx - 11, by - 11, 22, 22, "#E5BE5E", 2)
    w.line([(bx, by), (nx + 8, ny + 10)], "#E5A23B", 3)
    w.line([(nx + 8, ny + 10), (nx + 20, ny + 12)], "#E5A23B", 3)
    w.line([(nx + 8, ny + 10), (nx + 12, ny + 22)], "#E5A23B", 3)
    w.pill(bx - 20, by + 16, "끌어서 옮기기", 13, True, fill="#FFF4D6", pad=10, h=26)

    for name, xy in JOINTS.items():
        if blank and name != MOVED:
            continue
        x, y = P(xy)
        if name == MOVED:
            w.circle(x, y, 15, fill="#FFEA99", line="#E5A23B", width=3)
        w.circle(x, y, 8, fill="#FFFFFF", line="#4C5CC4", width=3)

    _s06_rest(w, sx, sy, blank=blank)


def _s06_rest(w, sx, sy, blank=False):
    """S-06 의 ① 칸 밖 (관절 목록 · 안내 · 버튼 · 번호)"""
    lx, ly, lw = 604, RAIL + 16, 396
    w.rect(lx, ly, lw, 480, fill=CARD, line=LINE, r=16)
    row = 480 / len(ORDER)
    for i, name in enumerate(ORDER):
        y = ly + i * row
        if name == MOVED:
            w.rect(lx + 6, y + 2, lw - 12, row - 4, fill="#FFF4D6", line=None, r=8)
        if i:
            w.line([(lx + 16, y), (lx + lw - 16, y)], FAINT, 1)
        w.text(lx + 20, y + row / 2, NAMES[name], 15, name == MOVED, anchor="lm")
        if name == MOVED:
            w.text(lx + lw - 20, y + row / 2, "옮김", 14, True, SOFT, anchor="rm")

    w.rect(24, RAIL + 508, W - 48, 44, fill="#EEF0F4", line=None, r=12)
    w.text(44, RAIL + 530, "점을 끌어서 그림의 관절 자리에 맞춰 주세요", 16, anchor="lm")

    w.mark(1, sx + 4, sy + 4); w.mark(2, lx + 4, ly + 4); w.mark(3, 28, RAIL + 512)
    w.mark(4, 290, H - 92); w.mark(5, 534, H - 92); w.mark(6, 26, 14)
    w.save("S-06-blank" if blank else "S-06")


def s07():
    w = Wire()
    w.frame(seg=3)
    w.rect(W / 2 - 230, 82, 460, 34, fill=BG, line=LINE, r=10, dash=True)
    w.text(W / 2, 99, "숲 · 길을 잃었어요 · 물어봤어요", 15, color=SOFT, anchor="mm")
    w.text(W / 2, 150, "어디로 갔을까요?", 30, True, anchor="mm")
    cw, gap = 200, 28
    x = W / 2 - (4 * cw + 3 * gap) / 2
    for label in ["우주", "숲", "바다", "학교"]:
        w.rect(x, 190, cw, 230, fill=CARD, line=LINE, r=24)
        w.image_ph(x + 36, 210, 128, 128, "아이콘", r=20)
        w.text(x + cw / 2, 380, label, 20, True, anchor="mm")
        x += cw + gap
    sx = W / 2 - 250
    for i, s in enumerate(["장소", "문제", "행동", "결과"]):
        w.circle(sx + i * 130, 470, 8, fill=INK if i == 0 else CARD, line=INK if i == 0 else LINE)
        w.text(sx + i * 130 + 16, 470, s, 17, i == 0, INK if i == 0 else SOFT, anchor="lm")
    w.rect(W / 2 - 260, 512, 520, 150, fill=CARD, line=LINE, r=20, dash=True)
    w.text(W / 2, 548, "이걸로 할까요?", 22, True, anchor="mm")
    w.button(W / 2 - 210, 580, 200, 64, "예", "primary", size=20)
    w.button(W / 2 + 10, 580, 200, 64, "다시", "secondary", size=20)
    w.mark(1, W / 2 - 230, 82); w.mark(2, W / 2 - 125, 150); w.mark(3, 70, 190)
    w.mark(4, W / 2 - 262, 470); w.mark(5, W / 2 - 260, 512)
    w.save("S-07")

    w = Wire()
    w.frame(seg=3, acts=[("카드 다시 고르기", "secondary"), ("다음", "primary")])
    w.text(W / 2, 100, "더 말해 볼래요?", 28, True, anchor="mm")
    w.text(W / 2, 136, "안 해도 돼요 · 고른 카드: 길을 잃었어요", 17, color=SOFT, anchor="mm")
    w.rect(112, 164, 800, 460, fill=CARD, line=LINE, r=24)
    w.circle(W / 2, 270, 90, fill="#EEF0F4", line=LINE, width=3)
    w.text(W / 2, 250, "마이크", 16, color=SOFT, anchor="mm")
    w.text(W / 2, 285, "누르고 말하기", 20, True, anchor="mm")
    w.rect(W / 2 - 230, 378, 460, 38, fill=BG, line=LINE, r=10, dash=True)
    w.text(W / 2, 397, "잘 못 들었어요. 한 번 더 말해 볼까요?", 15, color=SOFT, anchor="mm")
    tw = w.d.textlength("그런데 토끼를 잃어버렸어요.", font=font(24, True)) / S + 56
    w.pill(W / 2 - tw / 2, 438, "그런데 토끼를 잃어버렸어요.", 24, True, fill="#E4E7ED", pad=28, h=60)
    w.rect(W / 2 - 110, 522, 220, 40, fill=CARD, line=LINE, r=10, dash=True)
    w.link(W / 2, 530, "내 말 지우고 카드로", 16, anchor="ma")
    w.mark(6, W / 2 - 120, 100); w.mark(7, W / 2 - 90, 190); w.mark(8, W / 2 - 230, 378)
    w.mark(9, W / 2 - tw / 2, 438); w.mark(10, W / 2 - 110, 522); w.mark(11, 262, H - 104)
    w.mark(12, 536, H - 104)
    w.save("S-07-voice")


def s09():
    w = Wire()
    w.frame(seg=4, acts=[("순서 맞추기", "primary")])
    w.image_ph(162, RAIL + 16, 700, 320, "애니메이션 · 서버가 만든 MP4 반복 재생")
    lines = ["오늘 나는 숲에 갔어요.", "그런데 길을 잃었어요.", "그래서 나는 물어봤어요.",
             "그랬더니 친구를 만났어요."]
    x, y = 80, 430
    for i, s in enumerate(lines):
        tw = w.d.textlength(s, font=font(20, i == 1)) / S + 32
        if x + tw > W - 80:
            x, y = 80, y + 54
        w.pill(x, y, s, 20, i == 1, fill="#D6DAE2" if i == 1 else "#EEF0F4")
        x += tw + 12
    w.button(W / 2 - 212, 558, 200, 64, "들려주기", "secondary", size=20)
    w.button(W / 2 + 12, 558, 200, 64, "반복", "secondary", size=20)
    w.mark(1, 162, RAIL + 16); w.mark(2, 80, 430); w.mark(3, W / 2 - 212, 558)
    w.mark(4, W / 2 + 12, 558); w.mark(5, 400, H - 104)
    w.save("S-09")


def s10():
    w = Wire()
    w.frame(seg=4, acts=[("다시하기", "secondary"), ("다 했어요", "disabled")])
    w.text(W / 2, 108, "어떤 순서였을까요?", 30, True, anchor="mm")
    lines = ["그래서 나는 물어봤어요.", "오늘 나는 숲에 갔어요.", "그랬더니 친구를 만났어요.",
             "그런데 길을 잃었어요."]
    cw, gap = 220, 20
    x = W / 2 - (4 * cw + 3 * gap) / 2
    for i, s in enumerate(lines):
        picked, used = i == 0, i == 1
        w.rect(x, 150, cw, 220, fill="#EEF0F4" if used else CARD,
               line=DARK if picked else LINE, r=20, width=4 if picked else 2)
        w.text(x + 20, 230, s, 19, True, "#A3A9B7" if used else INK, width=cw - 40)
        x += cw + gap
    x = W / 2 - (4 * cw + 3 * gap) / 2
    for i in range(4):
        taken = i == 0
        w.rect(x, 410, cw, 120, fill=SEL if taken else CARD, line=DARK if not taken else LINE,
               r=20, dash=not taken)
        w.text(x + cw / 2, 470, "장면 1" if taken else str(i + 1), 22, True,
               INK if taken else SOFT, anchor="mm")
        x += cw + gap
    w.mark(1, W / 2 - 150, 108); w.mark(2, 42, 150); w.mark(3, 42, 410)
    w.mark(4, 262, H - 104); w.mark(5, 536, H - 104)
    w.save("S-10")


def s11():
    w = Wire()
    w.frame(seg=4, acts=[("다시 보기", "secondary"), ("새 이야기 만들기", "primary"),
                         ("처음으로", "secondary")])
    w.image_ph(262, RAIL + 16, 500, 320, "축하 삽화")
    w.text(W / 2, 450, "다 했어요!", 32, True, anchor="mm")
    w.rect(142, 500, 740, 56, fill="#FFF4D6", line="#E5BE5E", r=14, dash=True)
    w.text(166, 528, "로그인하면 이야기를 보관할 수 있어요. 체험은 1편 남았어요", 16, anchor="lm")
    w.link(790, 518, "로그인", 16)
    w.mark(1, 262, RAIL + 16); w.mark(2, W / 2 - 90, 450); w.mark(3, 134, H - 104)
    w.mark(4, 408, H - 104); w.mark(5, 682, H - 104); w.mark(6, 142, 500)
    w.save("S-11")


def s12():
    w = Wire()
    w.frame(title="내 이야기", speech=False)
    w.rect(32, 88, W - 64, 44, fill="#FFF4D6", line="#E5BE5E", r=12, dash=True)
    w.text(52, 110, "앱을 닫으면 이야기가 사라져요", 16, anchor="lm")
    w.rect(32, 148, W - 64, 480, fill=CARD, line=LINE, r=20)
    for i, (t, d) in enumerate([("숲에 간 날", "2026-09-30"), ("바다에 간 날", "2026-09-29"),
                                ("학교에 간 날", "2026-09-28")]):
        y = 164 + i * 104
        if i:
            w.line([(52, y - 8), (W - 52, y - 8)], FAINT, 1)
        w.image_ph(52, y, 88, 88, r=12)
        w.text(164, y + 26, t, 20, True, anchor="lm")
        w.text(164, y + 62, f"{d}에 만들었어요", 16, color=SOFT, anchor="lm")
    w.mark(1, 32, 88); w.mark(2, 32, 148)
    w.save("S-12")

    w = Wire()
    w.frame(title="내 이야기", speech=False)
    w.rect(212, 150, 600, 400, fill=CARD, line=LINE, r=24, dash=True)
    w.text(W / 2, 260, "아직 이야기가 없어요", 26, True, anchor="mm")
    w.text(W / 2, 305, "상상한 이야기를 만들어 보세요", 17, color=SOFT, anchor="mm")
    w.button(W / 2 - 140, 360, 280, 88, "이야기 만들기", "primary")
    w.mark(3, 212, 150)
    w.save("S-12-empty")


def s13():
    w = Wire(adult=True)
    w.frame(title="어른 설정", speech=False, acts=[("닫기", "secondary")])
    rows = [("계정", "로그인 없이 사용 중입니다", "link:로그인"),
            ("지원 수준", "아동의 사용을 돕는 수준을 선택하세요", "seg"),
            ("소리 전체 끄기", "모든 음성과 효과음을 끕니다. 교실에서 쓸 때 켜세요", "tog"),
            ("목소리로 덧붙이기", "아이가 마이크로 한마디 덧붙입니다. 목소리는 브라우저의 음성 인식 서버로 갑니다", "tog"),
            ("원본 그림 보관", "분석 후에도 원본 이미지를 보관합니다", "tog"),
            ("진단 모드", "단계명과 소요 시간, 엔진 이름을 표시합니다", "tog"),
            ("숲에 간 날", "2026-09-30에 만들었어요", "link:삭제")]
    w.rect(24, 88, W - 48, 7 * 72, fill=CARD, line=LINE, r=16)
    for i, (name, desc, ctl) in enumerate(rows):
        y = 88 + i * 72
        if i:
            w.line([(40, y), (W - 40, y)], FAINT, 1)
        w.text(44, y + 24, name, 17, True, anchor="lm")
        w.text(44, y + 50, desc, 14, color=SOFT, anchor="lm")
        if ctl == "tog":
            w.toggle(W - 100, y + 21)
        elif ctl == "seg":
            for k in range(3):
                w.rect(W - 196 + k * 52, y + 16, 48, 40, fill=SEL if k == 1 else CARD,
                       line=LINE, r=10)
                w.text(W - 172 + k * 52, y + 36, str(k + 1), 17, True, anchor="mm")
        else:
            w.link(W - 44 - w.d.textlength(ctl[5:], font=font(16, True)) / S, y + 26, ctl[5:], 16,
                   "#A93E51" if ctl.endswith("삭제") else INK)
        w.mark(i + 1, 30, y + 10)
    w.mark(8, W / 2 - 104, H - 92)
    w.save("S-13")


def s14():
    w = Wire(adult=True)
    w.frame(back=False, speech=False, acts=[("바로 시작하기", "primary")])
    w.image_ph(312, RAIL + 16, 400, 240, "캐릭터 삽화")
    w.text(W / 2, 370, "그림이 이야기가 돼요", 30, True, anchor="mm")
    w.text(W / 2, 414, "종이에 그린 그림을 찍으면 움직이는 이야기가 됩니다.", 17, color=SOFT, anchor="mm")
    w.text(W / 2, 442, "로그인 없이 2편까지 만들어 볼 수 있어요.", 17, color=SOFT, anchor="mm")
    w.text(W / 2 - 150, 540, "계정이 있으신가요?", 16, color=SOFT)
    w.link(W / 2 + 4, 540, "로그인", 16)
    w.text(W / 2 + 70, 540, "·", 16, color=SOFT)
    w.link(W / 2 + 88, 540, "회원가입", 16)
    w.text(W / 2, 596, "계정은 보호자와 교사의 것입니다. 아이 정보는 받지 않습니다.", 14, color=SOFT,
           anchor="mm")
    w.mark(1, 312, RAIL + 16); w.mark(2, W / 2 - 170, 370); w.mark(3, W / 2 - 230, 414)
    w.mark(4, W / 2 - 104, H - 92); w.mark(5, W / 2 - 166, 548); w.mark(6, W / 2 - 250, 596)
    w.save("S-14")


def s15():
    w = Wire(adult=True)
    w.frame(title="로그인", speech=False, acts=[("로그인", "disabled")])
    w.button(24, 92, 480, 56, "카카오 로그인", "secondary")
    w.button(520, 92, 480, 56, "Google 로그인", "secondary")
    w.text(24, 166, "카카오·구글에서는 회원번호만 받습니다. 이름·이메일·사진은 받지 않아요. "
           "처음이시면 회원가입 화면에서 약관에 동의한 뒤 시작합니다.", 15, color=SOFT, width=976)
    w.rect(16, 222, W - 32, 222, fill=BG, line=LINE, r=14, dash=True)
    w.text(W / 2, 244, "또는 이메일로", 15, color=SOFT, anchor="mm")
    w.field(40, 262, W - 80, "이메일", "보호자 또는 교사 이메일")
    w.field(40, 346, W - 80, "비밀번호", "비밀번호")
    w.rect(24, 460, W - 48, 44, fill="#FDE3E7", line="#E8697D", r=12, dash=True)
    w.text(44, 482, "이메일이나 비밀번호가 맞지 않아요", 16, anchor="lm")
    w.text(W / 2 - 200, 590, "계정이 없으신가요?", 16, color=SOFT)
    w.link(W / 2 - 42, 590, "회원가입", 16)
    w.text(W / 2 + 30, 590, "·", 16, color=SOFT)
    w.link(W / 2 + 48, 590, "로그인 없이 시작", 16)
    w.mark(1, 24, 92); w.mark(2, 24, 170); w.mark(3, 16, 222); w.mark(4, 24, 460)
    w.mark(5, W / 2 - 104, H - 92); w.mark(6, W / 2 - 216, 598)
    w.save("S-15")

    w = Wire(adult=True)
    w.frame(back=False, title="로그인", speech=False,
            acts=[("로그인으로 돌아가기", "primary", True)])
    w.text(W / 2, 300, "카카오 계정을 확인하고 있어요", 20, color=SOFT, anchor="mm")
    w.rect(162, 360, 700, 52, fill="#FDE3E7", line="#E8697D", r=12, dash=True)
    w.text(W / 2, 386, "카카오 로그인을 마치지 못했습니다. 다시 시도해 주세요", 16, anchor="mm")
    w.mark(1, W / 2 - 150, 300); w.mark(2, 162, 360); w.mark(3, W / 2 - 104, H - 92)
    w.save("S-15-callback")


def s16():
    w = Wire(adult=True)
    w.frame(title="회원가입", speech=False, acts=[("가입하기", "disabled")])
    w.rect(24, 86, W - 48, 42, fill="#FFF4D6", line="#E5BE5E", r=12, dash=True)
    w.text(44, 107, "처음 오셨네요. 약관에 동의하고 카카오 계정으로 가입해 주세요", 15, anchor="lm")
    w.rect(24, 146, 24, 24, fill=CARD, line=DARK, r=5)
    w.text(60, 158, "이용약관과 개인정보 처리방침에 동의합니다", 17, True, anchor="lm")
    w.button(24, 186, 480, 52, "카카오로 가입", "disabled")
    w.button(520, 186, 480, 52, "Google로 가입", "disabled")
    w.text(W / 2, 258, "또는 이메일로", 15, color=SOFT, anchor="mm")
    w.field(40, 272, W - 80, "이메일", "보호자 또는 교사 이메일")
    w.field(40, 350, W - 80, "비밀번호", "8자 이상", note="8자 이상으로 지어 주세요")
    w.field(40, 446, W - 80, "비밀번호 확인", "다시 한 번")
    w.text(W / 2 - 130, 548, "이미 계정이 있으신가요?", 16, color=SOFT)
    w.link(W / 2 + 60, 548, "로그인", 16)
    w.text(W / 2, 596, "아이의 이름과 나이, 사진은 계정에 저장하지 않습니다. 카카오·구글에서는 회원번호만 받습니다",
           13, color=SOFT, anchor="mm")
    w.mark(1, 24, 86); w.mark(2, 24, 146); w.mark(3, 24, 186); w.mark(4, 24, 282)
    w.mark(5, W / 2 - 104, H - 92); w.mark(6, W / 2 - 146, 556); w.mark(7, W / 2 - 272, 596)
    w.save("S-16")


def e01():
    w = Wire()
    w.frame(back=False, acts=[("다시 찍기", "primary"), ("처음으로", "secondary")])
    w.image_ph(312, RAIL + 16, 400, 280, "갸웃하는 얼굴 삽화")
    w.text(W / 2, 420, "그림에서 친구를 못 찾았어요", 30, True, anchor="mm")
    w.text(W / 2, 466, "사람을 한 명만 크게 그려 볼까요?", 19, color=SOFT, anchor="mm")
    w.mark(1, 312, RAIL + 16); w.mark(2, W / 2 - 220, 420); w.mark(3, W / 2 - 160, 466)
    w.mark(4, 262, H - 104); w.mark(5, 536, H - 104)
    w.save("E-01")


if __name__ == "__main__":
    common()
    s01(); s02(); s03(); s03d()
    waiting("S-04", 2, "친구를 만들고 있어요", "대기 삽화 (둥실)", "running · 2140ms · agent")
    s05(); s06(); s06(blank=True); s07()
    waiting("S-08", 3, "이야기를 쓰고 있어요", "연필 삽화 (둥실)", "running · 24s · agent")
    s09(); s10(); s11(); s12(); s13(); s14(); s15(); s16(); e01()
