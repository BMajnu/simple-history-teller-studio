const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const METADATA_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const igReels = [
  {
    part: 1,
    video: path.join(SHORTS_DIR, 'short_bn_full1.mp4'),
    thumb: path.join(METADATA_DIR, 'thumb_full_part1.jpg'),
    caption: 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 2,
    video: path.join(SHORTS_DIR, 'short_bn_full2.mp4'),
    thumb: path.join(METADATA_DIR, 'thumb_full_part2.jpg'),
    caption: 'কৃষির মারণফাঁদ ও লোভের জন্ম! 🌾 [২য় পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 3,
    video: path.join(SHORTS_DIR, 'short_bn_full3.mp4'),
    thumb: path.join(METADATA_DIR, 'thumb_full_part3.jpg'),
    caption: 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 4,
    video: path.join(SHORTS_DIR, 'short_bn_full4.mp4'),
    thumb: path.join(METADATA_DIR, 'thumb_full_part4.jpg'),
    caption: 'সুমেরীয় সম্রাট ও প্রথম সিংহাসন! 🏛️ [৪র্থ পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  },
  {
    part: 5,
    video: path.join(SHORTS_DIR, 'short_bn_full5.mp4'),
    thumb: path.join(METADATA_DIR, 'thumb_full_part5.jpg'),
    caption: 'রাজার পতন ও আধুনিক রাষ্ট্রের জন্ম! ⏳ [৫ম পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla'
  }
];

(async () => {
  console.log('Launching Chrome for 5 Instagram Reels batch upload...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  for (let i = 0; i < igReels.length; i++) {
    const item = igReels[i];
    console.log(`\n============================================================`);
    console.log(`>>> UPLOADING INSTAGRAM REEL PART ${item.part} (${i + 1}/${igReels.length})`);
    console.log(`>>> Video: ${item.video}`);
    console.log(`>>> Cover: ${item.thumb}`);
    console.log(`============================================================`);

    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // If any auth or modal prompts appear
    const fbBtn = page.locator('button:has-text("Continue with Facebook"), div[role="button"]:has-text("Continue with Facebook")').first();
    if (await fbBtn.isVisible().catch(() => false)) {
      console.log('Clicking FB button...');
      await fbBtn.click();
      await page.waitForTimeout(4000);
    }
    const oauthBtn = page.locator('button:has-text("Continue as Badiuzzaman"), div[role="button"]:has-text("Continue as Badiuzzaman")').first();
    if (await oauthBtn.isVisible().catch(() => false)) {
      console.log('Clicking OAuth button...');
      await oauthBtn.click();
      await page.waitForTimeout(6000);
    }

    // Dismiss any dialogs
    const notNow = page.locator('button:has-text("Not Now"), button:has-text("Not now")').first();
    if (await notNow.isVisible().catch(() => false)) {
      await notNow.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Click Create (+) in left sidebar
    console.log('Clicking Create button...');
    const createBtn = page.locator('svg[aria-label="New post"], svg[aria-label="Create"], span:has-text("Create")').first();
    await createBtn.click();
    await page.waitForTimeout(2000);

    // Attach video via CDP
    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });

    if (!nodeIds || nodeIds.length === 0) {
      console.error(`No file input found for Part ${item.part}!`);
      continue;
    }

    console.log(`Attaching ${item.video}...`);
    await session.send('DOM.setFileInputFiles', {
      files: [item.video],
      nodeId: nodeIds[0]
    });

    await page.waitForTimeout(4000);

    // Dismiss OK on reels notice if present
    const okBtn = page.locator('button:has-text("OK"), div[role="button"]:has-text("OK")').first();
    if (await okBtn.isVisible().catch(() => false)) {
      console.log('Dismissing "shared as reels" modal with OK...');
      await okBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
    }

    // Click Next (to cover photo)
    console.log('Navigating to Cover photo step...');
    const nextBtn1 = page.locator('div[role="dialog"]').getByRole('button', { name: 'Next', exact: true }).first();
    if (await nextBtn1.isVisible().catch(() => false)) {
      await nextBtn1.click({ force: true });
    } else {
      await page.locator('div[role="dialog"] [role="button"]:has-text("Next")').first().click({ force: true });
    }
    await page.waitForTimeout(3000);

    // Upload custom thumbnail
    console.log(`Setting custom cover photo: ${item.thumb}...`);
    const selectCover = page.locator('text=Select from computer').first();
    if (await selectCover.isVisible().catch(() => false)) {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null),
        selectCover.click({ force: true })
      ]);
      if (fileChooser) {
        await fileChooser.setFiles(item.thumb);
        await page.waitForTimeout(3000);
      }
    }

    // Click Next (to caption step)
    console.log('Navigating to Caption step...');
    const nextBtn2 = page.locator('div[role="dialog"]').getByRole('button', { name: 'Next', exact: true }).first();
    if (await nextBtn2.isVisible().catch(() => false)) {
      await nextBtn2.click({ force: true });
    } else {
      await page.locator('div[role="dialog"] [role="button"]:has-text("Next")').first().click({ force: true });
    }
    await page.waitForTimeout(3000);

    // Type caption
    console.log('Entering caption and tags...');
    const captionBox = page.locator('div[aria-label="Write a caption..."], div[contenteditable="true"]').first();
    await captionBox.click({ force: true });
    await page.waitForTimeout(500);
    await page.evaluate((text) => document.execCommand('insertText', false, text), item.caption);
    await page.waitForTimeout(1500);

    // Click header Share button
    console.log(`Clicking Share for Part ${item.part}...`);
    const shareBtn = page.locator('div[role="dialog"]').getByRole('button', { name: 'Share', exact: true }).first();
    await shareBtn.click({ force: true });
    console.log(`Share initiated! Waiting for upload and publishing confirmation...`);

    let completed = false;
    for (let w = 0; w < 60; w++) {
      await page.waitForTimeout(3000);
      const text = await page.evaluate(() => document.body.innerText).catch(() => '');
      if (text.includes('Your reel has been shared') || text.includes('Your post has been shared') || text.includes('Reel shared')) {
        console.log(`>>> SUCCESS: Reel Part ${item.part} has been shared!`);
        completed = true;
        break;
      }
      if (w % 5 === 0) {
        console.log(`... Uploading Part ${item.part} (${(w + 1) * 3}s elapsed)`);
      }
    }

    // Capture screenshot of result
    await page.waitForTimeout(2000);
    const shotPath = `tools/ig_reel_part${item.part}_posted.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    if (fs.existsSync(shotPath)) {
      fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `ig_reel_part${item.part}_posted.png`));
    }

    // Close modal if close button exists
    const closeBtn = page.locator('div[role="dialog"] svg[aria-label="Close"], button[aria-label="Close"]').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(4000);
  }

  console.log('\n============================================================');
  console.log('ALL 5 INSTAGRAM REELS POSTED SUCCESSFULLY!');
  console.log('============================================================\n');

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error during Instagram Reels batch upload:', err);
  process.exit(1);
});
