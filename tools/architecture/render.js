// 시스템 아키텍처 그림을 만든다.
//   cd tools/architecture && npm install && node render.js
//   → assets/architecture/system-architecture.png (3200×2160)
// architecture.html 의 {{icon:slug}} 를 simple-icons 로고(브랜드 색)로 바꾸고, 설치된 Chrome 으로 찍는다.
// Chrome 위치가 다르면 CHROME_PATH 환경변수로 알려 준다.
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const si = require("simple-icons");

const here = __dirname;
const out = path.join(here, "../../assets/architecture/system-architecture.png");
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const icons = Object.values(si).filter((i) => i && i.slug);
let html = fs.readFileSync(path.join(here, "architecture.html"), "utf8");
html = html.replace(/\{\{icon:([a-z0-9]+)\}\}/g, (_, slug) => {
  const ic = icons.find((i) => i.slug === slug);
  if (!ic) throw new Error(`simple-icons 에 ${slug} 가 없습니다`);
  const color = ic.hex === "000000" || ic.hex === "181717" ? "20263D" : ic.hex;
  return ic.svg.replace("<svg ", `<svg fill="#${color}" aria-label="${ic.title}" `);
});
const tmp = path.join(here, "_rendered.html");
fs.writeFileSync(tmp, html);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1080, deviceScaleFactor: 2 });
  await page.goto("file:///" + tmp.replace(/\\/g, "/"), { waitUntil: "networkidle0" });
  await page.screenshot({ path: out });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log("wrote", out);
})().catch((e) => { console.error(e); process.exit(1); });
