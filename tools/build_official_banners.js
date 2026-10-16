const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const BG_PATH = path.join(ARTIFACTS_DIR, 'banner_background_raw.jpg');
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');

const CHANNELS = [
  {
    id: 'c1_english',
    filename: 'banner_simple_history_teller_en.jpg',
    title: 'SIMPLE HISTORY TELLER',
    tagline: 'UNRAVELING THE GREATEST STORIES OF HUMAN HISTORY',
    badge: '★ NEW EPISODE EVERY 2 DAYS • 3 EPISODES WEEKLY ★',
    handle: '@SimpleHistoryTellerOfficial'
  },
  {
    id: 'c2_bangla',
    filename: 'banner_simple_history_teller_bn.jpg',
    title: 'SIMPLE HISTORY TELLER বাংলা',
    tagline: 'ইতিহাসের জানা-অজানা রোমাঞ্চকর সব মহাকাব্যিক গল্প',
    badge: '★ প্রতি ২ দিন পরপর নতুন পর্ব • সপ্তাহে ৩টি এপিসোড ★',
    handle: '@SimpleHistoryTellerBangla'
  },
  {
    id: 'c3_hindi',
    filename: 'banner_simple_history_teller_hi.jpg',
    title: 'SIMPLE HISTORY TELLER हिंदी',
    tagline: 'इतिहास की अनकही, रहस्यमयी और रोचक कहानियाँ',
    badge: '★ हर २ दिन में नया एपिसोड • हफ़्ते में ३ एपिसोड ★',
    handle: '@SimpleHistoryTellerHindi'
  }
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  const bgBase64 = fs.readFileSync(BG_PATH).toString('base64');
  const logoBase64 = fs.readFileSync(LOGO_PATH).toString('base64');

  for (const ch of CHANNELS) {
    console.log(`Rendering updated official banner for ${ch.id} (${ch.title})...`);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Hind+Siliguri:wght@600;700&family=Rozha+One&family=Montserrat:wght@600;800&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 2048px;
          height: 1152px;
          overflow: hidden;
          background: #000;
          font-family: 'Cinzel', 'Hind Siliguri', 'Montserrat', serif;
        }
        .banner-container {
          position: relative;
          width: 2048px;
          height: 1152px;
          background-image: url('data:image/jpeg;base64,${bgBase64}');
          background-size: cover;
          background-position: center;
        }
        /* Cinematic Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(10, 18, 36, 0.4) 0%, rgba(5, 10, 25, 0.82) 100%);
        }
        /* Center Safe-Area Banner Bar */
        .safe-area-overlay {
          position: absolute;
          top: 357px;
          height: 438px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 100px;
          background: linear-gradient(90deg, rgba(6,12,28,0) 0%, rgba(8,16,38,0.75) 20%, rgba(8,16,38,0.85) 50%, rgba(8,16,38,0.75) 80%, rgba(6,12,28,0) 100%);
          border-top: 2px solid rgba(212, 175, 55, 0.35);
          border-bottom: 2px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
        }
        .content-wrapper {
          display: flex;
          align-items: center;
          gap: 50px;
          max-width: 1550px;
          width: 100%;
          justify-content: center;
        }
        .logo-frame {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          border: 6px solid #D4AF37;
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.7), 0 15px 35px rgba(0,0,0,0.85);
          overflow: hidden;
          background: #0B1736;
          flex-shrink: 0;
        }
        .logo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .text-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-shadow: 0 4px 15px rgba(0,0,0,0.9);
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(212, 175, 55, 0.2);
          border: 1.5px solid #D4AF37;
          border-radius: 30px;
          padding: 7px 22px;
          color: #FEE78A;
          font-family: 'Montserrat', 'Hind Siliguri', sans-serif;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }
        .main-title {
          font-size: 64px;
          font-weight: 900;
          letter-spacing: 3px;
          line-height: 1.1;
          margin-bottom: 12px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F5DE88 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.9));
        }
        .tagline {
          font-size: 24px;
          font-weight: 600;
          color: #E6E8ED;
          letter-spacing: 1.5px;
          margin-bottom: 14px;
          font-family: 'Montserrat', 'Hind Siliguri', sans-serif;
        }
        .handle-bar {
          font-size: 20px;
          color: #9EABBA;
          letter-spacing: 1.5px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="banner-container">
        <div class="vignette"></div>
        <div class="safe-area-overlay">
          <div class="content-wrapper">
            <div class="logo-frame">
              <img src="data:image/jpeg;base64,${logoBase64}" />
            </div>
            <div class="text-group">
              <div class="badge-pill">${ch.badge}</div>
              <h1 class="main-title">${ch.title}</h1>
              <div class="tagline">${ch.tagline}</div>
              <div class="handle-bar">${ch.handle}</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setViewportSize({ width: 2048, height: 1152 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const outPath = path.join(ARTIFACTS_DIR, ch.filename);
    await page.screenshot({ path: outPath, quality: 95, type: 'jpeg' });
    console.log(`Saved updated official banner: ${outPath} (${fs.statSync(outPath).size} bytes)`);
  }

  await page.close();
  console.log('All 3 official channel banners updated successfully!');
  process.exit(0);
})();
