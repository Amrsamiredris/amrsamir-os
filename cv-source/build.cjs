// Renders cv-source/general.html to public/files/cv/amr-samir-edris-cv.pdf
// Usage: node cv-source/build.cjs   (needs Playwright + Chromium)
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/npm-tools/node_modules/playwright")); }
(async () => {
  const src = path.join(__dirname, "general.html");
  const out = path.join(__dirname, "..", "public", "files", "cv", "amr-samir-edris-cv.pdf");
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + src, { waitUntil: "load" });
  await p.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  await b.close();
  console.log("wrote", out);
})();
