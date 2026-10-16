// Render 5 premium 1080x1920 Shorts thumbnails (Baloo Da 2 display font, exact ranges).
// Run: node tools/build_five_thumbs.js
// In: shorts_full_meta.json (hook/pill) + visual_assets/bg_full{P}.jpg
// Out: renders/shorts_full/thumb_bn_full{P}.jpg
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const META = require('../projects/sample_first_king/renders/shorts_full/shorts_full_meta.json');
const toBn = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

function htmlFor(p, bgUri) {
  const badge = 'পর্ব ' + toBn(p.part) + ' • ' + toBn(p.label).replace(/ - /g, ' - ');
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@600;700;800&family=Hind+Siliguri:wght@600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;position:relative;background:#000;font-family:'Hind Siliguri','Segoe UI',sans-serif}
.bg{position:absolute;top:0;left:0;width:1080px;height:1920px;object-fit:cover}
.topv{position:absolute;top:0;left:0;width:100%;height:760px;background:linear-gradient(180deg,rgba(0,0,0,.94) 0%,rgba(0,0,0,.78) 45%,rgba(0,0,0,0) 100%)}
.botv{position:absolute;bottom:0;left:0;width:100%;height:420px;background:linear-gradient(0deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.55) 55%,rgba(0,0,0,0) 100%)}
.head{position:absolute;top:56px;left:48px;right:48px;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:10}
.pill{display:inline-flex;align-items:center;gap:12px;background:linear-gradient(135deg,#FF1744 0%,#B71C1C 100%);color:#fff;padding:16px 38px;border-radius:999px;font-family:'Baloo Da 2',sans-serif;font-size:37px;font-weight:800;box-shadow:0 10px 30px rgba(213,0,0,.65);border:3px solid rgba(255,255,255,.92);margin-bottom:26px}
.hook{font-family:'Baloo Da 2',sans-serif;font-size:78px;font-weight:800;line-height:1.18;color:#fff;margin-bottom:22px;padding:0 8px;text-shadow:0 4px 0 #7f0000,0 8px 22px rgba(0,0,0,.95),0 0 44px rgba(255,110,0,.45)}
.hl{background:linear-gradient(135deg,#FFD600 0%,#FF9100 100%);color:#221500;font-family:'Baloo Da 2',sans-serif;font-size:47px;font-weight:800;padding:14px 40px;border-radius:22px;border:4px solid #fff;box-shadow:0 12px 32px rgba(0,0,0,.85);display:inline-block}
.foot{position:absolute;bottom:52px;left:50px;right:50px;display:flex;justify-content:space-between;align-items:center;z-index:10}
.brand{background:rgba(0,0,0,.78);border:2px solid rgba(255,255,255,.45);padding:12px 28px;border-radius:999px;color:#FFD54F;font-size:28px;font-weight:700}
.series{background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.6);padding:12px 28px;border-radius:999px;color:#fff;font-size:28px;font-weight:700}
</style></head><body>
<img class="bg" src="${bgUri}"/>
<div class="topv"></div><div class="botv"></div>
<div class="head"><div class="pill"><span>👑</span><span>${badge}</span></div>
<h1 class="hook">${p.hook}</h1><div class="hl">${p.pill}</div></div>
<div class="foot"><div class="brand">🎬 Simple History Teller Bangla</div><div class="series">ইতিহাস শর্টস ⏳</div></div>
</body></html>`;
}

async function run() {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const p of META.parts) {
    const bg = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets', 'bg_full' + p.part + '.jpg');
    const uri = 'data:image/jpeg;base64,' + fs.readFileSync(bg).toString('base64');
    const out = path.join(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full', 'thumb_bn_full' + p.part + '.jpg');
    await page.setContent(htmlFor(p, uri), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
    console.log('THUMB' + p.part + ' OK ' + (fs.statSync(out).size / 1024).toFixed(0) + 'KB');
  }
  await browser.close();
  console.log('ALL 5 THUMBS DONE');
}
run().then(() => process.exit(0)).catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
