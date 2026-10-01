// DrawTale 중간 발표 덱 (공통 영역 채움, 개인 영역 공란)
//   node build.js <출력 경로.pptx>
// 디자인: 흰 바탕 + 남색 표지 · 강조 · 마무리. 카드 · 그림자 · 장식 없이 여백과 얇은 선, 글자 크기로 구분한다.
// 강조색은 파랑 하나. 단계 4색은 「네 칸」을 뜻하는 곳에만 작은 표시로 쓴다.
const pptxgen = require("pptxgenjs");
const path = require("path");
const R = require("./research.json");   // 배경조사 수치 · 문장 · 출처

const OUT = process.argv[2] || path.join(__dirname, "../../presentation/DrawTale_중간발표.pptx");
const IMG = (f) => path.join(__dirname, f);
const SCREEN = (f) => path.join(__dirname, "../../assets/screens", f);

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.333 × 7.5 in
pres.title = "DrawTale 중간 발표";
pres.author = "DrawTale 팀";

const C = {
  ink: "262B40", soft: "5B6177", faint: "9399AC", rule: "E2E5EC", panel: "F4F5F8",
  accent: "4256C8", accentLt: "ECEFFB", navy: "262B48", navySoft: "AEB4D6", butter: "FFE27A",
  place: "7FB2F0", problem: "F4909F", action: "74CDAE", result: "F5C46B", white: "FFFFFF",
};
const STAGE = [C.place, C.problem, C.action, C.result];
const F = "Malgun Gothic";
const W = 13.333, H = 7.5, MX = 0.85, CW = W - 2 * MX;
const TOP = 0.75;            // 제목 윗선

let page = 0;

function slide({ dark = false, section = "", number = true } = {}) {
  const s = pres.addSlide();
  s.background = { color: dark ? C.navy : C.white };
  page += 1;
  const col = dark ? C.navySoft : C.faint;
  if (section) text(s, section, MX, H - 0.55, 6, 0.3, { size: 9, color: col });
  if (number) text(s, String(page).padStart(2, "0"), W - MX - 0.6, H - 0.55, 0.6, 0.3, { size: 9, color: col, align: "right" });
  return s;
}

function text(s, str, x, y, w, h, o = {}) {
  s.addText(str, { x, y, w, h, fontFace: F, fontSize: o.size ?? 15, bold: !!o.bold, color: o.color ?? C.ink,
    align: o.align ?? "left", valign: o.valign ?? "top", margin: 0, lineSpacingMultiple: o.ls ?? 1.2,
    italic: !!o.italic, charSpacing: o.cs, isTextBox: true, ...(o.extra || {}) });
}

function title(s, str, sub, { dark = false, y = TOP, w = CW } = {}) {
  text(s, str, MX, y, w, 0.75, { size: 30, bold: true, color: dark ? C.white : C.ink, cs: -0.5 });
  if (sub) text(s, sub, MX, y + 0.78, w, 0.5, { size: 15, color: dark ? C.navySoft : C.soft });
}

function hline(s, x, y, w, color = C.rule, pt = 0.75) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: pt } });
}
function vline(s, x, y, h, color = C.rule, pt = 0.75) {
  s.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color, width: pt } });
}
function box(s, x, y, w, h, fill, r = 0.06) {
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, { x, y, w, h, rectRadius: r || undefined,
    fill: { color: fill }, line: { type: "none" } });
}
function square(s, x, y, d, color) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: d, h: d, fill: { color }, line: { type: "none" } });
}
function img(s, file, x, y, w, h) { s.addImage({ path: file, x, y, w, h }); }
function source(s, str, dark = false) {
  text(s, str, MX, H - 0.98, CW - 0.8, 0.36, { size: 8.5, color: dark ? C.navySoft : C.faint, valign: "bottom", ls: 1.1 });
}
// 「가 → 나 → 다」 한 줄. 화살표는 강조색 글자
function chain(items, o = {}) {
  const runs = [];
  items.forEach((t, i) => {
    runs.push({ text: t, options: { color: o.color ?? C.ink, bold: o.bold ?? false } });
    if (i < items.length - 1) runs.push({ text: "   →   ", options: { color: o.arrow ?? C.accent } });
  });
  return runs;
}

const SEC_A = "A  왜 만들었나", SEC_B = "B  지난 한 달", SEC_C = "C  영역별 작업", SEC_D = "D  지금까지와 다음";

// ─────────────────────────── 1. 표지 ───────────────────────────
{
  const s = slide({ dark: true, number: false });
  box(s, 7.75, 0, W - 7.75, H, C.white, 0);
  img(s, IMG("char-plain-sm.jpg"), 8.55, 0.95, 4.0, 4.0 * 602 / 508);
  text(s, "그림: Meta Animated Drawings 예제 (MIT)", 8.55, 0.95 + 4.0 * 602 / 508 + 0.12, 4.0, 0.3, { size: 8.5, color: C.faint });
  text(s, "캡스톤 중간 발표  ·  2026. 10. 02", MX, 1.15, 6.4, 0.35, { size: 12, color: C.navySoft });
  text(s, "DrawTale", MX, 2.0, 6.6, 1.15, { size: 66, bold: true, color: C.white, cs: -1.5 });
  text(s, "한칸이야기", MX, 3.2, 6.6, 0.5, { size: 22, bold: true, color: C.butter });
  text(s, "아이의 그림이 주인공이 되고,\n아이의 선택으로 완성되는 이야기", MX, 4.1, 6.4, 1.0, { size: 20, color: C.white, ls: 1.4 });
  text(s, "[팀 이름]   육도현 · 서민지 · 김수정 · 김민준", MX, 6.35, 6.4, 0.35, { size: 12, color: C.navySoft });
  s.addNotes("안녕하세요. 저희는 아이가 직접 그린 그림이 이야기의 주인공이 되는 서비스, DrawTale을 만들고 있습니다. 오른쪽은 아이가 그린 사람 그림의 예시입니다. 이 그림이 어떻게 움직이고 이야기가 되는지 말씀드리겠습니다.");
}

// ─────────────────────────── 2. 순서 ───────────────────────────
{
  const s = slide();
  title(s, "오늘의 순서", "왜 만들었고, 무엇을 만들기로 했고, 지난 한 달 무엇을 했는지");
  const parts = [
    ["01", "왜 만들었나", "사회 · 교육 · 기술 · 기존 서비스 조사에서 서비스 방향까지"],
    ["02", "지난 한 달", "9/7 ~ 10/2, 아이디어를 서비스 구조로"],
    ["03", "영역별 작업", "Frontend · Backend · AI Runtime · AI Model"],
    ["04", "지금까지와 다음", "10/2까지 구체화한 것과 다음 단계"],
  ];
  const y0 = 2.45, rh = 0.98;
  parts.forEach(([n, t, d], i) => {
    const y = y0 + i * rh;
    hline(s, MX, y, CW);
    text(s, n, MX, y + 0.22, 1.0, 0.55, { size: 26, bold: true, color: C.accent });
    text(s, t, MX + 1.3, y + 0.24, 4.0, 0.5, { size: 20, bold: true });
    text(s, d, MX + 5.4, y + 0.3, CW - 5.4, 0.45, { size: 14, color: C.soft });
  });
  hline(s, MX, y0 + 4 * rh, CW);
  s.addNotes("발표는 네 부분입니다. 왜 이 서비스를 만들게 되었는지 배경조사부터, 지난 한 달 동안 한 일, 영역별 작업, 지금까지의 결과와 다음 단계 순서입니다.");
}

// ─────────────────────────── 3. 사회적 배경 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "학습 속도가 느린 아이들은 어디에 있을까?", "배경조사 ① 사회적 배경");
  const st = R.social.stats, sw = CW / 3;
  st.forEach((m, i) => {
    const x = MX + i * sw;
    if (i) vline(s, x - 0.02, 2.35, 1.45);
    text(s, m.value, x + (i ? 0.35 : 0), 2.3, sw - 0.5, 0.75, { size: 38, bold: true, color: C.accent, cs: -1 });
    text(s, m.label, x + (i ? 0.35 : 0), 3.1, sw - 0.5, 0.7, { size: 12, color: C.soft, ls: 1.3 });
  });
  hline(s, MX, 4.15, CW);
  R.social.studies.forEach((r, i) => {
    const x = MX + i * (CW / 2 + 0.2), w = CW / 2 - 0.4;
    text(s, r.tag, x, 4.45, w, 0.3, { size: 11, bold: true, color: C.accent });
    text(s, r.finding, x, 4.8, w, 0.95, { size: 15, bold: true, ls: 1.4 });
    text(s, r.cite.replace(/\n/g, "   "), x, 5.8, w, 0.3, { size: 9.5, color: C.faint });
  });
  text(s, chain(["아이마다 다른 학습 속도", "기존 방식에 맞추기 어려움", "아이에게 맞는 표현 · 참여 방식", "부모도 아이의 생각을 발견하는 경험"],
    { bold: true }), MX, 6.18, CW, 0.32, { size: 12 });
  source(s, R.social.source);
  s.addNotes(R.social.notes);
}

// ─────────────────────────── 4. 교육적 배경 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "아이에게 글 이외의 표현 방식을 줄 수 없을까?", "배경조사 ② 교육적 배경");
  const lw = 5.6;
  text(s, R.edu.tag, MX, 2.35, lw, 0.3, { size: 11, bold: true, color: C.accent });
  text(s, R.edu.finding, MX, 2.75, lw, 1.6, { size: 21, bold: true, ls: 1.4 });
  text(s, R.edu.detail, MX, 4.45, lw, 0.9, { size: 13.5, color: C.soft, ls: 1.45 });
  text(s, R.edu.cite, MX, 5.45, lw, 0.3, { size: 9.5, color: C.faint });

  const rx = MX + lw + 0.9, rw = W - MX - rx;
  vline(s, rx - 0.45, 2.4, 3.4);
  text(s, "학습을 이렇게만 보지 않고", rx, 2.4, rw, 0.3, { size: 12, color: C.faint });
  text(s, chain(["읽기", "문제", "정답"], { color: C.faint, arrow: C.faint }), rx, 2.8, rw, 0.5, { size: 20, bold: true });
  text(s, "참여하는 경험으로 접근했습니다", rx, 3.75, rw, 0.3, { size: 12, color: C.accent, bold: true });
  ["그리기", "표현", "선택", "이야기 구성"].forEach((t, i) => {
    const y = 4.2 + i * 0.42;
    square(s, rx, y + 0.1, 0.16, STAGE[i]);
    text(s, t, rx + 0.35, y, rw - 0.35, 0.38, { size: 18, bold: true });
  });
  text(s, "그림이 창의성을 높인다고 단정하지 않습니다. 선행연구를 근거로 ‘그림 + 이야기’라는 방식을 골랐습니다.",
    MX, 6.1, CW, 0.3, { size: 11.5, color: C.soft });
  source(s, R.edu.source);
  s.addNotes(R.edu.notes);
}

// ─────────────────────────── 5. 기술 조사 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "아이의 그림을 실제로 움직일 수 있을까?", "배경조사 ③ 기술 조사");
  const steps = [["char-plain-sm.jpg", "아이의 그림"], ["char-bbox-sm.jpg", "캐릭터 찾기"],
    ["char-mask-sm.jpg", "영역 떼어 내기"], ["char-joints-sm.jpg", "관절 찾기"]];
  const iw = 1.55, ih = iw * 602 / 508, gap = 0.28;
  steps.forEach(([f, label], i) => {
    const x = MX + i * (iw + gap);
    img(s, IMG(f), x, 2.35, iw, ih);
    text(s, `${i + 1}  ${label}`, x, 2.35 + ih + 0.12, iw, 0.3, { size: 12, bold: true });
  });
  const lw = 4 * iw + 3 * gap;
  text(s, R.tech.pipeline, MX, 4.95, lw, 1.1, { size: 12.5, color: C.soft, ls: 1.45 });
  const rx = MX + lw + 0.7, rw = W - MX - rx;
  vline(s, rx - 0.35, 2.4, 3.6);
  text(s, R.tech.bigValue, rx, 2.3, rw, 0.85, { size: 44, bold: true, color: C.accent, cs: -1 });
  text(s, R.tech.bigLabel, rx, 3.2, rw, 0.8, { size: 12, color: C.soft, ls: 1.35 });
  hline(s, rx, 4.35, rw);
  text(s, "아이의 그림을 이야기 속에서 실제로 움직이는 주인공으로 쓸 수 있겠다고 판단했습니다.", rx, 4.6, rw, 1.2,
    { size: 16, bold: true, ls: 1.45 });
  source(s, R.tech.source);
  s.addNotes(R.tech.notes);
}

// ─────────────────────────── 6. 기존 서비스 조사 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "그런데, 이미 비슷한 서비스가 있지 않을까?", "기존 서비스 조사");
  const head = ["", "그림 입력", "애니메이션", "이야기", "아이의 선택", "관절 직접 보정"];
  const mark = (v) => ({ O: "●", X: "–", 일부: "◐ 일부", 제한적: "◐ 제한적" }[v] ?? v);
  const rowB = { type: "solid", pt: 0.75, color: C.rule };
  const none = { type: "none" };
  const cell = (t, o = {}) => ({ text: t, options: { border: [none, none, rowB, none], valign: "middle", ...o } });
  const rows = [head.map((h, i) => cell(h, { bold: true, color: C.faint, fontSize: 11, align: i ? "center" : "left" }))];
  R.compare.rows.forEach((r) => {
    const us = r.name === "DrawTale";
    const fill = us ? { fill: { color: C.accentLt } } : {};
    rows.push([cell(r.name, { bold: true, color: us ? C.accent : C.ink, ...fill }),
      ...r.values.map((v) => cell(mark(v), { align: "center", color: v === "X" ? C.faint : us ? C.accent : C.ink, bold: us, ...fill }))]);
  });
  s.addTable(rows, { x: MX, y: 2.3, w: CW, colW: [3.33, 1.65, 1.65, 1.65, 1.65, 1.703], fontFace: F, fontSize: 14,
    rowH: 0.6, margin: [0, 0.12, 0, 0.12] });
  text(s, "●  있음      ◐  일부 · 제한적      –  없음", MX, 6.05, 6, 0.3, { size: 10.5, color: C.soft });
  source(s, R.compare.source);
  s.addNotes(R.compare.notes);
}

// ─────────────────────────── 7. 발견한 한계 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "그림을 움직이는 서비스는 이미 있었습니다",
    "우리가 집중한 것은 결과물의 화려함이 아니라, 아이가 만드는 과정에 얼마나 계속 참여하느냐입니다");
  const cw = CW / 2;
  const cols = [
    ["AI가 만들어 주는 결과", ["그림을 넣으면", "AI가 영상 하나를 만들고", "아이는 결과를 감상합니다"], C.faint, C.soft],
    ["아이가 이어 가는 과정", ["내 그림이 주인공이 되고", "다음에 무슨 일이 일어날지 아이가 고르고", "고른 것이 모여 나만의 이야기가 됩니다"], C.accent, C.ink],
  ];
  cols.forEach(([h, items, hc, tc], i) => {
    const x = MX + i * (cw + 0.2) + (i ? 0.35 : 0);
    text(s, h, x, 2.55, cw - 0.5, 0.4, { size: 18, bold: true, color: hc });
    items.forEach((t, j) => {
      hline(s, x, 3.15 + j * 0.62, cw - 0.6);
      text(s, t, x, 3.27 + j * 0.62, cw - 0.6, 0.4, { size: 15, bold: i === 1, color: tc });
    });
  });
  vline(s, MX + cw + 0.1, 2.55, 2.4);
  text(s, R.limit.quote, MX, 5.55, CW, 0.5, { size: 12, color: C.soft, italic: true });
  source(s, "출처: [12] The Alan Turing Institute (2025). Understanding the Impacts of Generative AI Use on Children");
  s.addNotes("조사해 보니 그림을 AI로 움직이는 서비스는 물론, 그림으로 이야기를 만드는 서비스까지 이미 있었습니다. 그래서 그림을 넣으면 AI가 영상 하나를 만들어 주는 것만으로는 부족하다고 판단했습니다. 저희가 집중한 것은 결과물의 화려함이 아니라, 아이가 만드는 과정에 얼마나 계속 참여하느냐입니다.");
}

// ─────────────────────────── 8. 강조: 질문 ───────────────────────────
{
  const s = slide({ dark: true, section: SEC_A });
  text(s, "기존 기술", MX, 1.7, 6, 0.35, { size: 14, color: C.navySoft });
  text(s, "그림을 움직이게 한다.", MX, 2.1, 11, 0.7, { size: 26, bold: true, color: C.navySoft });
  hline(s, MX, 3.25, 1.2, C.butter, 2);
  text(s, "DrawTale의 질문", MX, 3.6, 6, 0.35, { size: 14, color: C.butter });
  text(s, "움직이게 된 내 그림이\n내 이야기의 주인공이 된다면?", MX, 4.0, 11.5, 1.9, { size: 42, bold: true, color: C.white, ls: 1.25, cs: -1 });
  s.addNotes("기존 기술은 그림을 움직이게 하는 데서 멈춥니다. 저희는 여기서 한 걸음 더 나아가, 움직이게 된 내 그림이 내 이야기의 주인공이 된다면 어떨까 하는 질문을 던졌습니다.");
}

// ─────────────────────────── 9. 조사 → 방향 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  const px = 8.75;
  box(s, px, 0, W - px, H, C.navy, 0);
  title(s, "조사에서 서비스 방향까지", null, { w: px - MX - 0.4 });
  const rows = [
    ["사회적 배경", "느린학습자와 부모가 겪는 학습 · 지원의 어려움"],
    ["교육적 배경", "그림과 이야기로 생각을 표현하는 Narrative 활동의 가능성"],
    ["기술 조사", "AI로 손그림 캐릭터 · 관절을 인식하고 움직일 수 있다"],
    ["기존 서비스", "그림 애니메이션과 AI 이야기 서비스는 이미 있다"],
    ["발견한 한계", "AI가 결과 대부분을 만들면 아이의 참여가 한 번에 끝나기 쉽다"],
  ];
  const lw = px - MX - 0.6, y0 = 1.95, rh = 0.86;
  rows.forEach(([k, v], i) => {
    const y = y0 + i * rh;
    hline(s, MX, y, lw);
    text(s, k, MX, y + 0.18, 1.8, 0.35, { size: 13, bold: true, color: C.accent });
    text(s, v, MX + 1.9, y + 0.17, lw - 1.9, 0.6, { size: 13, ls: 1.3 });
  });
  hline(s, MX, y0 + 5 * rh, lw);
  text(s, "그래서 DrawTale은", px + 0.6, 2.0, W - px - 1.1, 0.35, { size: 13, color: C.butter });
  text(s, "AI가 아이 대신 창작하기보다, 아이의 그림과 선택이 이야기의 중심이 되는 서비스", px + 0.6, 2.5, W - px - 1.1, 2.6,
    { size: 22, bold: true, color: C.white, ls: 1.45 });
  s.addNotes("지금까지의 조사를 묶으면 이렇습니다. 사회적 배경, 교육적 배경, 기술 조사, 기존 서비스 조사를 거쳐, AI가 결과 대부분을 만들어 주면 아이의 참여가 한 번에 끝나기 쉽다는 한계를 발견했습니다. 그래서 DrawTale은 아이의 그림과 선택이 이야기의 중심이 되는 서비스로 방향을 정했습니다.");
}

// ─────────────────────────── 10. 서비스 개요 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  text(s, "서비스 개요", MX, TOP, 6, 0.35, { size: 13, bold: true, color: C.accent });
  text(s, "아이가 직접 그린 캐릭터를 AI가 알아보고 움직이게 해서, 아이의 선택으로 자신만의 이야기를 완성하는 인터랙티브 스토리 서비스",
    MX, TOP + 0.5, CW - 1.0, 1.6, { size: 26, bold: true, ls: 1.4, cs: -0.5 });
  const cw = (CW - 0.8) / 2, y = 3.2;
  hline(s, MX, y, cw);
  hline(s, MX + cw + 0.8, y, cw);
  text(s, "서비스 대상", MX, y + 0.25, cw, 0.3, { size: 12, bold: true, color: C.accent });
  text(s, "학습 속도가 느리거나 글 중심의 표현이 어려운 아동을 포함해, 그림과 이야기로 자신의 생각을 표현하고 싶은 모든 아동",
    MX, y + 0.7, cw, 1.4, { size: 16, ls: 1.5 });
  const x2 = MX + cw + 0.8;
  text(s, "서비스 목적", x2, y + 0.25, cw, 0.3, { size: 12, bold: true, color: C.accent });
  text(s, [
    { text: "아이에게  ", options: { bold: true } },
    { text: "내 그림이 인정받고 살아 움직이는 창작 · 표현 경험", options: { breakLine: true } },
    { text: "부모에게  ", options: { bold: true } },
    { text: "정답 여부보다 아이가 무엇을 그리고 어떤 이야기를 고르는지 함께 바라보는 경험" },
  ], x2, y + 0.7, cw, 1.8, { size: 16, ls: 1.5 });
  s.addNotes("이제 DrawTale을 소개합니다. 아이가 직접 그린 캐릭터를 AI가 알아보고 움직이게 해서, 아이의 선택으로 자신만의 이야기를 완성하는 서비스입니다. 아이에게는 내 그림이 인정받고 살아 움직이는 경험을, 부모에게는 정답보다 아이가 무엇을 그리고 무엇을 고르는지 함께 바라보는 경험을 주고자 합니다.");
}

// ─────────────────────────── 11. 서비스 흐름 (화면설계서 그림) ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "움직이는 그림에서, 내가 만들어 가는 이야기로", null);
  text(s, [{ text: "기존 경험   ", options: { bold: true, color: C.faint } },
    ...chain(["그림 업로드", "AI 분석", "캐릭터 애니메이션", "결과 감상"], { color: C.faint, arrow: C.faint })],
    MX, 1.75, CW, 0.35, { size: 13 });
  hline(s, MX, 2.3, CW);
  const shots = [
    ["S-03D.png", "그리기", "종이에 그리거나 화면에 그린다"],
    ["S-06.png", "관절 확인 · 보정", "AI가 찾은 관절을 어른과 함께 바로잡는다"],
    ["S-07.png", "이야기 상황 → 아이가 선택", "장소 · 문제 · 행동 · 결과를 아이가 고른다"],
    ["S-09.png", "나만의 이야기", "내 그림이 움직이는 이야기를 보고 듣는다"],
  ];
  const tw = (CW - 3 * 0.3) / 4, th = tw * 840 / 1096;
  shots.forEach(([f, h, d], i) => {
    const x = MX + i * (tw + 0.3);
    img(s, SCREEN(f), x, 2.6, tw, th);
    square(s, x, 2.6 + th + 0.24, 0.14, STAGE[i]);
    text(s, h, x + 0.25, 2.6 + th + 0.15, tw - 0.25, 0.35, { size: 13.5, bold: true });
    text(s, d, x, 2.6 + th + 0.55, tw, 0.6, { size: 11.5, color: C.soft, ls: 1.3 });
  });
  text(s, [{ text: "AI 결과물은 끝이 아니라 시작점입니다.  ", options: { bold: true, color: C.accent } },
    { text: "아이의 그림이 주인공이 되고, 아이의 선택으로 이야기가 이어집니다.", options: { color: C.soft } }],
    MX, 6.15, CW, 0.35, { size: 12.5 });
  source(s, "화면: 화면설계서 v0.3 와이어프레임 (S-03D · S-06 · S-07 · S-09). S-06 캐릭터 그림은 Meta Animated Drawings 예제 (MIT)");
  s.addNotes("기존 방식은 그림을 올리면 AI가 애니메이션을 만들고, 아이는 결과를 감상하는 데서 끝납니다. DrawTale에서는 캐릭터가 움직인 다음부터가 시작입니다. 아이가 그리고, 필요하면 선생님이나 보호자가 관절을 함께 바로잡고, 아이가 이야기의 네 칸을 직접 고르면, 내 그림이 움직이는 나만의 이야기가 됩니다. 화면은 저희 화면설계서의 실제 와이어프레임입니다.");
}

// ─────────────────────────── 12. 주고 싶은 경험 ───────────────────────────
{
  const s = slide({ section: SEC_A });
  title(s, "잘 그리는 것보다, 내가 만든 것이 살아나는 경험", null);
  const items = [
    ["Draw", "아이의 그림을 그대로 씁니다"],
    ["Move", "AI가 캐릭터와 관절을 알아보고 움직입니다"],
    ["Choose", "아이가 이야기의 다음 행동을 직접 고릅니다"],
    ["Tell", "선택이 이어지며 나만의 이야기가 됩니다"],
    ["Experience", "내 캐릭터가 이야기에 나오는 것을 바로 봅니다"],
  ];
  const cw = (CW - 4 * 0.35) / 5;
  items.forEach(([k, v], i) => {
    const x = MX + i * (cw + 0.35);
    hline(s, x, 2.3, cw, i < 4 ? STAGE[i] : C.accent, 2.5);
    text(s, String(i + 1).padStart(2, "0"), x, 2.55, cw, 0.3, { size: 11, bold: true, color: C.faint });
    text(s, k, x, 2.9, cw, 0.55, { size: 24, bold: true, color: C.ink, cs: -0.5 });
    text(s, v, x, 3.6, cw, 1.0, { size: 13, color: C.soft, ls: 1.4 });
  });
  hline(s, MX, 5.15, CW);
  text(s, "DrawTale은 AI가 아이에게 이야기를 보여 주는 서비스가 아니라,\n아이가 자신의 그림으로 이야기에 참여하도록 돕는 서비스입니다.",
    MX, 5.45, CW, 0.9, { size: 18, bold: true, ls: 1.45 });
  s.addNotes("저희가 주고 싶은 경험은 다섯 단어로 정리됩니다. 그리고, 움직이고, 고르고, 이야기하고, 경험하는 것. 잘 그리는 것보다 내가 만든 것이 살아나는 경험이 중요하다고 생각했습니다.");
}

// ─────────────────────────── 13. 지난 한 달 ───────────────────────────
{
  const s = slide({ section: SEC_B });
  title(s, "아이디어를 실제 서비스 구조로 바꾸기 시작했습니다", "9/7 ~ 10/2 우리가 한 일");
  const steps = ["프로젝트 시작", "서비스 목적 · 사용자 경험 논의", "MVP 범위 결정", "Frontend · Backend · A1 · A2 역할 분리",
    "화면 · 기능 · 데이터 · AI 처리 방식 협의", "핵심 설계 문서 제작", "영역별 상세 설계", "초기 개발 · AI 학습 PoC"];
  const lw = 7.6, cw = lw / 2, rh = 0.88;
  steps.forEach((t, i) => {
    const col = Math.floor(i / 4), row = i % 4;
    const x = MX + col * cw, y = 2.35 + row * rh;
    hline(s, x, y, cw - 0.35);
    text(s, String(i + 1).padStart(2, "0"), x, y + 0.17, 0.6, 0.35, { size: 13, bold: true, color: C.accent });
    text(s, t, x + 0.6, y + 0.15, cw - 1.0, 0.6, { size: 14, bold: i === 0 || i === 7, ls: 1.25 });
  });
  text(s, "9/7", MX + 0.6, 2.05, 1, 0.25, { size: 10, color: C.faint });
  text(s, "10/2", MX + cw + 0.6, 2.35 + 4 * rh + 0.1, 1, 0.25, { size: 10, color: C.faint });
  const rx = MX + lw + 0.6, rw = W - MX - rx;
  vline(s, rx - 0.3, 2.35, 3.6);
  text(s, "처음의 한 문장", rx, 2.35, rw, 0.3, { size: 12, color: C.faint });
  text(s, "아이 그림을 움직이고\n이야기로 만들어 보자.", rx, 2.75, rw, 1.0, { size: 20, bold: true, ls: 1.35 });
  text(s, "10월 2일까지 이렇게 나누어 구체화했습니다", rx, 4.15, rw, 0.3, { size: 12, bold: true, color: C.accent });
  text(s, "화면 · 기능 · Backend · AI Runtime · AI Model · Dataset · 시스템 구조", rx, 4.55, rw, 0.9, { size: 15, ls: 1.5 });
  s.addNotes("9월 7일 프로젝트를 시작하고, 서비스 목적과 사용자 경험을 논의한 뒤 MVP 범위를 정했습니다. 네 명의 역할을 나누고, 화면, 기능, 데이터, AI 처리 방식을 함께 정했습니다. 처음에는 '아이 그림을 움직이고 이야기로 만들어 보자'라는 한 문장이었지만, 10월 2일까지 이를 화면, 기능, Backend, AI Runtime, AI Model, Dataset, 시스템 구조로 나누어 구체화했습니다.");
}

// ─────────────────────────── 14. 역할 ───────────────────────────
{
  const s = slide({ section: SEC_B });
  title(s, "네 명이 나누어 맡고, 연결되는 곳은 함께 정했습니다", "팀 역할 분담");
  const team = [
    ["육도현", "Frontend / Joint", ["화면설계서", "사용자 Flow Setting"]],
    ["서민지", "Backend / PM", ["기능정의서", "API · DB 구조", "WBS"]],
    ["김수정", "A1 AI Runtime", ["Flow Chart", "AI Runtime Pipeline"]],
    ["김민준", "A2 Drawing Pose Model", ["시스템 아키텍처", "Dataset · Training Pipeline"]],
  ];
  const cw = (CW - 3 * 0.4) / 4;
  team.forEach(([n, area, works], i) => {
    const x = MX + i * (cw + 0.4);
    hline(s, x, 2.35, cw, C.ink, 1.25);
    text(s, n, x, 2.55, cw, 0.5, { size: 22, bold: true });
    text(s, area, x, 3.1, cw, 0.3, { size: 12, bold: true, color: C.accent });
    text(s, "10/2까지 대표 작업물", x, 3.7, cw, 0.3, { size: 10.5, color: C.faint });
    text(s, works.join("\n"), x, 4.0, cw, 1.0, { size: 14, ls: 1.45 });
  });
  hline(s, MX, 5.35, CW);
  text(s, [{ text: "함께 정한 것   ", options: { bold: true, color: C.accent } },
    { text: "서비스 방향 · MVP 범위 · Frontend ↔ Backend · Backend ↔ AI · A1 ↔ A2 Interface", options: { color: C.ink } }],
    MX, 5.6, CW, 0.35, { size: 14 });
  s.addNotes("역할은 네 영역으로 나누었습니다. 다만 각자 자기 영역만 따로 설계한 것이 아니라, 서비스 방향과 MVP 범위, 그리고 영역 사이의 연결 방식을 함께 논의해 정했습니다.");
}

// ─────────────────────────── 15~18. 개인 슬라이드 (공란) ───────────────────────────
const personal = [
  { name: "육도현", area: "Frontend", title: "사용자 경험을 실제 화면으로",
    artifacts: ["화면설계서 캡처 (크게)"], flow: "화면설계서 → React Page → Component → Routing → Backend API 연결 → Joint Overlay / Joint 보정 UI" },
  { name: "서민지", area: "Backend / PM", title: "아이디어를 실제 기능으로",
    artifacts: ["기능정의서 캡처", "WBS 일부", "API 또는 DB 구조"], flow: "사용자 요구사항 → 기능정의서 → Backend Service → Public API → DB" },
  { name: "김수정", area: "A1 AI Runtime", title: "서비스 요청이 AI 결과가 되기까지",
    artifacts: ["서비스 Flow Chart 원본", "AI Runtime Pipeline 구조"], flow: "Input Image → Detection → Pose → Mask → Skeleton → Render → Animation" },
  { name: "김민준", area: "A2 Drawing Pose Model", title: "아이의 그림을 이해하는 AI",
    artifacts: ["시스템 아키텍처", "Dataset 예시", "Joint Annotation 예시", "학습 로그 · 그래프"], flow: "원본 Dataset → Annotation Parsing → Joint Mapping → Train / Validation Dataset" },
];
personal.forEach((p) => {
  const s = slide({ section: SEC_C });
  text(s, `${p.area}  ·  ${p.name}`, MX, TOP, 8, 0.35, { size: 13, bold: true, color: C.accent });
  text(s, p.title, MX, TOP + 0.42, CW, 0.75, { size: 30, bold: true, cs: -0.5 });
  const lw = 4.4, y0 = 2.25;
  ["왜 이 작업이 필요했나", "무엇을 했나", "다음 개발에 어떻게 쓰이나"].forEach((l, i) => {
    const y = y0 + i * 1.3;
    hline(s, MX, y, lw);
    text(s, `${i + 1}  ${l}`, MX, y + 0.15, lw, 0.3, { size: 12, bold: true, color: C.soft });
  });
  hline(s, MX, y0 + 3 * 1.3, lw);
  text(s, "발표 핵심 한 문장", MX, y0 + 3 * 1.3 + 0.15, lw, 0.3, { size: 12, bold: true, color: C.soft });

  const rx = MX + lw + 0.5, rw = W - MX - rx, rh = 4.15;
  const n = p.artifacts.length, cols = n === 1 ? 1 : 2, rows = Math.ceil(n / cols);
  const gw = (rw - (cols - 1) * 0.25) / cols, gh = (rh - (rows - 1) * 0.25) / rows;
  p.artifacts.forEach((a, i) => {
    const x = rx + (i % cols) * (gw + 0.25), y = y0 + Math.floor(i / cols) * (gh + 0.25);
    box(s, x, y, gw, gh, C.panel, 0.04);
    text(s, a, x + 0.25, y + 0.2, gw - 0.5, 0.3, { size: 11, color: C.faint });
  });
  text(s, p.flow, rx, y0 + rh + 0.2, rw, 0.5, { size: 10.5, color: C.faint, ls: 1.3 });
  s.addNotes(`${p.name} 담당 슬라이드입니다. 왼쪽 세 칸(왜 필요했나 → 무엇을 했나 → 다음 개발에 어떻게 쓰이나)과 발표 핵심 한 문장을 채우고, 오른쪽 회색 칸에 실제 작업물 캡처를 크게 넣어 주세요. 작업 이름만 나열하지 않고, 왜 → 무엇 → 산출물 → 다음 개발 순서로 말합니다.`);
});

// ─────────────────────────── 19. 10/2의 결과 ───────────────────────────
{
  const s = slide({ section: SEC_D });
  title(s, "10월 2일, 아이디어는 여기까지 구체화되었습니다", "하나의 아이디어를 화면 · 기능 · 데이터 · AI · 시스템 구조로");
  const lw = 3.3;
  text(s, "처음", MX, 2.35, lw, 0.3, { size: 12, color: C.faint });
  text(s, "아이의 그림을\n움직이고 이야기로\n만들어 보자.", MX, 2.75, lw, 1.6, { size: 21, bold: true, ls: 1.4 });
  text(s, "→", MX + lw - 0.1, 3.2, 0.6, 0.6, { size: 28, color: C.accent });
  const items = [
    ["사용자 경험", "화면설계서 · 사용자 Flow"], ["서비스 기능", "기능정의서"], ["시스템 처리", "Flow Chart"],
    ["전체 구조", "시스템 아키텍처"], ["Backend", "Service · Public API · DB 구조"],
    ["AI Runtime", "Detection → Pose → Mask → Skeleton → Render"], ["AI Model", "Dataset → Preprocessing → Training → Evaluation"],
  ];
  const gx = MX + lw + 0.8, gw = (W - MX - gx - 0.4) / 2, rh = 0.88;
  items.forEach(([k, v], i) => {
    const x = gx + (i % 2) * (gw + 0.4), y = 2.35 + Math.floor(i / 2) * rh;
    hline(s, x, y, gw);
    text(s, k, x, y + 0.13, gw, 0.28, { size: 11, bold: true, color: C.accent });
    text(s, v, x, y + 0.42, gw, 0.4, { size: 14, bold: true });
  });
  s.addNotes("처음에는 '아이의 그림을 움직이고 이야기로 만들어 보자'는 한 문장이었습니다. 10월 2일 지금은 사용자 경험, 서비스 기능, 시스템 처리, 전체 구조, Backend, AI Runtime, AI Model 일곱 가지로 구체화되었습니다.");
}

// ─────────────────────────── 20. 다음 단계 ───────────────────────────
{
  const s = slide({ section: SEC_D });
  title(s, "설계한 것을 하나로 이어 동작하게 만듭니다", "다음 단계");
  const lanes = [
    ["Frontend", ["화면 구현", "API 연결", "Joint Overlay", "Joint 보정", "Story · Animation UI"]],
    ["Backend", ["FastAPI 구현", "DB 구축", "Character · Story API", "AI Runtime 연동"]],
    ["A1 AI Runtime", ["실행환경 구축", "Analyze Pipeline", "Skeleton · Render", "A2 Model Adapter"]],
    ["A2 Model", ["전체 Dataset 학습", "Evaluation", "Model 개선", "A1 Runtime 통합"]],
  ];
  lanes.forEach(([k, steps], i) => {
    const y = 2.35 + i * 0.72;
    hline(s, MX, y, CW);
    square(s, MX, y + 0.27, 0.14, STAGE[i]);
    text(s, k, MX + 0.3, y + 0.18, 2.2, 0.35, { size: 14, bold: true });
    text(s, chain(steps), MX + 2.7, y + 0.2, CW - 2.7, 0.35, { size: 13 });
  });
  hline(s, MX, 2.35 + 4 * 0.72, CW);
  box(s, 0, 5.55, W, H - 5.55, C.navy, 0);
  text(s, "최종 목표", MX, 5.85, 2, 0.3, { size: 12, color: C.butter });
  text(s, chain(["Draw", "AI Understands", "Character Moves", "Child Chooses", "Story Grows"], { color: C.white, arrow: C.butter, bold: true }),
    MX, 6.2, CW, 0.45, { size: 19 });
  s.addNotes("다음 단계는 설계한 것을 하나로 이어 동작하게 만드는 것입니다. 네 영역이 각자 구현하면서, 최종적으로 아이가 그리고, AI가 이해하고, 캐릭터가 움직이고, 아이가 고르고, 이야기가 자라는 흐름을 완성하는 것이 목표입니다.");
}

// ─────────────────────────── 21. 마무리 ───────────────────────────
{
  const s = slide({ dark: true, number: false });
  box(s, 7.75, 0, W - 7.75, H, C.white, 0);
  img(s, IMG("char-joints-sm.jpg"), 8.55, 0.95, 4.0, 4.0 * 602 / 508);
  text(s, "그리고 모두 오래오래 행복하게 지냈답니다", MX, 2.0, 6.4, 0.4, { size: 15, color: C.butter });
  text(s, "감사합니다", MX, 2.55, 6.4, 1.1, { size: 54, bold: true, color: C.white, cs: -1 });
  text(s, "궁금한 점을 들려주세요", MX, 3.85, 6.4, 0.5, { size: 20, color: C.white });
  text(s, "설계 문서   github.com/seominji58/drawtale-pt_docs", MX, 6.3, 6.4, 0.35, { size: 12, color: C.navySoft,
    extra: { hyperlink: { url: "https://github.com/seominji58/drawtale-pt_docs" } } });
  s.addNotes("들어 주셔서 감사합니다. 질문 있으시면 편하게 말씀해 주세요.");
}

// ─────────────────────────── 22. 참고 자료 ───────────────────────────
{
  const s = slide();
  title(s, "참고 자료", "배경조사 출처");
  const refs = R.references, half = Math.ceil(refs.length / 2);
  [refs.slice(0, half), refs.slice(half)].forEach((col, ci) => {
    const x = MX + ci * (CW / 2 + 0.2), w = CW / 2 - 0.2;
    const runs = [];
    col.forEach((r, i) => {
      runs.push({ text: `[${r.no}]  ${r.title}`, options: { bold: true, breakLine: true } });
      runs.push({ text: r.meta, options: { color: C.soft, breakLine: true } });
      runs.push({ text: r.url, options: { color: C.accent, hyperlink: { url: r.url }, breakLine: i < col.length - 1 } });
      if (i < col.length - 1) runs.push({ text: " ", options: { fontSize: 5, breakLine: true } });
    });
    text(s, runs, x, 2.0, w, 4.6, { size: 9.5, ls: 1.15 });
  });
  s.addNotes("배경조사에 쓴 자료의 출처입니다. 기존 서비스 기능 비교는 발표 직전에 각 서비스의 최신 기능을 다시 확인합니다.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
