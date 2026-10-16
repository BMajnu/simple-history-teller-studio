const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts');
const BRAIN_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const enData = [
  {
    part: 1,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part1_1791724299135.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_en_part1.jpg'),
    partBadge: 'PART 01 • 1:11 MIN',
    hookTitle: 'How Humans Invented the First King!',
    highlightBadge: 'Mocking Arrogance & Fierce Equality!',
    brand: '🎬 Simple History Teller',
    tag: 'History Shorts ⏳'
  },
  {
    part: 2,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part2_1791724327166.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_en_part2.jpg'),
    partBadge: 'PART 02 • 1:15 MIN',
    hookTitle: 'The Agricultural Trap & First Wealth!',
    highlightBadge: 'Grain Hoarding & Ancient Fear!',
    brand: '🎬 Simple History Teller',
    tag: 'History Shorts ⏳'
  },
  {
    part: 3,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part3_1791724352258.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_en_part3.jpg'),
    partBadge: 'PART 03 • 1:17 MIN',
    hookTitle: "World's First Taxes & Protection Racket!",
    highlightBadge: "History's Very First Don & Mafia!",
    brand: '🎬 Simple History Teller',
    tag: 'History Shorts ⏳'
  },
  {
    part: 4,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part4_1791724378441.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_en_part4.jpg'),
    partBadge: 'PART 04 • 1:14 MIN',
    hookTitle: 'Sumerian Kings & The Golden Throne!',
    highlightBadge: 'First Standing Army & Empire!',
    brand: '🎬 Simple History Teller',
    tag: 'History Shorts ⏳'
  }
];

const hiData = [
  {
    part: 1,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part1_1791724299135.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_hi_part1.jpg'),
    partBadge: 'भाग ०१ • १:१६ मिनट',
    hookTitle: 'इंसानों ने पहला राजा कैसे बनाया?',
    highlightBadge: 'शिकारी का मज़ाक और बराबरी!',
    brand: '🎬 Simple History Teller Hindi',
    tag: 'इतिहास शॉर्ट्स ⏳'
  },
  {
    part: 2,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part2_1791724327166.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_hi_part2.jpg'),
    partBadge: 'भाग ०২ • १:१७ मिनट',
    hookTitle: 'खेती का जाल और अनाज के गोदाम!',
    highlightBadge: 'पहले लालच और डर का जन्म!',
    brand: '🎬 Simple History Teller Hindi',
    tag: 'इतिहास शॉर्ट्स ⏳'
  },
  {
    part: 3,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part3_1791724352258.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_hi_part3.jpg'),
    partBadge: 'भाग ०३ • १:১৯ मिनट',
    hookTitle: 'दुनिया की पहली हफ्ता-वसूली!',
    highlightBadge: 'इतिहास का पहला डॉन और टैक्स!',
    brand: '🎬 Simple History Teller Hindi',
    tag: 'इतिहास शॉर्ट्स ⏳'
  },
  {
    part: 4,
    imgSrc: path.join(BRAIN_DIR, 'thumb_clean_part4_1791724378441.jpg'),
    outFile: path.join(OUT_DIR, 'thumb_hi_part4.jpg'),
    partBadge: 'भाग ०৪ • १:১৫ मिनट',
    hookTitle: 'सुमेरियन राजा और पहला सिंहासन!',
    highlightBadge: 'पहली फौज और सोने का ताज!',
    brand: '🎬 Simple History Teller Hindi',
    tag: 'इतिहास शॉर्ट्स ⏳'
  }
];

function generateHtml(item, isHindi) {
  const bgBase64 = fs.readFileSync(item.imgSrc).toString('base64');
  const bgDataUri = `data:image/jpeg;base64,${bgBase64}`;
  const fontFamily = isHindi 
    ? "'Tiro Devanagari Hindi', 'Hind Siliguri', 'Poppins', sans-serif"
    : "'Poppins', 'Montserrat', sans-serif";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Poppins:wght@700;800;900&family=Tiro+Devanagari+Hindi:wght@700;800&family=Hind+Siliguri:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      font-family: ${fontFamily};
      position: relative;
      background: #000;
    }
    .bg {
      position: absolute;
      top: 0; left: 0;
      width: 1080px;
      height: 1920px;
      object-fit: cover;
    }
    .top-vignette {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 720px;
      background: linear-gradient(180deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.78) 50%, rgba(0,0,0,0.0) 100%);
    }
    .bottom-vignette {
      position: absolute;
      bottom: 0; left: 0;
      width: 100%;
      height: 400px;
      background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);
    }
    .header-container {
      position: absolute;
      top: 60px;
      left: 50px;
      right: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 10;
    }
    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #FF1744 0%, #D50000 100%);
      color: #FFFFFF;
      padding: 14px 36px;
      border-radius: 999px;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 0.5px;
      box-shadow: 0 10px 30px rgba(213, 0, 0, 0.65), 0 0 15px rgba(255, 23, 68, 0.5);
      border: 3px solid rgba(255, 255, 255, 0.95);
      margin-bottom: 22px;
    }
    .hook-title {
      font-size: ${isHindi ? '68px' : '64px'};
      font-weight: 900;
      line-height: 1.15;
      color: #FFF;
      text-shadow: 0 6px 16px rgba(0,0,0,0.95), 0 0 35px rgba(0,0,0,0.85);
      margin-bottom: 20px;
      padding: 0 10px;
    }
    .highlight-pill {
      background: linear-gradient(135deg, #FFD600 0%, #FFAB00 100%);
      color: #1A1A1A;
      font-size: 40px;
      font-weight: 900;
      padding: 12px 38px;
      border-radius: 20px;
      border: 3px solid #FFF;
      box-shadow: 0 12px 30px rgba(0,0,0,0.8);
      display: inline-block;
      text-shadow: none;
    }
    .footer-bar {
      position: absolute;
      bottom: 50px;
      left: 50px;
      right: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .channel-brand {
      background: rgba(0, 0, 0, 0.78);
      border: 2px solid rgba(255, 255, 255, 0.45);
      padding: 14px 30px;
      border-radius: 999px;
      color: #FFD54F;
      font-size: 28px;
      font-weight: 800;
      backdrop-filter: blur(8px);
      letter-spacing: 0.5px;
    }
    .series-tag {
      background: rgba(255, 255, 255, 0.22);
      border: 2px solid rgba(255, 255, 255, 0.65);
      padding: 14px 30px;
      border-radius: 999px;
      color: #FFF;
      font-size: 28px;
      font-weight: 800;
      backdrop-filter: blur(8px);
    }
  </style>
</head>
<body>
  <img class="bg" src="${bgDataUri}" />
  <div class="top-vignette"></div>
  <div class="bottom-vignette"></div>

  <div class="header-container">
    <div class="pill-badge">
      <span>👑</span>
      <span>${item.partBadge}</span>
    </div>
    <h1 class="hook-title">${item.hookTitle}</h1>
    <div class="highlight-pill">${item.highlightBadge}</div>
  </div>

  <div class="footer-bar">
    <div class="channel-brand">${item.brand}</div>
    <div class="series-tag">${item.tag}</div>
  </div>
</body>
</html>
  `;
}

(async () => {
  console.log('Rendering 8 custom 1080x1920 thumbnails (4 English, 4 Hindi)...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  });

  // Render English
  for (const item of enData) {
    console.log(`Rendering English Short Part ${item.part}...`);
    const html = generateHtml(item, false);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: item.outFile, type: 'jpeg', quality: 92 });
    const size = (fs.statSync(item.outFile).size / 1024).toFixed(1);
    console.log(`Saved ${item.outFile} (${size} KB)`);
  }

  // Render Hindi
  for (const item of hiData) {
    console.log(`Rendering Hindi Short Part ${item.part}...`);
    const html = generateHtml(item, true);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: item.outFile, type: 'jpeg', quality: 92 });
    const size = (fs.statSync(item.outFile).size / 1024).toFixed(1);
    console.log(`Saved ${item.outFile} (${size} KB)`);
  }

  await browser.close();
  console.log('All 8 thumbnails successfully generated!');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
