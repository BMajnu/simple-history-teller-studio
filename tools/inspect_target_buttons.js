const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Take screenshot
  await page.screenshot({ path: 'tools/fb_page_live_now.png' });
  console.log('Saved tools/fb_page_live_now.png');

  // Find all buttons on page
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], button, span[dir="auto"]')).filter(el => {
      const text = el.innerText ? el.innerText.trim() : '';
      return ['Photo/video', 'Create reel', 'Reel', "What's on your mind?", 'Post'].includes(text);
    }).map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      rect: el.getBoundingClientRect()
    }));
  });

  console.log('Target buttons found:', JSON.stringify(buttons, null, 2));
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
