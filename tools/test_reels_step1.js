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

  console.log('Attaching short 1 to node:', nodeIds[0]);
  await session.send('DOM.setFileInputFiles', {
    files: [SHORT_PATH],
    nodeId: nodeIds[0]
  });

  console.log('Attached! Waiting 8 seconds...');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'tools/fb_reel_step2_state.png' });
  console.log('Saved tools/fb_reel_step2_state.png');

  // Check buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], button')).map(el => ({
      text: el.innerText ? el.innerText.trim() : '',
      ariaLabel: el.getAttribute('aria-label')
    })).filter(b => b.text || b.ariaLabel);
  });
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
