const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts');
const RENDERS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const enReels = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_en_part1.mp4'),
    title: 'How Humans Invented the First King! 👑 [Part 1] #Shorts #History',
    desc: 'For 300,000 years, humans lived with NO kings and fiercely mocked arrogant leaders!\n\n👑 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_en_part2.mp4'),
    title: 'The Agricultural Trap & First Warlords! 🌾 [Part 2] #Shorts #History',
    desc: 'Farming began, granaries filled, and humanity fell into the ultimate trap of security and taxes!\n\n🌾 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_en_part3.mp4'),
    title: 'The First Extortion & World\'s First Don! ⚔️ [Part 3] #Shorts #History',
    desc: 'Pay 20% of your crop, or else! The shocking true origin of taxes and warlords.\n\n⚔️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_en_part4.mp4'),
    title: 'Sumerian Kings & The Rise of the Throne! 🏛️ [Part 4] #Shorts #History',
    desc: 'Kingship descended from the heavens! The Sumerian King List and Sargon of Akkad.\n\n🏛️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
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
  console.log(`\n--- Uploading English Reel Part ${s.part}: ${s.title} ---`);
  await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Wait for file input
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 20000 });

  // Use CDP to attach file
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log(`Attaching ${s.file} to file input node ${nodeIds[0]}...`);
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

  console.log(`Publishing Reel Part ${s.part}...`);
  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
  await postBtn.click({ force: true });
  console.log(`Post clicked! Monitoring upload...`);

  for (let p = 0; p < 35; p++) {
    await page.waitForTimeout(3000);
    const isStillInModal = page.url().includes('create') && await page.locator('div[aria-label="Describe your reel..."]').isVisible().catch(() => false);
    if (!isStillInModal) {
      console.log(`>>> SUCCESS: English Reel Part ${s.part} published!`);
      break;
    }
  }

  await page.waitForTimeout(4000);
  const shotPath = `tools/fb_en_reel_part${s.part}_posted.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_en_reel_part${s.part}_posted.png`));
  }
}

async function postMasterVideo(page) {
  console.log('\n============================================================');
  console.log('>>> POSTING ENGLISH MASTER VIDEO POST TO HISTORY TELLER PAGE');
  console.log('============================================================');

  await page.goto('https://www.facebook.com/profile.php?id=61595202872996', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Click Photo/video button or composer
  const photoVideoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"]').first();
  if (await photoVideoBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await photoVideoBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // Attach master video
  const videoFile = path.join(RENDERS_DIR, 'video_en.mp4');
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
    console.log('Video attached! Waiting 10s for upload to initiate...');
    await page.waitForTimeout(10000);
  }

  const postText = `How Humans Invented the First King (The True Origin of Thrones) | Simple History Teller\n\nFor 300,000 years of human history, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?\n\nExplore the incredible story of the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad.\n\n👑 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified`;

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
      console.log('>>> SUCCESS: English Master Video published to Facebook!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  const shotPath = 'tools/fb_en_master_posted.png';
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, 'fb_en_master_posted.png'));
  }
}

(async () => {
  console.log('=== PUBLISHING ENGLISH CONTENT TO FACEBOOK ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Switch context to History Teller
  await switchContextToPage(page, 'https://www.facebook.com/profile.php?id=61595202872996', 'History Teller');

  // 2. Upload 4 Reels
  for (const r of enReels) {
    await uploadReel(page, r);
  }

  // 3. Post Master Video
  await postMasterVideo(page);

  console.log('\n=== ALL ENGLISH FACEBOOK CONTENT PUBLISHED! ===');
  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in English Facebook publishing:', err);
  process.exit(1);
});
