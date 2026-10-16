const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full', 'short_bn_full1.mp4');

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

  // Click OK on the reels notice
  console.log('Dismissing OK...');
  const okBtn = page.locator('button:has-text("OK"), div[role="button"]:has-text("OK")').first();
  if (await okBtn.isVisible().catch(() => false)) {
    await okBtn.click({ force: true });
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: 'tools/ig_after_ok.png' });

  // Click Next in modal header
  console.log('Clicking Next...');
  const nextBtn = page.locator('div[role="dialog"] button:has-text("Next"), div[role="dialog"] div[role="button"]:has-text("Next"), div:has-text("Next")').last();
  await nextBtn.click({ force: true });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/ig_cover_trim_screen.png' });
  console.log('Saved tools/ig_cover_trim_screen.png');

  // Let's print dialog buttons/options
  const dialogText = await page.evaluate(() => {
    const d = document.querySelector('div[role="dialog"]');
    return d ? d.innerText : 'No dialog';
  });
  console.log('Dialog innerText:\n', dialogText);

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
