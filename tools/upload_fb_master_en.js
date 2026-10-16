const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_en.mp4');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'en_thumbnail_optimized.jpg');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const PAGE_URL = 'https://www.facebook.com/profile.php?id=61595202872996';

const TITLE = 'How Humans Invented the First King (The True Origin of Thrones) | Simple History Teller';
const DESCRIPTION_LINES = [
  'For 300,000 years of human history, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?',
  '',
  'Explore the incredible story of the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad.',
  '',
  '🕒 Chapters:',
  '00:00 - The Egalitarian Paradox (The Hook)',
  '01:30 - Insulting the Meat (Kalahari Defense)',
  '04:30 - The Agricultural Trap & Grain Hoarding',
  '08:00 - The Warlord\'s Protection Racket (First Taxes)',
  '11:00 - The Sumerian King List & King Alulim',
  '13:30 - Sargon of Akkad & First Standing Army',
  '15:00 - The Modern State & Final Verdict',
  '',
  '🔔 Follow our Page and Subscribe on YouTube: https://youtu.be/lNNFHePozVs',
  '',
  '#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified #HistoryExplained #EducationalAnimation'
];

(async () => {
  console.log('=== UPLOADING MASTER ENGLISH VIDEO TO FACEBOOK PAGE (History Teller) ===');
  console.log('Video:', VIDEO_PATH, `(${Math.round(fs.statSync(VIDEO_PATH).size / (1024*1024))} MB)`);
  console.log('Thumbnail:', THUMB_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('1. Navigating to English Facebook Page (History Teller)...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Switch context to Page profile if Switch button appears
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Switching context to History Teller Page profile...');
    await switchBtn.click();
    await page.waitForTimeout(5000);
  }

  // Click Photo/video button
  console.log('2. Opening Photo/video composer...');
  const photoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"], span:has-text("Photo/video")').first();
  if (await photoBtn.isVisible().catch(() => false)) {
    await photoBtn.click();
    await page.waitForTimeout(3000);
  }

  // Attach master video file via CDP
  console.log('3. Attaching video file via CDP session...');
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  if (!nodeIds || nodeIds.length === 0) {
    throw new Error('No file input found on Facebook composer!');
  }

  let videoAttached = false;
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('video/*') || attrStr.includes('video/mp4')) {
      console.log('Setting video on nodeId:', id);
      await session.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: id });
      videoAttached = true;
      break;
    }
  }

  if (!videoAttached) {
    console.log('Fallback: Setting video on last file input...');
    await session.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: nodeIds[nodeIds.length - 1] });
  }

  console.log('Video attached! Waiting 12 seconds for video card to load...');
  await page.waitForTimeout(12000);

  // Dismiss any overlay dialog if present
  const closeBtn = page.locator('div[aria-label="Create post"] div[aria-label="Close"], div[aria-label="Close"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Dismissing overlay dialog...');
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Choose custom thumbnail if available
  console.log('4. Checking custom thumbnail button...');
  const thumbButton = page.locator('span:has-text("Choose a thumbnail"), div:has-text("Choose a thumbnail"), div[role="button"]:has-text("Video options")').last();
  if (await thumbButton.isVisible().catch(() => false)) {
    await thumbButton.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);

    const { nodeIds: currentInputs } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });
    for (const id of currentInputs) {
      const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
      const attrStr = attributes.join(' ');
      if (attrStr.includes('.png') || attrStr.includes('.jpg') || attrStr.includes('image/')) {
        console.log('Setting custom thumbnail on nodeId:', id);
        await session.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: id });
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  // Fill Description in textbox
  console.log('5. Filling post description...');
  const descBox = page.locator('div[role="textbox"][contenteditable="true"]').first();
  if (await descBox.isVisible().catch(() => false)) {
    await descBox.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    await page.evaluate((text) => document.execCommand('insertText', false, text), TITLE);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    for (const line of DESCRIPTION_LINES) {
      if (line === '') {
        await page.keyboard.press('Enter');
      } else {
        await page.evaluate((text) => document.execCommand('insertText', false, text), line);
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(20);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_en_master_pre_post.png' });

  // Click Next if visible, then Post
  console.log('6. Checking Next or Post button...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Clicking Next button...');
    await nextBtn.click();
    await page.waitForTimeout(3000);
  }

  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').first();
  if (await postBtn.isVisible().catch(() => false)) {
    console.log('Clicking POST button!');
    await postBtn.click();
    console.log('Post clicked! Monitoring upload...');
  }

  // Monitor upload
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isUploading = text.includes('Uploading') || text.includes('Processing') || text.includes('Posting');
    if (i % 4 === 0) console.log(`Upload check ${i + 1}/40: isUploading=${isUploading}`);
    if (!isUploading && i > 3) {
      console.log('Upload completed or processed!');
      break;
    }
  }

  await page.waitForTimeout(6000);
  const shotPath = 'tools/fb_en_master_post_success.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, 'fb_en_master_post_success.png'));
  }

  console.log('\n==================================================');
  console.log('ENGLISH MASTER VIDEO PUBLISHED TO FACEBOOK!');
  console.log('==================================================\n');

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error during Facebook English upload:', err);
  process.exit(1);
});
