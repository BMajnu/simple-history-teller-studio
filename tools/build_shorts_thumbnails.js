const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const shortsData = [
  {
    part: 1,
    imgSrc: 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf\\thumb_clean_part1_1791724299135.jpg',
    outFile: path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part1.jpg'),
    partBadge: 'পর্ব ০১ • সময়: ১ মিনিট ১৩ সেকেন্ড',
    hookTitle: 'মানুষ কীভাবে প্রথম রাজা বানাল?',
    highlightBadge: 'শিকারিকে উপহাস ও সাম্য!',
    summary: 'কালাহারির শিকারি সমাজ ও অহংকার দমনের ইতিহাস'
  },
  {
    part: 2,
    imgSrc: 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf\\thumb_clean_part2_1791724327166.jpg',
    outFile: path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part2.jpg'),
    partBadge: 'পর্ব ০২ • সময়: ১ মিনিট ১৮ সেকেন্ড',
    hookTitle: 'কৃষিকাজের মারণফাঁদ!',
    highlightBadge: 'শস্যভাণ্ডার ও প্রথম উদ্বৃত্ত সম্পদ',
    summary: 'কৃষির শুরু এবং সম্পদের লোভে সমাজ পরিবর্তনের ফাঁদ'
  },
  {
    part: 3,
    imgSrc: 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf\\thumb_clean_part3_1791724352258.jpg',
    outFile: path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part3.jpg'),
    partBadge: 'পর্ব ০৩ • সময়: ১ মিনিট ১৯ সেকেন্ড',
    hookTitle: 'পৃথিবীর প্রথম কর ও ট্যাক্স!',
    highlightBadge: 'ইতিহাসের প্রথম ডন ও মাফিয়া',
    summary: 'অস্ত্রধারী পাহাদার থেকে রাজার রক্ষীবাহিনীর জন্ম'
  },
  {
    part: 4,
    imgSrc: 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf\\thumb_clean_part4_1791724378441.jpg',
    outFile: path.resolve(__dirname, '..', 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part4.jpg'),
    partBadge: 'পর্ব ০৪ • সময়: ১ মিনিট ১৫ সেকেন্ড',
    hookTitle: 'সুমেরীয় সম্রাট সার্গন!',
    highlightBadge: 'প্রথম সিংহাসন ও স্থায়ী সেনাবাহিনী',
    summary: 'আকাশ থেকে নামল রাজতন্ত্র এবং প্রথম বিশ্বসাম্রাজ্য'
  }
];

function generateHtml(item) {
  const bgBase64 = fs.readFileSync(item.imgSrc).toString('base64');
  const bgDataUri = `data:image/jpeg;base64,${bgBase64}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@600;700;800&family=Tiro+Bangla&family=Poppins:wght@700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      font-family: 'Hind Siliguri', 'Segoe UI', sans-serif;
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
    /* Top vignette gradient for text contrast */
    .top-vignette {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 700px;
      background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.0) 100%);
    }
    /* Bottom vignette gradient */
    .bottom-vignette {
      position: absolute;
      bottom: 0; left: 0;
      width: 100%;
      height: 380px;
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
      padding: 14px 34px;
      border-radius: 999px;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.5px;
      box-shadow: 0 10px 30px rgba(213, 0, 0, 0.65), 0 0 15px rgba(255, 23, 68, 0.5);
      border: 3px solid rgba(255, 255, 255, 0.9);
      margin-bottom: 24px;
    }
    .hook-title {
      font-size: 68px;
      font-weight: 800;
      line-height: 1.15;
      color: #FFF;
      text-shadow: 0 6px 16px rgba(0,0,0,0.95), 0 0 35px rgba(0,0,0,0.8);
      margin-bottom: 18px;
      padding: 0 10px;
    }
    .highlight-pill {
      background: linear-gradient(135deg, #FFD600 0%, #FFAB00 100%);
      color: #1A1A1A;
      font-size: 42px;
      font-weight: 800;
      padding: 12px 36px;
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
      background: rgba(0, 0, 0, 0.75);
      border: 2px solid rgba(255, 255, 255, 0.4);
      padding: 12px 28px;
      border-radius: 999px;
      color: #FFD54F;
      font-size: 28px;
      font-weight: 700;
      backdrop-filter: blur(8px);
      letter-spacing: 0.5px;
    }
    .series-tag {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.6);
      padding: 12px 28px;
      border-radius: 999px;
      color: #FFF;
      font-size: 28px;
      font-weight: 700;
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
    <div class="channel-brand">🎬 Simple History Teller Bangla</div>
    <div class="series-tag">ইতিহাস শর্টস ⏳</div>
  </div>
</body>
</html>
  `;
}

async function run() {
  console.log('Launching headless browser to render custom 1080x1920 Shorts thumbnails...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  });

  for (const item of shortsData) {
    console.log(`Rendering Short Part ${item.part} thumbnail...`);
    const html = generateHtml(item);
    await page.setContent(html, { waitUntil: 'networkidle' });
    // Small pause for webfonts to settle
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: item.outFile,
      type: 'jpeg',
      quality: 92
    });

    const size = (fs.statSync(item.outFile).size / 1024).toFixed(1);
    console.log(`Saved Short Part ${item.part} thumbnail -> ${item.outFile} (${size} KB)`);
  }

  await browser.close();
  console.log('All 4 Shorts thumbnails successfully rendered!');
}

run().catch(console.error);
