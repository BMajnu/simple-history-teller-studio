const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full', 'short_bn_full1.mp4');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full', 'thumb_full_part1.jpg');
const CAPTION = 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব]\n\n#shorts #reels #bangla #ইতিহাস #প্রথমরাজা #simplehistorytellerbangla';

(async () => {
  console.log('Launching Chrome for Instagram Reel Part 1 test...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // If on login prompt or modal
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
    await page.waitForTimeout(8000);
  }

  // Dismiss "Not Now" dialogs
  for (let i = 0; i < 3; i++) {
    const notNow = page.locator('button:has-text("Not Now"), button:has-text("Not now")').first();
    if (await notNow.isVisible().catch(() => false)) {
      console.log('Dismissing Not Now popup...');
      await notNow.click();
      await page.waitForTimeout(1000);
    }
  }

  console.log('Looking for Create (+) button...');
  // Find Create button in left sidebar
  const createBtn = page.locator('svg[aria-label="New post"], svg[aria-label="Create"], span:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tools/ig_modal_step1.png' });
  console.log('Saved tools/ig_modal_step1.png');

  // Look for file input
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Found file inputs:', nodeIds ? nodeIds.length : 0);
  if (!nodeIds || nodeIds.length === 0) {
    console.error('No file input found!');
    await ctx.close();
    process.exit(1);
  }

  console.log('Attaching video file:', VIDEO_PATH);
  await session.send('DOM.setFileInputFiles', {
    files: [VIDEO_PATH],
    nodeId: nodeIds[0]
  });

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/ig_modal_step2_video_attached.png' });
  console.log('Saved tools/ig_modal_step2_video_attached.png');

  // Check for "OK" on "Video posts are now shared as reels" modal
  const okBtn = page.locator('button:has-text("OK"), div[role="button"]:has-text("OK")').first();
  if (await okBtn.isVisible().catch(() => false)) {
    console.log('Dismissing "shared as reels" modal with OK...');
    await okBtn.click();
    await page.waitForTimeout(1500);
  }

  // Check aspect ratio crop icon to ensure Original 9:16 is preserved
  const cropBtn = page.locator('svg[aria-label="Select crop"]').first();
  if (await cropBtn.isVisible().catch(() => false)) {
    console.log('Clicking crop icon...');
    await cropBtn.click();
    await page.waitForTimeout(1000);
    // Click "Original"
    const origBtn = page.locator('button:has-text("Original"), div[role="button"]:has-text("Original"), span:has-text("Original")').first();
    if (await origBtn.isVisible().catch(() => false)) {
      console.log('Selecting Original aspect ratio...');
      await origBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'tools/ig_modal_step3_cropped.png' });

  // Click Next
  console.log('Clicking Next (to cover/trim screen)...');
  const nextBtn1 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn1.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/ig_modal_step4_cover.png' });
  console.log('Saved tools/ig_modal_step4_cover.png');

  // In Cover screen, check if there is "Select from computer" for thumbnail
  const selectCover = page.locator('button:has-text("Select from computer"), div[role="button"]:has-text("Select from computer")').first();
  if (await selectCover.isVisible().catch(() => false)) {
    console.log('Found Select from computer for cover!');
    // Look for second file input or handle file chooser
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
      selectCover.click()
    ]);
    if (fileChooser) {
      console.log('Setting custom thumbnail:', THUMB_PATH);
      await fileChooser.setFiles(THUMB_PATH);
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/ig_modal_step5_cover_selected.png' });

  // Click Next again (to caption screen)
  console.log('Clicking Next (to caption screen)...');
  const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn2.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/ig_modal_step6_caption.png' });
  console.log('Saved tools/ig_modal_step6_caption.png');

  // Write caption
  console.log('Typing caption...');
  const captionBox = page.locator('div[aria-label="Write a caption..."], div[contenteditable="true"]').first();
  await captionBox.click();
  await page.waitForTimeout(500);
  await page.keyboard.type(CAPTION, { delay: 15 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'tools/ig_modal_step7_ready_to_share.png' });
  console.log('Saved tools/ig_modal_step7_ready_to_share.png');

  // Click Share
  console.log('Clicking Share button...');
  const shareBtn = page.locator('div[role="button"]:has-text("Share"), button:has-text("Share")').first();
  await shareBtn.click();
  console.log('Share clicked! Waiting for reel to finish sharing (up to 45s)...');

  for (let w = 0; w < 30; w++) {
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    if (bodyText.includes('Your reel has been shared') || bodyText.includes('Your post has been shared')) {
      console.log('REEL HAS BEEN SHARED SUCCESSFULLY!');
      break;
    }
  }

  await page.screenshot({ path: 'tools/ig_part1_posted.png' });
  console.log('Saved tools/ig_part1_posted.png');

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync('tools/ig_part1_posted.png', path.join(artifactDir, 'ig_part1_posted.png'));

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error during IG upload:', err);
  process.exit(1);
});
