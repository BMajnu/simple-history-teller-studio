const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts');
const RENDERS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const hiReels = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_hi_part1.mp4'),
    title: 'इंसानों का पहला राजा? शिकारी का मज़ाक! 👑 [भाग 1] #Shorts #इतिहास',
    desc: '3 लाख सालों तक बिना किसी राजा के कैसे रहे इंसान? कालाहारी के शिकारियों की दास्तान!\n\n👑 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_hi_part2.mp4'),
    title: 'खेती का जाल और पहले लालच का जन्म! 🌾 [भाग 2] #Shorts #इतिहास',
    desc: 'अनाज के गोदाम भरते ही आया डर और लालच! खेती के जाल में फंसा इंसान पहली बार झुका।\n\n🌾 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_hi_part3.mp4'),
    title: 'दुनिया की पहली हफ्ता-वसूली और पहला डॉन! ⚔️ [भाग 3] #Shorts #इतिहास',
    desc: '20% फसल टैक्स दो, वरना...! मानव इतिहास की पहली हफ्ता-वसूली और पहले डॉन की कहानी।\n\n⚔️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_hi_part4.mp4'),
    title: 'सुमेरियन राजा और पहले सिंहासन का इतिहास! 🏛️ [भाग 4] #Shorts #इतिहास',
    desc: 'आसमान से उतरी राजशाही! सुमेरियन राजाओं की लिस्ट, सोने का ताज और पहली फौज का इतिहास।\n\n🏛️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  }
];

async function switchContextToPage(page, pageUrl, pageName) {
  console.log(`\nNavigating to ${pageName} (${pageUrl})...`);
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch"), button:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log(`Clicking Switch button into ${pageName}...`);
    await switchBtn.click({ force: true });
    await page.waitForTimeout(8000);
    console.log(`Switched context into ${pageName}!`);
  } else {
    console.log(`No switch button visible, context may already be ${pageName}`);
  }
}

async function uploadReel(page, s) {
  console.log(`\n--- Uploading Hindi Reel Part ${s.part}: ${s.title} ---`);
  await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 20000 });

  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log(`Attaching ${s.file} to node ${nodeIds[0]}...`);
  await session.send('DOM.setFileInputFiles', {
    files: [s.file],
    nodeId: nodeIds[0]
  });

  console.log('Waiting for Next button...');
  const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn.waitFor({ state: 'visible', timeout: 35000 });
  console.log('Clicking Next (1)...');
  await nextBtn.click({ force: true });
  await page.waitForTimeout(2000);

  const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    console.log('Clicking Next (2)...');
    await nextBtn2.click({ force: true });
    await page.waitForTimeout(2000);
  }

  console.log('Entering description caption...');
  const fullCaption = `${s.title}\n\n${s.desc}`;
  await page.evaluate((caption) => {
    const el = document.querySelector('div[aria-label="Describe your reel..."], div[role="textbox"]');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, caption);
    }
  }, fullCaption);
  await page.waitForTimeout(1500);

  console.log(`Publishing Hindi Reel Part ${s.part}...`);
  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
  await postBtn.click({ force: true });
  console.log(`Post clicked! Monitoring upload...`);

  for (let p = 0; p < 35; p++) {
    await page.waitForTimeout(3000);
    const isStillInModal = page.url().includes('create') && await page.locator('div[aria-label="Describe your reel..."]').isVisible().catch(() => false);
    if (!isStillInModal) {
      console.log(`>>> SUCCESS: Hindi Reel Part ${s.part} published!`);
      break;
    }
  }

  await page.waitForTimeout(4000);
  const shotPath = `tools/fb_hi_reel_part${s.part}_posted.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_hi_reel_part${s.part}_posted.png`));
  }
}

async function postMasterVideo(page) {
  console.log('\n============================================================');
  console.log('>>> POSTING HINDI MASTER VIDEO TO SIMPLE HISTORY TELLER HINDI PAGE');
  console.log('============================================================');

  await page.goto('https://www.facebook.com/profile.php?id=61595333157867', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const photoVideoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"]').first();
  if (await photoVideoBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await photoVideoBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  const videoFile = path.join(RENDERS_DIR, 'video_hi.mp4');
  console.log('Attaching video:', videoFile);
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  if (nodeIds && nodeIds.length > 0) {
    await session.send('DOM.setFileInputFiles', {
      files: [videoFile],
      nodeId: nodeIds[nodeIds.length - 1]
    });
    console.log('Video attached! Waiting 10s...');
    await page.waitForTimeout(10000);
  }

  const postText = `इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास | Simple History Teller\n\nहज़ारों सालों तक इंसान बिना किसी राजा, बिना किसी अदालत और बिना किसी हुकूमत के बराबरी से रहता था। तो फिर दुनिया का पहला राजा कैसे बना?\n\nकालाहारी रेगिस्तान की अनोखी परंपराओं से लेकर मेसोपोटामिया के पहले टैक्स और सुमेरियन राजाओं के इतिहास की पूरी दास्तान।\n\n👑 पूरी डॉक्यूमेंट्री यूट्यूब पर देखिए: https://youtu.be/hjnYUIqdRAE\n\n#SimpleHistoryTellerHindi #इतिहास #पहलाराजा #सुमेरियन #मेसोपोटामिया #HindiHistory #OverSimplified #HistoryDocumentary #AnimatedHistory`;

  await page.evaluate((caption) => {
    const el = document.querySelector('div[role="textbox"][contenteditable="true"], div[aria-label*="What\'s on your mind"]');
    if (el) {
      el.focus();
      document.execCommand('insertText', false, caption);
    }
  }, postText);
  await page.waitForTimeout(3000);

  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] button:has-text("Post"), div[role="button"]:has-text("Post")').last();
  await postBtn.click({ force: true });
  console.log('Post clicked! Monitoring upload completion...');

  for (let m = 0; m < 35; m++) {
    await page.waitForTimeout(10000);
    const modalVisible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
    console.log(`[${(m+1)*10}s] Upload progress... modalOpen=${modalVisible}`);
    if (!modalVisible) {
      console.log('>>> SUCCESS: Hindi Master Video published to Facebook!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  const shotPath = 'tools/fb_hi_master_posted.png';
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_hi_master_posted.png`));
  }
}

(async () => {
  console.log('=== PUBLISHING HINDI CONTENT TO FACEBOOK ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Switch context to Simple History Teller Hindi
  await switchContextToPage(page, 'https://www.facebook.com/profile.php?id=61595333157867', 'Simple History Teller Hindi');

  // 2. Upload 4 Reels
  for (const r of hiReels) {
    await uploadReel(page, r);
  }

  // 3. Post Master Video
  await postMasterVideo(page);

  console.log('\n=== ALL HINDI FACEBOOK CONTENT PUBLISHED! ===');
  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in Hindi Facebook publishing:', err);
  process.exit(1);
});
