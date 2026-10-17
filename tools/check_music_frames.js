const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const frames = page.frames();
  console.log('Total frames:', frames.length);
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    console.log(`Frame ${i}: ${f.url()}`);
    const btns = await f.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').slice(0, 40))).catch(() => []);
    console.log(`  Buttons in frame ${i}:`, btns.filter(Boolean).slice(0, 15));
    const inputs = await f.evaluate(() => Array.from(document.querySelectorAll('textarea, input, [contenteditable]')).map(el => el.tagName)).catch(() => []);
    console.log(`  Inputs in frame ${i}:`, inputs);
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
