const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');

const tiktokShorts = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_bn_full1.mp4'),
    caption: 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #shorts #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_bn_full2.mp4'),
    caption: 'কৃষির মারণফাঁদ ও লোভের জন্ম! 🌾 [২য় পর্ব] #shorts #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'),
    caption: 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #shorts #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_bn_full4.mp4'),
    caption: 'সুমেরীয় সম্রাট ও প্রথম সিংহাসন! 🏛️ [৪র্থ পর্ব] #shorts #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 5,
    file: path.join(SHORTS_DIR, 'short_bn_full5.mp4'),
    caption: 'রাজার পতন ও আধুনিক রাষ্ট্রের জন্ম! ⏳ [৫ম পর্ব] #shorts #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  }
];

(async () => {
  console.log('Launching Chrome for TikTok upload batch...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  for (let i = 0; i < tiktokShorts.length; i++) {
    const s = tiktokShorts[i];
    console.log(`\n========================================`);
    console.log(`>>> UPLOADING TIKTOK PART ${s.part} (${i + 1}/${tiktokShorts.length}): ${s.caption}`);
    console.log(`========================================`);

    await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });

    if (!nodeIds || nodeIds.length === 0) {
      console.error(`No file input found on TikTok upload page for Part ${s.part}!`);
      continue;
    }

    console.log(`Attaching ${s.file} to TikTok file input...`);
    await session.send('DOM.setFileInputFiles', {
      files: [s.file],
      nodeId: nodeIds[0]
    });

    console.log('Waiting for video processing & modal check...');
    await page.waitForTimeout(6000);

    // Dismiss "Got it" modal if visible
    const gotItBtn = page.locator('button:has-text("Got it"), div[role="dialog"] button').first();
    if (await gotItBtn.isVisible().catch(() => false)) {
      console.log('Dismissing preview modal with "Got it"...');
      await gotItBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Fill caption in DraftEditor
    console.log('Filling caption in description editor...');
    const editor = page.locator('div.public-DraftEditor-content').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    await editor.click();
    await page.waitForTimeout(500);

    // Clear default filename text
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);

    // Insert caption
    await page.evaluate((text) => document.execCommand('insertText', false, text), s.caption);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');

    // Wait until upload percentage completes (look for "Uploaded" or post button enabled)
    console.log('Waiting for upload to finish (up to 40s)...');
    for (let w = 0; w < 20; w++) {
      await page.waitForTimeout(2000);
      const text = await page.evaluate(() => document.body.innerText).catch(() => '');
      if (text.includes('Uploaded') || !text.includes('seconds left')) {
        console.log('Video upload completed!');
        break;
      }
    }

    // Scroll down to Post button
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    console.log(`Clicking Post button for TikTok Part ${s.part}...`);
    const postBtn = page.locator('button:has-text("Post")').first();
    await postBtn.click();
    console.log(`Clicked Post! Waiting for confirmation...`);

    // Wait for success screen
    await page.waitForTimeout(8000);

    const shotPath = `tools/tiktok_part${s.part}_posted.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
    fs.copyFileSync(shotPath, path.join(artifactDir, `tiktok_part${s.part}_posted.png`));
  }

  console.log('\n========================================');
  console.log('ALL 5 TIKTOK SHORTS POSTED SUCCESSFULLY!');
  console.log('========================================\n');

  await page.waitForTimeout(4000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal TikTok batch error:', err);
  process.exit(1);
});
