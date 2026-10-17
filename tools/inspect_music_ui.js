const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Inspecting AI Studio Music interface...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  const controls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, textarea, input, div[role="button"], [contenteditable="true"]')).map(el => ({
      tag: el.tagName,
      text: (el.innerText || '').slice(0, 50).replace(/\n/g, ' '),
      ariaLabel: el.getAttribute('aria-label'),
      placeholder: el.getAttribute('placeholder')
    })).filter(x => x.text || x.ariaLabel || x.placeholder);
  });

  console.log('Music UI controls (sample 30):', JSON.stringify(controls.slice(0, 30), null, 2));

  await ctx.close();
  process.exit(0);
})().catch(console.error);
