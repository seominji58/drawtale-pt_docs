// 발표용 한 장 그림을 만든다 (시스템 아키텍처 · 기능 정의서).
//   cd tools/poster && npm install
//   node render.js            # 전부
//   node render.js feature    # 이름에 feature 가 들어간 것만
// HTML 의 로고 자리(중괄호 두 개 + icon:이름)를 simple-icons 로고(브랜드 색)로 바꾸고, 설치된 Chrome 으로 찍는다.
// Chrome 위치가 다르면 CHROME_PATH 환경변수로 알려 준다.
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const si = require("simple-icons");

const here = __dirname;
const POSTERS = [
  { html: "architecture.html", out: "../../assets/architecture/system-architecture.png" },
  { html: "feature-spec.html", out: "../../assets/feature-spec/feature-spec.png" },
];
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const icons = Object.values(si).filter((i) => i && i.slug);

function inject(html) {
  return html.replace(/\{\{icon:([a-z0-9]+)\}\}/g, (_, slug) => {
    const ic = icons.find((i) => i.slug === slug);
    if (!ic) throw new Error(`simple-icons 에 ${slug} 가 없습니다`);
    const color = ic.hex === "000000" || ic.hex === "181717" ? "20263D" : ic.hex;
    return ic.svg.replace("<svg ", `<svg fill="#${color}" aria-label="${ic.title}" `);
  });
}

(async () => {
  const only = process.argv[2];
  const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] });
  for (const p of POSTERS.filter((x) => !only || x.html.includes(only))) {
    const tmp = path.join(here, "_" + p.html);
    fs.writeFileSync(tmp, inject(fs.readFileSync(path.join(here, p.html), "utf8")));
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1080, deviceScaleFactor: 2 });
    await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle0" });
    const out = path.join(here, p.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out });
    await page.close();
    fs.unlinkSync(tmp);
    console.log("wrote", out);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
