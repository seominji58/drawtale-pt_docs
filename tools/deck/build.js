// DrawTale 중간 발표 덱 (공통 영역 채움, 개인 영역 공란)
// node build.js <출력 경로.pptx>
const pptxgen = require("pptxgenjs");
const path = require("path");
const R = require("./research.json");   // 조사 결과: 수치 · 문장 · 출처

const OUT = process.argv[2] || "DrawTale_중간발표.pptx";
const ASSET = (f) => path.join(__dirname, f);

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.333 × 7.5 in
pres.title = "DrawTale 중간 발표";
pres.author = "DrawTale 팀";

// ── 색 · 글꼴 (앱 토큰과 같은 계열) ──
const C = {
  ink: "39405C", soft: "5A6282", faint: "8A91AA", accent: "4C5CC4", grape: "7386F5",
  grapeLt: "EDF0FE", milk: "E6EEFB", cloud: "F4F7FD", card: "FDFEFF", line: "DCE3F6",
  place: "7FB2F0", problem: "F4909F", action: "74CDAE", result: "F5C46B",
  placeLt: "DCEBFC", problemLt: "FDE3E7", actionLt: "D9F2E9", resultLt: "FDEFD2",
  butter: "FFEA99", white: "FDFEFF",
};
const F = "Malgun Gothic";
const W = 13.333, H = 7.5, MX = 0.7;

let pageNo = 0;
const shadow = () => ({ type: "outer", color: "5364CE", opacity: 0.13, blur: 12, offset: 4, angle: 90 });

function base(bg = "bg-light.jpg", { number = true } = {}) {
  const s = pres.addSlide();
  s.background = { path: ASSET(bg) };
  pageNo += 1;
  if (number) {
    s.addText(String(pageNo), { x: W - 1.1, y: H - 0.55, w: 0.5, h: 0.3, fontFace: F, fontSize: 10,
      color: C.faint, align: "right", margin: 0, isTextBox: true });
  }
  return s;
}

function head(s, eyebrow, title, { y = 0.5, color = C.ink, eyeColor = C.accent, w = W - 2 * MX } = {}) {
  s.addText(eyebrow, { x: MX, y, w, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: eyeColor,
    margin: 0, isTextBox: true });
  s.addText(title, { x: MX, y: y + 0.38, w, h: 0.8, fontFace: F, fontSize: 30, bold: true, color,
    margin: 0, valign: "top", isTextBox: true });
}

function card(s, x, y, w, h, fill = C.card, opts = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: opts.r ?? 0.22,
    fill: { color: fill }, line: { type: "none" }, shadow: opts.flat ? undefined : shadow() });
}

function text(s, str, x, y, w, h, o = {}) {
  s.addText(str, { x, y, w, h, fontFace: F, fontSize: o.size ?? 14, bold: !!o.bold, color: o.color ?? C.ink,
    align: o.align ?? "left", valign: o.valign ?? "top", margin: o.margin ?? 0, lineSpacingMultiple: o.ls ?? 1.15,
    italic: !!o.italic, isTextBox: true, ...(o.extra || {}) });
}

function pill(s, str, x, y, w, o = {}) {
  const h = o.h ?? 0.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: h / 2,
    fill: { color: o.fill ?? C.grapeLt }, line: { type: "none" } });
  text(s, str, x, y, w, h, { size: o.size ?? 12, bold: true, color: o.color ?? C.accent, align: "center",
    valign: "middle" });
}

function arrow(s, x, y, w = 0.36, color = "C9D2F7", h = 0.22) {
  s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color }, line: { type: "none" } });
}
function downArrow(s, x, y, color = "C9D2F7") {
  s.addShape(pres.shapes.DOWN_ARROW, { x, y, w: 0.26, h: 0.26, fill: { color }, line: { type: "none" } });
}

function tile(s, x, y, size, color, label, rot = 0, fs = 16) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: size, h: size, rectRadius: size * 0.26, rotate: rot,
    fill: { color }, line: { type: "none" }, shadow: shadow() });
  if (label) s.addText(label, { x, y, w: size, h: size, rotate: rot, fontFace: F, fontSize: fs, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
}

function bubble(s, x, y, d, color, transparency = 40) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color, transparency }, line: { type: "none" } });
}

function source(s, str) {
  text(s, str, MX, H - 0.62, W - 2 * MX - 0.8, 0.4, { size: 9, color: C.faint, valign: "bottom", ls: 1.05 });
}

function notes(s, str) { s.addNotes(str); }

// ─────────────────────────── 1. 표지 ───────────────────────────
{
  const s = base("bg-milk.jpg", { number: false });
  text(s, "옛날 옛적에, 그림 한 장이 이야기가 되었어요", MX, 1.55, 6.6, 0.4, { size: 16, bold: true, color: C.accent });
  text(s, "DrawTale", MX, 2.05, 6.6, 1.1, { size: 60, bold: true });
  text(s, "한칸이야기", MX, 3.1, 6.6, 0.5, { size: 22, bold: true, color: C.grape });
  text(s, "아이의 그림이 주인공이 되고,\n아이의 선택으로 완성되는 이야기", MX, 3.85, 6.6, 1.0, { size: 20, color: C.ink, ls: 1.3 });
  text(s, "[팀 이름]  ·  2026. 10. 02  ·  캡스톤 중간 발표", MX, 5.55, 6.6, 0.4, { size: 14, color: C.soft });

  tile(s, 8.0, 1.55, 2.1, C.place, "장소", -6, 22);
  tile(s, 10.35, 1.8, 2.1, C.problem, "문제", 5, 22);
  tile(s, 7.85, 3.9, 2.1, C.action, "행동", 4, 22);
  tile(s, 10.2, 4.15, 2.1, C.result, "결과", -4, 22);
  bubble(s, 12.35, 1.2, 0.45, C.white, 0);
  bubble(s, 7.55, 1.3, 0.28, C.problem, 50);
  bubble(s, 12.5, 6.3, 0.25, C.place, 40);
  notes(s, "안녕하세요. 저희는 아이가 직접 그린 그림이 이야기의 주인공이 되는 서비스, DrawTale을 만들고 있습니다. " +
    "오른쪽 네 칸은 아이가 이야기를 만들 때 고르는 장소, 문제, 행동, 결과를 뜻합니다.");
}

// ─────────────────────────── 2. 목차 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "오늘 들려드릴 이야기", "왜 만들었고, 무엇을 만들기로 했고, 지난 한 달 무엇을 했는지");
  const parts = [
    ["PART A", "왜 만들었나", "배경조사에서 서비스 방향까지", C.place],
    ["PART B", "지난 한 달", "9/7 ~ 10/2, 아이디어에서 프로젝트로", C.problem],
    ["PART C", "영역별 작업", "Frontend · Backend · AI Runtime · AI Model", C.action],
    ["PART D", "결과와 다음", "10/2까지의 결과와 다음 단계", C.result],
  ];
  const cw = (W - 2 * MX - 3 * 0.35) / 4;
  parts.forEach(([p, t, d, col], i) => {
    const x = MX + i * (cw + 0.35), y = 2.3;
    card(s, x, y, cw, 3.9);
    tile(s, x + 0.4, y + 0.45, 0.95, col, String(i + 1), 0, 26);
    text(s, p, x + 0.4, y + 1.75, cw - 0.8, 0.35, { size: 13, bold: true, color: C.accent });
    text(s, t, x + 0.4, y + 2.12, cw - 0.8, 0.5, { size: 22, bold: true });
    text(s, d, x + 0.4, y + 2.75, cw - 0.8, 0.9, { size: 14, color: C.soft, ls: 1.3 });
  });
  notes(s, "발표는 네 부분입니다. 먼저 왜 이 서비스를 만들게 되었는지 배경조사부터 말씀드리고, 지난 한 달 동안 한 일, 영역별 작업, 그리고 지금까지의 결과와 다음 단계 순서로 이어가겠습니다.");
}

// ─────────────────────────── 3. 사회적 배경 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 배경조사 ① 사회적 배경", "학습 속도가 느린 아이들은 어디에 있을까?");

  // 왼쪽: 수치
  const st = R.social.stats;
  st.forEach((m, i) => {
    const y = 1.95 + i * 1.62;
    card(s, MX, y, 3.7, 1.42);
    text(s, m.value, MX + 0.3, y + 0.18, 3.1, 0.62, { size: 30, bold: true, color: C.accent });
    text(s, m.label, MX + 0.3, y + 0.82, 3.1, 0.5, { size: 12, color: C.soft, ls: 1.2 });
  });

  // 가운데 · 오른쪽: 선행연구 두 편
  R.social.studies.forEach((r, i) => {
    const x = MX + 4.05 + i * 4.1, y = 1.95;
    card(s, x, y, 3.85, 3.1);
    pill(s, r.tag, x + 0.3, y + 0.3, 1.9);
    text(s, r.finding, x + 0.3, y + 0.9, 3.25, 1.6, { size: 14, bold: true, ls: 1.4 });
    text(s, r.cite, x + 0.3, y + 2.45, 3.25, 0.5, { size: 10, color: C.faint, ls: 1.15 });
  });

  // 아래: 발견한 문제
  const flow = ["아이마다 다른\n학습 속도", "기존 학습 방식에\n맞추기 어려움", "아이에게 맞는\n표현 · 참여 방식 필요", "부모도 아이의 생각을\n발견하는 경험 필요"];
  const fw = 1.72, gx = 0.34, fx0 = MX + 4.05, fy = 5.28;
  flow.forEach((f, i) => {
    const x = fx0 + i * (fw + gx);
    card(s, x, fy, fw, 0.92, i === 3 ? C.butter : C.grapeLt, { flat: true });
    text(s, f, x, fy, fw, 0.92, { size: 11.5, bold: true, align: "center", valign: "middle", ls: 1.2 });
    if (i < 3) arrow(s, x + fw + 0.02, fy + 0.35, 0.3);
  });
  source(s, R.social.source);
  notes(s, R.social.notes);
}

// ─────────────────────────── 4. 교육적 배경 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 배경조사 ② 교육적 배경", "아이에게 글 이외의 표현 방식을 줄 수 없을까?");

  card(s, MX, 1.95, 5.2, 4.3);
  pill(s, R.edu.tag, MX + 0.35, 2.3, 2.4);
  text(s, R.edu.finding, MX + 0.35, 2.9, 4.5, 1.9, { size: 17, bold: true, ls: 1.4 });
  text(s, R.edu.detail, MX + 0.35, 4.55, 4.5, 1.1, { size: 13, color: C.soft, ls: 1.35 });
  text(s, R.edu.cite, MX + 0.35, 5.7, 4.5, 0.45, { size: 10, color: C.faint });

  const x0 = MX + 5.6, rw = W - MX - x0;
  text(s, "학습을 이렇게만 보지 않고", x0, 2.0, rw, 0.35, { size: 13, bold: true, color: C.faint });
  const oldF = ["읽기", "문제", "정답"];
  oldF.forEach((t, i) => {
    const x = x0 + i * 2.2;
    card(s, x, 2.45, 1.75, 0.8, "EEF0F4", { flat: true });
    text(s, t, x, 2.45, 1.75, 0.8, { size: 17, bold: true, color: C.soft, align: "center", valign: "middle" });
    if (i < 2) arrow(s, x + 1.8, 2.74, 0.34, "C3C8D6");
  });
  text(s, "참여하는 경험으로 접근합니다", x0, 3.65, rw, 0.35, { size: 13, bold: true, color: C.accent });
  const newF = [["그리기", C.place], ["표현", C.problem], ["선택", C.action], ["이야기 구성", C.result]];
  const nw = 1.42;
  newF.forEach(([t, col], i) => {
    const x = x0 + i * (nw + 0.28);
    tile(s, x, 4.1, nw, col, t, 0, t.length > 3 ? 14 : 17);
    if (i < 3) arrow(s, x + nw + 0.01, 4.7, 0.26);
  });
  card(s, x0, 5.8, rw, 0.62, C.butter, { flat: true });
  text(s, "그림이 창의성을 높인다고 단정하지 않습니다. 선행연구를 근거로 ‘그림 + 이야기’라는 서비스 방식을 골랐습니다.",
    x0 + 0.25, 5.8, rw - 0.5, 0.62, { size: 12, bold: true, valign: "middle" });
  source(s, R.edu.source);
  notes(s, R.edu.notes);
}

// ─────────────────────────── 5. 기술 조사 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 배경조사 ③ 기술 조사", "아이의 그림을 실제로 움직일 수 있을까?");
  const steps = [["char-plain-sm.jpg", "아이의 그림"], ["char-bbox-sm.jpg", "캐릭터 찾기\nDetection"],
    ["char-mask-sm.jpg", "영역 떼어 내기\nSegmentation"], ["char-joints-sm.jpg", "관절 찾기\nJoint Detection"]];
  const iw = 1.6, ih = iw * 602 / 508, gap = 0.42;
  steps.forEach(([img, label], i) => {
    const x = MX + i * (iw + gap), y = 1.95;
    card(s, x - 0.12, y - 0.12, iw + 0.24, ih + 1.05);
    s.addImage({ path: ASSET(img), x, y, w: iw, h: ih, rounding: false });
    text(s, label, x, y + ih + 0.1, iw, 0.75, { size: 12.5, bold: true, align: "center", ls: 1.15 });
    if (i < 3) arrow(s, x + iw + 0.12, y + ih / 2 - 0.1, 0.26);
  });
  const rx = MX + 4 * iw + 3 * gap + 0.35, rw = W - MX - rx;
  card(s, MX - 0.12, 4.98, 4 * iw + 3 * gap + 0.24, 1.4, C.card);
  text(s, R.tech.pipeline, MX + 0.2, 5.05, 4 * iw + 3 * gap - 0.4, 1.26, { size: 12.5, color: C.soft, ls: 1.35, valign: "middle" });
  card(s, rx, 1.83, rw, 2.25);
  text(s, R.tech.bigValue, rx + 0.35, 2.05, rw - 0.7, 0.8, { size: 36, bold: true, color: C.accent });
  text(s, R.tech.bigLabel, rx + 0.35, 2.85, rw - 0.7, 1.1, { size: 13, color: C.soft, ls: 1.3 });
  card(s, rx, 4.28, rw, 2.02, C.grapeLt, { flat: true });
  text(s, "그래서 우리는", rx + 0.35, 4.45, rw - 0.7, 0.35, { size: 12, bold: true, color: C.accent });
  text(s, "아이의 그림을 이야기 속에서\n실제로 움직이는 주인공으로\n쓸 수 있겠다고 판단했습니다.", rx + 0.35, 4.85, rw - 0.7, 1.35,
    { size: 16, bold: true, ls: 1.35 });
  source(s, R.tech.source);
  notes(s, R.tech.notes);
}

// ─────────────────────────── 6. 기존 서비스 조사 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 기존 서비스 조사", "그런데, 이미 비슷한 서비스가 있지 않을까?");
  const cols = ["조사 대상", "그림 입력", "애니메이션", "이야기", "아이의 선택", "관절 직접 보정"];
  const mark = (v) => ({ O: "●", X: "—", 일부: "◐", 제한적: "◐" }[v] ?? v);
  const hdr = cols.map((c) => ({ text: c, options: { bold: true, color: C.accent, fill: { color: C.grapeLt },
    align: "center", valign: "middle" } }));
  const rows = R.compare.rows.map((r) => {
    const us = r.name === "DrawTale";
    return [
      { text: r.name, options: { bold: true, align: "left", color: us ? C.accent : C.ink, fill: { color: us ? C.butter : C.card } } },
      ...r.values.map((v) => ({ text: `${mark(v)}  ${v === "O" || v === "X" ? "" : v}`.trim(),
        options: { align: "center", color: v === "X" ? C.faint : C.ink, bold: us, fill: { color: us ? C.butter : C.card } } })),
    ];
  });
  s.addTable([hdr, ...rows], { x: MX, y: 1.95, w: W - 2 * MX, colW: [2.9, 1.8, 1.8, 1.8, 1.8, 1.833],
    fontFace: F, fontSize: 14, rowH: 0.62, border: { type: "solid", pt: 0.75, color: C.line }, margin: [0.05, 0.15, 0.05, 0.15] });
  text(s, "●  있음      ◐  일부 · 제한적      —  없음", MX, 6.05, 6, 0.3, { size: 11, color: C.soft });
  source(s, R.compare.source);
  notes(s, R.compare.notes);
}

// ─────────────────────────── 7. 발견한 한계 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 조사에서 발견한 한계", "그림을 움직이는 서비스도, 그림으로 이야기를 만드는 서비스도 이미 있었습니다");
  const cw = (W - 2 * MX - 0.9) / 2;
  const lx = MX, rx = MX + cw + 0.9, y = 2.35, ch = 2.8;
  text(s, R.limit.quote, MX, 5.33, W - 2 * MX, 0.45, { size: 12, color: C.soft, italic: true });
  source(s, "출처: [12] The Alan Turing Institute (2025). Understanding the Impacts of Generative AI Use on Children");
  card(s, lx, y, cw, ch, "F1F2F6", { flat: true });
  text(s, "AI가 만들어 주는 결과", lx + 0.4, y + 0.35, cw - 0.8, 0.45, { size: 18, bold: true, color: C.soft });
  ["그림을 넣으면", "AI가 예쁜 영상 하나를 만들고", "아이는 결과를 감상합니다"].forEach((t, i) => {
    text(s, `${i + 1}   ${t}`, lx + 0.4, y + 1.05 + i * 0.6, cw - 0.8, 0.5, { size: 15, color: C.soft });
  });
  card(s, rx, y, cw, ch);
  text(s, "아이가 이어 가는 과정", rx + 0.4, y + 0.35, cw - 0.8, 0.45, { size: 18, bold: true, color: C.accent });
  ["내 그림이 주인공이 되고", "다음에 무슨 일이 일어날지 아이가 고르고", "고른 것이 모여 나만의 이야기가 됩니다"].forEach((t, i) => {
    text(s, `${i + 1}   ${t}`, rx + 0.4, y + 1.05 + i * 0.6, cw - 0.8, 0.5, { size: 15, bold: true });
  });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: lx + cw + 0.2, y: y + ch / 2 - 0.2, w: 0.5, h: 0.4, fill: { color: C.grape }, line: { type: "none" } });
  card(s, MX, 5.95, W - 2 * MX, 0.72, C.butter, { flat: true });
  text(s, "우리가 집중한 것은 AI가 결과물을 얼마나 화려하게 만드느냐가 아니라, 아이가 만드는 과정에 얼마나 계속 참여하느냐입니다.",
    MX + 0.35, 5.95, W - 2 * MX - 0.7, 0.72, { size: 14, bold: true, valign: "middle" });
  notes(s, "조사해 보니 그림을 AI로 움직이는 서비스는 물론, 그림으로 이야기를 만드는 서비스까지 이미 있었습니다. " +
    "그래서 그림을 넣으면 AI가 예쁜 영상 하나를 만들어 주는 것만으로는 부족하다고 판단했습니다. " +
    "저희가 집중한 것은 결과물의 화려함이 아니라, 아이가 만드는 과정에 얼마나 계속 참여하느냐입니다.");
}

// ─────────────────────────── 8. 강조: 질문 ───────────────────────────
{
  const s = base("bg-grape.jpg");
  pill(s, "여기서 우리가 발견한 가능성", MX, 1.6, 3.4, { fill: C.butter, color: C.ink, size: 13, h: 0.45 });
  text(s, "기존 기술", MX, 2.5, 6, 0.4, { size: 15, bold: true, color: "D6DCFB" });
  text(s, "“그림을 움직이게 한다.”", MX, 2.9, 11, 0.8, { size: 28, bold: true, color: "D6DCFB" });
  text(s, "DrawTale의 질문", MX, 4.0, 6, 0.4, { size: 15, bold: true, color: C.butter });
  text(s, "“움직이게 된 내 그림이\n내 이야기의 주인공이 된다면?”", MX, 4.4, 11, 1.7, { size: 38, bold: true, color: C.white, ls: 1.25 });
  notes(s, "기존 기술은 그림을 움직이게 하는 데서 멈춥니다. 저희는 여기서 한 걸음 더 나아가, 움직이게 된 내 그림이 내 이야기의 주인공이 된다면 어떨까 하는 질문을 던졌습니다.");
}

// ─────────────────────────── 9. 조사 → 기획 방향 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 조사 결과를 한 번에", "조사에서 서비스 방향이 나오기까지");
  const rows = [
    ["사회적 배경", "느린학습자와 부모가 겪는 학습 · 지원의 어려움", C.place],
    ["교육적 배경", "그림과 이야기로 아이가 생각을 표현하는 Narrative 활동의 가능성", C.problem],
    ["기술 조사", "AI로 손그림 캐릭터 · 관절을 인식하고 움직일 수 있다", C.action],
    ["기존 서비스", "그림 애니메이션과 AI 이야기 서비스는 이미 있다", C.result],
    ["발견한 한계", "AI가 결과 대부분을 만들면 아이의 참여가 한 번에 끝나기 쉽다", C.grape],
  ];
  const rw = 8.3, rh = 0.74, gap = 0.26;
  rows.forEach(([k, v, col], i) => {
    const y = 1.85 + i * (rh + gap);
    card(s, MX, y, rw, rh, C.card);
    s.addShape(pres.shapes.OVAL, { x: MX + 0.25, y: y + 0.17, w: 0.34, h: 0.34, fill: { color: col }, line: { type: "none" } });
    text(s, k, MX + 0.8, y, 1.7, rh, { size: 14, bold: true, valign: "middle" });
    text(s, v, MX + 2.5, y, rw - 2.7, rh, { size: 13.5, color: C.soft, valign: "middle" });
  });
  const bx = MX + rw + 0.5, bw = W - MX - bx;
  s.addShape(pres.shapes.RIGHT_ARROW, { x: MX + rw + 0.08, y: 3.85, w: 0.34, h: 0.36, fill: { color: C.grape }, line: { type: "none" } });
  card(s, bx, 1.85, bw, 4.74, C.accent);
  text(s, "DrawTale", bx + 0.35, 2.15, bw - 0.7, 0.5, { size: 22, bold: true, color: C.butter });
  text(s, "AI가 아이 대신 창작하기보다,\n아이의 그림과 선택이\n이야기의 중심이 되는 서비스", bx + 0.35, 2.85, bw - 0.7, 2.0,
    { size: 17, bold: true, color: C.white, ls: 1.45 });
  notes(s, "지금까지의 조사를 한 번에 묶으면 이렇습니다. 사회적 배경, 교육적 배경, 기술 조사, 기존 서비스 조사를 거쳐, AI가 결과 대부분을 만들어 주면 아이의 참여가 한 번에 끝나기 쉽다는 한계를 발견했습니다. " +
    "그래서 DrawTale은 AI가 아이 대신 창작하는 서비스가 아니라, 아이의 그림과 선택이 이야기의 중심이 되는 서비스로 방향을 정했습니다.");
}

// ─────────────────────────── 10. 서비스 개요 ───────────────────────────
{
  const s = base("bg-milk.jpg");
  head(s, "PART A · 서비스 개요", "DrawTale을 소개합니다");
  card(s, MX, 1.95, W - 2 * MX, 1.35);
  text(s, "아이가 직접 그린 캐릭터를 AI가 인식하고 움직이는 캐릭터로 바꾸어,\n아이의 선택에 따라 자신만의 이야기를 완성하는 AI 기반 인터랙티브 스토리 서비스",
    MX + 0.4, 1.95, W - 2 * MX - 0.8, 1.35, { size: 17, bold: true, valign: "middle", ls: 1.4 });
  const cw = (W - 2 * MX - 0.4) / 2, y = 3.6;
  card(s, MX, y, cw, 2.75);
  pill(s, "서비스 대상", MX + 0.35, y + 0.35, 1.6);
  text(s, "학습 속도가 느리거나 글 중심의 표현이 어려운 아동을 포함해, 그림과 이야기로 자신의 생각을 표현하고 싶은 모든 아동",
    MX + 0.35, y + 0.95, cw - 0.7, 1.6, { size: 15, ls: 1.45 });
  const x2 = MX + cw + 0.4;
  card(s, x2, y, cw, 2.75);
  pill(s, "서비스 목적", x2 + 0.35, y + 0.35, 1.6);
  text(s, [
    { text: "아이에게  ", options: { bold: true, color: C.accent } },
    { text: "내 그림이 인정받고 살아 움직이는 창작 · 표현 경험", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "부모에게  ", options: { bold: true, color: C.accent } },
    { text: "정답 여부보다 아이가 무엇을 그리고 어떤 이야기를 고르는지 함께 바라보는 경험" },
  ], x2 + 0.35, y + 0.95, cw - 0.7, 1.7, { size: 15, ls: 1.4 });
  notes(s, "이제 DrawTale을 소개합니다. 아이가 직접 그린 캐릭터를 AI가 인식해 움직이는 캐릭터로 바꾸고, 아이의 선택에 따라 자신만의 이야기를 완성하는 서비스입니다. " +
    "아이에게는 내 그림이 인정받고 살아 움직이는 경험을, 부모에게는 정답보다 아이가 무엇을 그리고 무엇을 고르는지 함께 바라보는 경험을 주고자 합니다.");
}

// ─────────────────────────── 11. 기존 방식에서 DrawTale로 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART A · 서비스 흐름", "움직이는 그림에서, 내가 만들어 가는 이야기로");
  const chipRow = (items, y, fill, color, w, bold) => {
    items.forEach((t, i) => {
      const x = MX + 1.9 + i * (w + 0.3);
      card(s, x, y, w, 0.78, fill, { flat: true });
      text(s, t, x, y, w, 0.78, { size: 12.5, bold, color, align: "center", valign: "middle", ls: 1.15 });
      if (i < items.length - 1) arrow(s, x + w + 0.03, y + 0.29, 0.24);
    });
  };
  text(s, "기존\nAnimated Drawing\n계열 경험", MX, 1.95, 1.8, 0.95, { size: 12, bold: true, color: C.faint, ls: 1.2 });
  chipRow(["아이 그림 업로드", "AI 분석", "캐릭터 애니메이션", "결과 감상"], 2.05, "EEF0F4", C.soft, 2.1, false);

  text(s, "DrawTale", MX, 3.35, 1.8, 0.4, { size: 16, bold: true, color: C.accent });
  const dt1 = ["그림 그리기", "AI 캐릭터 인식", "관절 확인 · 보정\n(어른과 함께)", "내 그림 그대로\n애니메이션"];
  const dt2 = ["이야기 상황", "아이가 선택", "선택에 따라\n이야기가 이어짐", "나만의 이야기 완성"];
  chipRow(dt1, 3.3, C.grapeLt, C.ink, 2.1, true);
  chipRow(dt2, 4.35, C.grapeLt, C.ink, 2.1, true);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX + 1.9 + 3 * 2.4, y: 4.35, w: 2.1, h: 0.78, rectRadius: 0.22,
    fill: { color: C.butter }, line: { type: "none" } });
  text(s, "나만의 이야기 완성", MX + 1.9 + 3 * 2.4, 4.35, 2.1, 0.78, { size: 12.5, bold: true, align: "center", valign: "middle" });

  card(s, MX, 5.55, W - 2 * MX, 0.9, C.card);
  text(s, [
    { text: "AI 결과물은 끝이 아니라 시작점입니다.  ", options: { bold: true, color: C.accent } },
    { text: "AI가 아이 대신 이야기를 완성하지 않고, 아이의 그림을 주인공으로 만들어 아이가 선택으로 계속 참여하게 합니다." },
  ], MX + 0.4, 5.55, W - 2 * MX - 0.8, 0.9, { size: 14, valign: "middle" });
  notes(s, "기존 방식은 그림을 올리면 AI가 분석해 애니메이션을 만들고, 아이는 결과를 감상하는 데서 끝납니다. " +
    "DrawTale에서는 캐릭터가 움직인 다음부터가 시작입니다. 이야기 상황이 주어지고, 아이가 다음에 무슨 일이 일어날지 고르고, 그 선택이 모여 나만의 이야기가 됩니다. " +
    "관절 확인과 보정은 필요할 때 선생님이나 보호자가 함께 도와줍니다.");
}

// ─────────────────────────── 12. 제공하고 싶은 경험 ───────────────────────────
{
  const s = base("bg-milk.jpg");
  head(s, "PART A · DrawTale이 주고 싶은 경험", "잘 그리는 것보다, 내가 만든 것이 살아나는 경험");
  const items = [
    ["Draw", "아이의 그림을\n그대로 씁니다", C.place],
    ["Move", "AI가 캐릭터와 관절을\n알아보고 움직입니다", C.problem],
    ["Choose", "아이가 이야기의 다음 행동을\n직접 고릅니다", C.action],
    ["Tell", "선택이 이어지며\n나만의 이야기가 됩니다", C.result],
    ["Experience", "내 캐릭터가 이야기에 나와\n결과를 바로 봅니다", C.grape],
  ];
  const cw = (W - 2 * MX - 4 * 0.3) / 5;
  items.forEach(([k, v, col], i) => {
    const x = MX + i * (cw + 0.3), y = 1.95;
    card(s, x, y, cw, 3.3);
    tile(s, x + (cw - 1.1) / 2, y + 0.35, 1.1, col, String(i + 1), 0, 22);
    text(s, k, x, y + 1.62, cw, 0.5, { size: 20, bold: true, align: "center", color: C.accent });
    text(s, v, x + 0.2, y + 2.2, cw - 0.4, 1.0, { size: 12.5, align: "center", color: C.soft, ls: 1.3 });
  });
  card(s, MX, 5.6, W - 2 * MX, 0.95, C.accent);
  text(s, "DrawTale은 AI가 아이에게 이야기를 보여 주는 서비스가 아니라,\n아이가 자신의 그림으로 이야기에 참여하도록 돕는 서비스입니다.",
    MX + 0.4, 5.6, W - 2 * MX - 0.8, 0.95, { size: 15, bold: true, color: C.white, valign: "middle", ls: 1.35 });
  notes(s, "저희가 주고 싶은 경험은 다섯 단어로 정리됩니다. 그리고, 움직이고, 고르고, 이야기하고, 경험하는 것. " +
    "잘 그리는 것보다 내가 만든 것이 살아나는 경험이 중요하다고 생각했습니다.");
}

// ─────────────────────────── 13. 아이디어에서 프로젝트로 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART B · 9/7 ~ 10/2 우리가 한 일", "아이디어를 실제 서비스 구조로 바꾸기 시작했습니다");
  const steps = ["프로젝트 시작", "서비스 목적 · 사용자 경험 논의", "MVP 범위 결정", "Frontend · Backend · A1 · A2 역할 분리",
    "화면 · 기능 · 데이터 · AI 처리 방식 협의", "핵심 설계 문서 제작", "영역별 상세 설계", "초기 개발 · AI 학습 PoC"];
  const cols = [C.place, C.problem, C.action, C.result];
  const colW = 3.75, rowH = 0.6;
  steps.forEach((t, i) => {
    const col = Math.floor(i / 4), row = i % 4;
    const x = MX + col * (colW + 0.35), y = 1.95 + row * (rowH + 0.55);
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.06, w: 0.43, h: 0.43, fill: { color: cols[row] }, line: { type: "none" } });
    text(s, String(i + 1), x, y + 0.06, 0.43, 0.43, { size: 13, bold: true, color: C.white, align: "center", valign: "middle" });
    text(s, t, x + 0.6, y, colW - 0.6, rowH, { size: 14.5, bold: i === 0 || i === 7, valign: "middle" });
  });
  text(s, "9/7", MX + 0.6, 1.62, 1, 0.3, { size: 11, bold: true, color: C.accent });
  text(s, "10/2", MX + colW + 0.95, 6.05, 1, 0.3, { size: 11, bold: true, color: C.accent });

  const bx = MX + 2 * (colW + 0.35) + 0.2, bw = W - MX - bx;
  card(s, bx, 1.85, bw, 4.55);
  text(s, "처음의 한 문장", bx + 0.35, 2.1, bw - 0.7, 0.35, { size: 12, bold: true, color: C.faint });
  text(s, "“아이 그림을 움직이고\n이야기로 만들어 보자.”", bx + 0.35, 2.45, bw - 0.7, 0.95, { size: 17, bold: true, ls: 1.3 });
  text(s, "10월 2일까지 이렇게 나누어 구체화했습니다", bx + 0.35, 3.55, bw - 0.7, 0.35, { size: 12, bold: true, color: C.accent });
  const units = ["화면", "기능", "Backend", "AI Runtime", "AI Model", "Dataset", "시스템 구조"];
  units.forEach((u, i) => {
    const x = bx + 0.35 + (i % 2) * 1.5, y = 4.0 + Math.floor(i / 2) * 0.55;
    pill(s, u, x, y, 1.38, { size: 11.5 });
  });
  notes(s, "9월 7일 프로젝트를 시작하고, 서비스 목적과 사용자 경험을 논의한 뒤 MVP 범위를 정했습니다. 그다음 네 명의 역할을 나누고, 화면, 기능, 데이터, AI 처리 방식을 함께 정했습니다. " +
    "처음에는 '아이 그림을 움직이고 이야기로 만들어 보자'라는 한 문장이었지만, 10월 2일까지 이를 화면, 기능, Backend, AI Runtime, AI Model, Dataset, 시스템 구조로 나누어 구체화했습니다.");
}

// ─────────────────────────── 14. 팀 역할 분담 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART B · 팀 역할 분담", "네 명이 나누어 맡고, 연결되는 곳은 함께 정했습니다");
  const team = [
    ["육도현", "Frontend / Joint", "화면설계서\n사용자 Flow Setting", C.place, C.placeLt],
    ["서민지", "Backend / PM", "기능정의서\nAPI · DB 구조, WBS", C.action, C.actionLt],
    ["김수정", "A1 AI Runtime", "Flow Chart\nAI Runtime Pipeline", C.problem, C.problemLt],
    ["김민준", "A2 Drawing Pose Model", "시스템 아키텍처\nDataset · Training Pipeline", C.result, C.resultLt],
  ];
  const cw = (W - 2 * MX - 3 * 0.3) / 4;
  team.forEach(([n, area, work, col, lt], i) => {
    const x = MX + i * (cw + 0.3), y = 1.95;
    card(s, x, y, cw, 3.05);
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: y + 0.35, w: 0.8, h: 0.8, fill: { color: lt }, line: { type: "none" } });
    text(s, n.slice(0, 1), x + 0.35, y + 0.35, 0.8, 0.8, { size: 20, bold: true, color: C.ink, align: "center", valign: "middle" });
    text(s, n, x + 1.3, y + 0.38, cw - 1.5, 0.4, { size: 18, bold: true });
    text(s, area, x + 1.3, y + 0.78, cw - 1.5, 0.35, { size: 11.5, bold: true, color: C.accent });
    text(s, "10/2까지 대표 작업물", x + 0.35, y + 1.5, cw - 0.7, 0.3, { size: 10.5, bold: true, color: C.faint });
    text(s, work, x + 0.35, y + 1.85, cw - 0.7, 1.0, { size: 14, bold: true, ls: 1.35 });
  });
  card(s, MX, 5.3, W - 2 * MX, 1.2, C.grapeLt, { flat: true });
  text(s, "함께 정한 것", MX + 0.35, 5.42, 3, 0.35, { size: 12, bold: true, color: C.accent });
  const shared = ["서비스 방향", "MVP 범위", "Frontend ↔ Backend", "Backend ↔ AI", "A1 ↔ A2 Interface"];
  shared.forEach((t, i) => pill(s, t, MX + 0.35 + i * 2.35, 5.85, 2.15, { fill: C.card, size: 12 }));
  notes(s, "역할은 네 영역으로 나누었습니다. 다만 각자 자기 영역만 따로 설계한 것이 아니라, 서비스 방향과 MVP 범위, 그리고 Frontend와 Backend, Backend와 AI, A1과 A2 사이의 연결 방식을 함께 논의해 정했습니다.");
}

// ─────────────────────────── 15~18. 개인 슬라이드 (공란) ───────────────────────────
const personal = [
  { name: "육도현", area: "Frontend", title: "사용자 경험을 실제 화면으로", col: C.place, lt: C.placeLt,
    artifacts: ["화면설계서 캡처 (크게)"], flow: "화면설계서 → React Page → Component → Routing → Backend API 연결 → Joint Overlay / Joint 보정 UI" },
  { name: "서민지", area: "Backend / PM", title: "아이디어를 실제 기능으로", col: C.action, lt: C.actionLt,
    artifacts: ["기능정의서 캡처", "WBS 일부", "API 또는 DB 구조"], flow: "사용자 요구사항 → 기능정의서 → Backend Service → Public API → DB" },
  { name: "김수정", area: "A1 AI Runtime", title: "서비스 요청이 AI 결과가 되기까지", col: C.problem, lt: C.problemLt,
    artifacts: ["서비스 Flow Chart 원본", "AI Runtime Pipeline 구조"], flow: "Input Image → Detection → Pose → Mask → Skeleton → Render → Animation" },
  { name: "김민준", area: "A2 Drawing Pose Model", title: "아이의 그림을 이해하는 AI", col: C.result, lt: C.resultLt,
    artifacts: ["시스템 아키텍처", "Dataset 예시", "Joint Annotation 예시", "학습 로그 · 그래프"], flow: "원본 Dataset → Annotation Parsing → Joint Mapping → Train / Validation Dataset" },
];
personal.forEach((p) => {
  const s = base("bg-light.jpg");
  head(s, `PART C · ${p.area} · ${p.name}`, p.title);
  // 왼쪽: 네 단계 (비워 둠)
  const labels = ["왜 이 작업이 필요했나", "무엇을 했나", "다음 개발에 어떻게 쓰이나"];
  const lw = 4.6;
  labels.forEach((l, i) => {
    const y = 1.95 + i * 1.42;
    card(s, MX, y, lw, 1.25);
    s.addShape(pres.shapes.OVAL, { x: MX + 0.25, y: y + 0.22, w: 0.34, h: 0.34, fill: { color: p.col }, line: { type: "none" } });
    text(s, String(i + 1), MX + 0.25, y + 0.22, 0.34, 0.34, { size: 11, bold: true, color: C.white, align: "center", valign: "middle" });
    text(s, l, MX + 0.75, y + 0.2, lw - 1, 0.38, { size: 13, bold: true, color: C.accent });
  });
  // 오른쪽: 실제 산출물 자리 (비워 둠)
  const rx = MX + lw + 0.35, rw = W - MX - rx, ry = 1.95, rh = 4.0;
  const n = p.artifacts.length;
  const cols = n === 1 ? 1 : 2, rows = Math.ceil(n / cols);
  const gw = (rw - (cols - 1) * 0.25) / cols, gh = (rh - (rows - 1) * 0.25) / rows;
  p.artifacts.forEach((a, i) => {
    const x = rx + (i % cols) * (gw + 0.25), y = ry + Math.floor(i / cols) * (gh + 0.25);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: gw, h: gh, rectRadius: 0.2, fill: { color: C.card },
      line: { color: "B9C3EE", width: 1.25, dashType: "dash" } });
    text(s, `실제 작업물 · ${a}`, x + 0.25, y + 0.2, gw - 0.5, 0.35, { size: 11, bold: true, color: C.faint });
  });
  // 아래: 발표 핵심 한 문장 (비워 둠) + 개발 연결
  card(s, MX, 6.28, lw, 0.58, p.lt, { flat: true });
  text(s, "발표 핵심 한 문장", MX + 0.25, 6.28, lw - 0.5, 0.58, { size: 12, bold: true, color: C.soft, valign: "middle" });
  text(s, p.flow, rx, 6.2, rw, 0.66, { size: 10.5, color: C.faint, valign: "middle", ls: 1.2 });
  notes(s, `${p.name} 담당 슬라이드입니다. 왼쪽 세 칸(왜 필요했나 → 무엇을 했나 → 다음 개발에 어떻게 쓰이나)을 채우고, 오른쪽 점선 칸에 실제 작업물 캡처를 크게 넣어 주세요. ` +
    "작업 이름만 나열하지 않고, 왜 → 무엇 → 산출물 → 다음 개발 순서로 말합니다.");
});

// ─────────────────────────── 19. 10/2의 결과 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART D · 지금까지의 결과", "10월 2일, 아이디어는 여기까지 구체화되었습니다");
  card(s, MX, 1.95, 3.0, 4.35, C.grapeLt, { flat: true });
  text(s, "처음", MX + 0.35, 2.2, 2.3, 0.35, { size: 12, bold: true, color: C.accent });
  text(s, "“아이의 그림을\n움직이고\n이야기로\n만들어 보자.”", MX + 0.35, 2.65, 2.3, 2.4, { size: 19, bold: true, ls: 1.35 });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: MX + 3.12, y: 3.95, w: 0.4, h: 0.36, fill: { color: C.grape }, line: { type: "none" } });
  const items = [
    ["사용자 경험", "화면설계서 · 사용자 Flow"], ["서비스 기능", "기능정의서"], ["시스템 처리", "Flow Chart"],
    ["전체 구조", "시스템 아키텍처"], ["Backend", "Service · Public API · DB 구조"],
    ["AI Runtime", "Detection → Pose → Mask → Skeleton → Render"], ["AI Model", "Dataset → Preprocessing → Training → Evaluation"],
  ];
  const gx = MX + 3.7, gw = (W - MX - gx - 0.25) / 2, gh = 0.95;
  items.forEach(([k, v], i) => {
    const x = gx + (i % 2) * (gw + 0.25), y = 1.95 + Math.floor(i / 2) * (gh + 0.18);
    card(s, x, y, gw, gh);
    text(s, k, x + 0.3, y + 0.12, gw - 0.6, 0.32, { size: 11.5, bold: true, color: C.accent });
    text(s, v, x + 0.3, y + 0.45, gw - 0.6, 0.42, { size: 13.5, bold: true });
  });
  const lastY = 1.95 + 3 * (gh + 0.18), lx = gx + gw + 0.25;
  card(s, lx, lastY, gw, gh, C.butter, { flat: true });
  text(s, "하나의 아이디어를\n화면 · 기능 · 데이터 · AI · 시스템 구조로 구체화했습니다.", lx + 0.3, lastY, gw - 0.6, gh,
    { size: 12, bold: true, valign: "middle", ls: 1.3 });
  notes(s, "처음에는 '아이의 그림을 움직이고 이야기로 만들어 보자'는 한 문장이었습니다. 10월 2일 지금은 사용자 경험, 서비스 기능, 시스템 처리, 전체 구조, Backend, AI Runtime, AI Model 일곱 가지로 구체화되었습니다.");
}

// ─────────────────────────── 20. 다음 단계 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "PART D · 다음 단계", "설계한 것을 하나로 이어 동작하게 만듭니다");
  const lanes = [
    ["Frontend", ["화면 구현", "API 연결", "Joint Overlay", "Joint 보정", "Story · Animation UI"], C.place],
    ["Backend", ["FastAPI 구현", "DB 구축", "Character · Story API", "AI Runtime 연동"], C.action],
    ["A1 AI Runtime", ["실행환경 구축", "Analyze Pipeline", "Skeleton · Render", "A2 Model Adapter"], C.problem],
    ["A2 Model", ["전체 Dataset 학습", "Evaluation", "Model 개선", "A1 Runtime 통합"], C.result],
  ];
  lanes.forEach(([k, steps, col], i) => {
    const y = 1.9 + i * 0.83;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y, w: 2.2, h: 0.62, rectRadius: 0.31, fill: { color: col }, line: { type: "none" } });
    text(s, k, MX, y, 2.2, 0.62, { size: 13, bold: true, color: C.white, align: "center", valign: "middle" });
    const sw = (W - 2 * MX - 2.5 - (steps.length - 1) * 0.3) / steps.length;
    steps.forEach((t, j) => {
      const x = MX + 2.5 + j * (sw + 0.3);
      card(s, x, y, sw, 0.62, C.card, { flat: true });
      text(s, t, x, y, sw, 0.62, { size: steps.length > 4 ? 11 : 12, bold: true, align: "center", valign: "middle" });
      if (j < steps.length - 1) arrow(s, x + sw + 0.04, y + 0.21, 0.22);
    });
  });
  card(s, MX, 5.35, W - 2 * MX, 1.15, C.accent);
  text(s, "최종 목표", MX + 0.35, 5.35, 1.5, 1.15, { size: 13, bold: true, color: C.butter, valign: "middle" });
  const goal = ["Draw", "AI Understands", "Character Moves", "Child Chooses", "Story Grows"];
  const gw = 1.7;
  goal.forEach((g, i) => {
    const x = MX + 1.9 + i * (gw + 0.28);
    pill(s, g, x, 5.65, gw, { fill: C.card, color: C.accent, size: 12.5, h: 0.55 });
    if (i < goal.length - 1) arrow(s, x + gw + 0.04, 5.82, 0.22, C.butter);
  });
  notes(s, "다음 단계는 설계한 것을 하나로 이어 동작하게 만드는 것입니다. 네 영역이 각자 구현하면서, 최종적으로 아이가 그리고, AI가 이해하고, 캐릭터가 움직이고, 아이가 고르고, 이야기가 자라는 흐름을 완성하는 것이 목표입니다.");
}

// ─────────────────────────── 21. 마무리 ───────────────────────────
{
  const s = base("bg-milk.jpg", { number: false });
  text(s, "그리고 모두 오래오래 행복하게 지냈답니다", MX, 2.1, 7, 0.4, { size: 16, bold: true, color: C.accent });
  text(s, "감사합니다", MX, 2.65, 7, 1.1, { size: 56, bold: true });
  text(s, "궁금한 점을 들려주세요", MX, 3.95, 7, 0.5, { size: 20 });
  text(s, "설계 문서  github.com/seominji58/drawtale-pt_docs", MX, 4.65, 7, 0.4, { size: 13, color: C.soft,
    extra: { hyperlink: { url: "https://github.com/seominji58/drawtale-pt_docs" } } });
  tile(s, 8.3, 1.9, 1.8, C.place, "장소", 4, 20);
  tile(s, 10.35, 1.7, 1.8, C.problem, "문제", -5, 20);
  tile(s, 8.45, 3.95, 1.8, C.action, "행동", -3, 20);
  tile(s, 10.5, 3.8, 1.8, C.result, "결과", 6, 20);
  bubble(s, 12.4, 1.4, 0.4, C.white, 0);
  bubble(s, 7.9, 1.55, 0.25, C.result, 30);
  notes(s, "들어 주셔서 감사합니다. 질문 있으시면 편하게 말씀해 주세요.");
}

// ─────────────────────────── 22. 참고 자료 ───────────────────────────
{
  const s = base("bg-light.jpg");
  head(s, "참고 자료", "배경조사 출처");
  const refs = R.references;
  const half = Math.ceil(refs.length / 2);
  [refs.slice(0, half), refs.slice(half)].forEach((col, ci) => {
    const x = MX + ci * ((W - 2 * MX) / 2 + 0.1), w = (W - 2 * MX) / 2 - 0.1;
    const runs = [];
    col.forEach((r, i) => {
      runs.push({ text: `${r.no}. ${r.title}`, options: { bold: true, breakLine: true } });
      runs.push({ text: `${r.meta}`, options: { color: C.soft, breakLine: true } });
      runs.push({ text: r.url, options: { color: C.accent, hyperlink: { url: r.url }, breakLine: i < col.length - 1 } });
      if (i < col.length - 1) runs.push({ text: " ", options: { fontSize: 4, breakLine: true } });
    });
    text(s, runs, x, 1.85, w, 5.0, { size: 10.5, ls: 1.15 });
  });
  notes(s, "배경조사에 쓴 자료의 출처입니다. 기존 서비스 기능 비교는 발표 직전에 각 서비스의 최신 기능을 다시 확인합니다.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
