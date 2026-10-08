// 주간 보고 슬라이드 2장 (Backend / PM · 서민지)
// 중간발표 덱(DrawTale_중간발표.pptx) 16번 슬라이드의 디자인 토큰을 그대로 쓴다.
//   흰 바탕 · 맑은 고딕 · 제목 30pt · 얇은 회색선 0.75pt · 강조색 하나 · 화살표는 글자 →
// 실행: node tools/deck/weekly_1008.js

const pptxgen = require("pptxgenjs");

const F = "Malgun Gothic";
const INK = "39405C"; // 제목 · 본문
const MID = "4A5170"; // 설명
const DIM = "8A91AA"; // 캡션 · 쪽번호
const BLUE = "4C5CC4"; // PART 라벨
const PINK = "E0607A"; // 「다음」
const LINE = "D9DDF0"; // 얇은 가로선
const PANEL = "FDFEFF"; // 줄 바탕
const TAG = "FDE0E6"; // 역할 태그 · 강조 박스
const PALE = { blue: "DDE2FF", green: "DCF2E4", gold: "FFF1C2", pink: "FDE0E6" };

const pres = new pptxgen();
pres.defineLayout({ name: "DT", width: 13.333, height: 7.5 });
pres.layout = "DT";
pres.author = "서민지";
pres.title = "DrawTale 주간 보고 — Backend";

// ── 공통 조각 ────────────────────────────────────────────────────────────────

function frame(slide, part, title, num) {
  slide.addText("Backend / PM · 서민지", {
    x: 0.7, y: 0.51, w: 2.2, h: 0.33, isTextBox: true, margin: 0,
    fill: { color: TAG }, align: "center", valign: "middle",
    fontFace: F, fontSize: 11, color: INK,
  });
  slide.addText(part, {
    x: 3.05, y: 0.5, w: 9.58, h: 0.35, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 13, color: BLUE,
  });
  slide.addText(title, {
    x: 0.7, y: 0.88, w: 11.93, h: 0.8, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 30, bold: true, color: INK,
  });
  slide.addText(String(num), {
    x: 12.23, y: 6.95, w: 0.5, h: 0.3, isTextBox: true, margin: 0,
    align: "right", fontFace: F, fontSize: 10, color: DIM,
  });
}

function header(slide, x, y, w, label, note) {
  const runs = [{ text: label, options: { bold: true, color: INK } }];
  if (note) runs.push({ text: "   " + note, options: { color: DIM, fontSize: 10.5 } });
  slide.addText(runs, {
    x, y, w, h: 0.33, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 12,
  });
}

// 줄 하나: 왼쪽 알약 + 이름 + 설명
function row(slide, { x, y, w, tag, tagColor, name, desc }) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.59, fill: { color: PANEL }, line: { color: LINE, width: 0.75 },
  });
  slide.addText(tag, {
    x: x + 0.17, y: y + 0.13, w: 0.98, h: 0.33, isTextBox: true, margin: 0,
    fill: { color: tagColor }, align: "center", valign: "middle",
    fontFace: F, fontSize: 10.5, color: INK,
  });
  slide.addText(name, {
    x: x + 1.31, y, w: 2.5, h: 0.59, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 14, color: INK,
  });
  slide.addText(desc, {
    x: x + 3.9, y, w: 2.66, h: 0.59, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 10, color: MID,
  });
}

// 오른쪽 칸 안의 줄 (바탕 없이 얇은 선으로만 나눈다)
// step 이 비면 번호 칸을 두지 않고 이름을 칸 왼쪽에 맞춘다
function panelRow(slide, { x, y, w, step, name, desc }) {
  const indent = step ? 0.36 : 0;
  if (step) {
    slide.addText(step, {
      x, y, w: 0.3, h: 0.46, isTextBox: true, margin: 0,
      valign: "middle", fontFace: F, fontSize: 11, color: BLUE,
    });
  }
  slide.addText(name, {
    x: x + indent, y, w: 1.55, h: 0.46, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 12.5, color: INK,
  });
  slide.addText(desc, {
    x: x + indent + 1.63, y, w: w - indent - 1.63, h: 0.46, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 10, color: MID,
  });
  slide.addShape(pres.ShapeType.line, {
    x, y: y + 0.54, w, h: 0, line: { color: LINE, width: 0.75 },
  });
}

function footer(slide, items, next) {
  const xs = [0.7, 3.1, 6.3];
  const ws = [2.3, 3.1, 3.2];
  items.forEach((t, i) => {
    slide.addText(t, {
      x: xs[i], y: 6.26, w: ws[i], h: 0.33, isTextBox: true, margin: 0,
      valign: "middle", fontFace: F, fontSize: 9.5, color: MID,
    });
  });
  slide.addText([
    { text: "다음   ", options: { color: PINK, bold: true } },
    { text: next, options: { color: MID } },
  ], {
    x: 9.61, y: 6.26, w: 3.02, h: 0.33, isTextBox: true, margin: 0,
    valign: "middle", fontFace: F, fontSize: 9.5,
  });
}

// ── 슬라이드 1 · 전체 처리 흐름 · Agent 호출 설계 ────────────────────────────

const s1 = pres.addSlide();
frame(s1, "주간 보고 · 10/8  ①", "요청 하나가 이야기와 영상이 되기까지를 설계했습니다", 1);

header(s1, 0.7, 1.75, 6.56, "전체 처리 흐름", "Frontend → Backend → AI → Storage → Frontend");

const flow = [
  ["1", PALE.blue, "Frontend", "그림 업로드 · 네 칸 선택"],
  ["2", PALE.green, "Backend", "검증 · 저장 · Job 생성 → 202 즉시 응답"],
  ["3", PALE.gold, "AI Runtime", "관절 15개 분석 · 애니메이션 렌더"],
  ["4", PALE.pink, "Storage", "그림 · 음성 · 영상 파일 보관"],
  ["5", PALE.blue, "Frontend", "Job 상태 확인 → 결과 재생"],
];
flow.forEach(([tag, tagColor, name, desc], i) => {
  row(s1, { x: 0.7, y: 2.15 + i * 0.63, w: 6.67, tag, tagColor, name, desc });
});

s1.addText(
  "오래 걸리는 분석 · 이야기 생성은 기다리지 않고 Job으로 받습니다.\n사용자는 바로 「만드는 중」 화면을 봅니다.",
  {
    x: 0.7, y: 5.4, w: 6.67, h: 0.68, isTextBox: true, margin: 0.06,
    fill: { color: TAG }, valign: "middle", lineSpacingMultiple: 1.15,
    fontFace: F, fontSize: 10.5, color: INK,
  }
);

s1.addShape(pres.ShapeType.rect, {
  x: 7.7, y: 1.75, w: 4.93, h: 4.32, fill: { color: PANEL }, line: { color: LINE, width: 0.75 },
});
header(s1, 7.97, 1.86, 4.38, "Agent 호출 순서와 책임");

const agents = [
  ["1", "이야기 생성", "OpenAI · 네 칸 → 네 문장"],
  ["2", "안전성 검사", "Moderation · 입력과 결과 모두"],
  ["3", "음성", "TTS · 또박또박 읽어주는 MP3"],
  ["4", "애니메이션", "AI Runtime · 보정 관절 → MP4"],
];
agents.forEach(([step, name, desc], i) => {
  panelRow(s1, { x: 7.97, y: 2.5 + i * 0.68, w: 4.38, step, name, desc });
});

s1.addText(
  "호출 순서 · 실패 처리 · 결과 저장은 모두 Backend가 맡습니다.\nFrontend와 AI는 서로를 직접 부르지 않습니다.",
  {
    x: 7.97, y: 5.34, w: 4.38, h: 0.6, isTextBox: true, margin: 0,
    valign: "top", lineSpacingMultiple: 1.2, fontFace: F, fontSize: 9.5, color: DIM,
  }
);

footer(s1,
  ["외부 API 키는 Backend에만", "AI 서버는 내부 전용 (/internal/v1)", "한 곳이 실패해도 이야기는 만들어짐"],
  "Blob 저장소 연결");

s1.addNotes(
  "이번 주에는 기능을 더 넣기 전에, 요청 하나가 어떤 순서로 처리되는지를 먼저 정리했습니다.\n" +
  "사용자가 그림을 올리면 Backend가 받아서 저장하고, AI 서버에 분석을 맡기고, " +
  "결과를 다시 캐릭터와 연결합니다.\n" +
  "이야기·검사·음성·애니메이션은 외부 서비스 네 곳을 부르는 일이라, " +
  "누가 어떤 순서로 부르고 실패하면 어떻게 할지를 Backend 한 곳에 모았습니다."
);

// ── 슬라이드 2 · 비동기 Job · 오류 처리 · 기본 구조 ──────────────────────────

const s2 = pres.addSlide();
frame(s2, "주간 보고 · 10/8  ②", "오래 걸리는 작업을 Job으로 나누고 기본 구조를 세웠습니다", 2);

header(s2, 0.7, 1.75, 6.56, "비동기 Job · 오류 처리", "40초 걸리는 작업도 화면은 멈추지 않습니다");

const jobs = [
  ["Job", PALE.blue, "Job ID 발급", "요청 즉시 202로 돌려줌"],
  ["상태", PALE.green, "Polling", "pending → running → succeeded"],
  ["시간", PALE.gold, "Timeout", "분석 60초 · 렌더 300초 상한"],
  ["실패", PALE.pink, "Fallback", "한 곳이 실패해도 나머지는 진행"],
];
jobs.forEach(([tag, tagColor, name, desc], i) => {
  row(s2, { x: 0.7, y: 2.19 + i * 0.7, w: 6.67, tag, tagColor, name, desc });
});

s2.addText("Job 상태 네 가지 · 오류 코드 12종 · 외부 서비스 세 곳을 각각 격리", {
  x: 0.7, y: 5.05, w: 6.67, h: 0.33, isTextBox: true, margin: 0,
  valign: "middle", fontFace: F, fontSize: 9.5, color: DIM,
});

s2.addText(
  "AI·OpenAI의 내부 오류 메시지는 밖으로 내보내지 않습니다.\nBackend가 아이가 읽을 한국어 문장으로 바꿔 보냅니다.",
  {
    x: 0.7, y: 5.4, w: 6.67, h: 0.68, isTextBox: true, margin: 0.06,
    fill: { color: TAG }, valign: "middle", lineSpacingMultiple: 1.15,
    fontFace: F, fontSize: 10.5, color: INK,
  }
);

s2.addShape(pres.ShapeType.rect, {
  x: 7.7, y: 1.75, w: 4.93, h: 4.32, fill: { color: PANEL }, line: { color: LINE, width: 0.75 },
});
header(s2, 7.97, 1.86, 4.38, "FastAPI · DB 기본 구조", "구현 완료");

const layers = [
  ["api", "요청을 받는 층 · 엔드포인트 11개"],
  ["schemas", "형식 검증 · 관절 15개 · 오류 형식"],
  ["services", "AI · 이야기 · 음성 · 파일 저장"],
  ["models", "DB 테이블 8개 · Alembic 6단계"],
];
layers.forEach(([name, desc], i) => {
  panelRow(s2, { x: 7.97, y: 2.5 + i * 0.68, w: 4.38, step: "", name, desc });
});

s2.addText(
  "characters · joint_corrections · jobs · stories · story_activities\nusers · social_accounts · auth_tokens",
  {
    x: 7.97, y: 5.34, w: 4.38, h: 0.6, isTextBox: true, margin: 0,
    valign: "top", lineSpacingMultiple: 1.2, fontFace: F, fontSize: 9, color: DIM,
  }
);

footer(s2,
  ["계층 분리로 고칠 범위를 좁힘", "자동 테스트 46개 · 린트 통과", "환경은 .env 교체만으로 전환"],
  "Blob 저장소 · Azure 배포");

s2.addNotes(
  "애니메이션 한 편을 만드는 데 40초가 걸립니다. 그 시간을 사용자가 기다리게 할 수 없어서, " +
  "요청을 받으면 바로 Job 번호를 돌려주고 화면은 「만드는 중」으로 넘어가게 했습니다.\n" +
  "외부 서비스가 실패해도 서비스 전체가 멈추지 않도록, 이야기가 실패하면 기본 문장으로, " +
  "음성이 실패하면 음성만 빼고 나머지를 보여 줍니다.\n" +
  "그 위에 FastAPI 프로젝트와 DB 구조를 네 개 층으로 나눠 구현했습니다. " +
  "한 층이 바뀌어도 다른 층은 고치지 않습니다."
);

pres.writeFile({ fileName: "presentation/주간보고_1008_Backend.pptx" }).then((f) => {
  console.log("만들었습니다:", f);
});
