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

  // Click Create
  const createBtn = page.locator('svg[aria-label="New post"], svg[aria-label="Create"], span:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(2000);

  // File input
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Attaching video...');
  await session.send('DOM.setFileInputFiles', {
    files: [VIDEO_PATH],
    nodeId: nodeIds[0]
  });

  await page.waitForTimeout(3000);

  // Dismiss OK
  const okBtn = page.locator('button:has-text("OK"), div[role="button"]:has-text("OK")').first();
  if (await okBtn.isVisible().catch(() => false)) {
    await okBtn.click({ force: true });
    await page.waitForTimeout(1500);
  }

  // Click Next (to cover screen)
  console.log('Clicking Next to cover screen...');
  const nextBtn1 = page.locator('div[role="dialog"]').getByRole('button', { name: 'Next', exact: true }).first();
  if (await nextBtn1.isVisible().catch(() => false)) {
    await nextBtn1.click({ force: true });
  } else {
    await page.locator('div[role="dialog"] [role="button"]:has-text("Next")').first().click({ force: true });
  }
  await page.waitForTimeout(3000);

  // Upload custom cover
  console.log('Setting custom cover photo...');
  const selectCover = page.locator('text=Select from computer').first();
  if (await selectCover.isVisible().catch(() => false)) {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 8000 }),
      selectCover.click({ force: true })
    ]);
    if (fileChooser) {
      console.log('Attaching thumbnail:', THUMB_PATH);
      await fileChooser.setFiles(THUMB_PATH);
      await page.waitForTimeout(3000);
    }
  }

  // Click Next (to caption screen)
  console.log('Clicking Next to caption screen...');
  const nextBtn2 = page.locator('div[role="dialog"]').getByRole('button', { name: 'Next', exact: true }).first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    await nextBtn2.click({ force: true });
  } else {
    await page.locator('div[role="dialog"] [role="button"]:has-text("Next")').first().click({ force: true });
  }
  await page.waitForTimeout(3000);

  // Fill caption
  console.log('Filling caption...');
  const captionBox = page.locator('div[aria-label="Write a caption..."], div[contenteditable="true"]').first();
  await captionBox.click({ force: true });
  await page.waitForTimeout(500);
  await page.evaluate((text) => document.execCommand('insertText', false, text), CAPTION);
  await page.waitForTimeout(1500);

  // Find exact Share button in header
  console.log('Finding exact Share button...');
  const shareBtn = page.locator('div[role="dialog"]').getByRole('button', { name: 'Share', exact: true }).first();
  console.log('Share btn visible:', await shareBtn.isVisible().catch(() => false));
  await shareBtn.click({ force: true });
  console.log('Share clicked! Waiting for publishing confirmation...');

  let posted = false;
  for (let w = 0; w < 40; w++) {
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    if (bodyText.includes('Your reel has been shared') || bodyText.includes('Your post has been shared') || bodyText.includes('Reel shared')) {
      console.log('REEL HAS BEEN SHARED SUCCESSFULLY!');
      posted = true;
      break;
    }
    if (w % 5 === 0) console.log(`Still waiting for share completion (${w*2}s)...`);
  }

  await page.waitForTimeout(3000);
  const shotPath = 'tools/ig_reel_part1_posted.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync(shotPath, path.join(artifactDir, 'ig_reel_part1_posted.png'));

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
