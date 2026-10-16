const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SHORT_PATH = path.resolve('projects/sample_first_king/renders/shorts_full/short_bn_full1.mp4');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Attaching short...');
  await session.send('DOM.setFileInputFiles', {
    files: [SHORT_PATH],
    nodeId: nodeIds[0]
  });

  console.log('Waiting for Next button...');
  const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn.waitFor({ state: 'visible', timeout: 20000 });
  console.log('Clicking Next (1)...');
  await nextBtn.click();
  await page.waitForTimeout(2000);

  // Look for second Next or Publish
  console.log('Looking for second Next...');
  const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    console.log('Clicking Next (2)...');
    await nextBtn2.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_reel_final_step.png' });
  console.log('Saved tools/fb_reel_final_step.png');

  // Check inputs and buttons on this final step
  const info = await page.evaluate(() => {
    return {
      textareas: Array.from(document.querySelectorAll('textarea, div[role="textbox"]')).map(el => ({
        tag: el.tagName,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label')
      })),
      buttons: Array.from(document.querySelectorAll('div[role="button"], button')).map(el => el.innerText.trim()).filter(Boolean)
    };
  });
  console.log('Final step info:', JSON.stringify(info, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
