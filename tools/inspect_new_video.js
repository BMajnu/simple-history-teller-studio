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

  console.log('Inspecting new_video on u/0...');
  await page.goto('https://aistudio.google.com/u/0/prompts/new_video?model=veo-3.1-fast-generate-preview', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');

  const textareas = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"]')).map(el => ({
      tag: el.tagName,
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      role: el.getAttribute('role')
    }));
  });
  console.log('Input fields:', JSON.stringify(textareas, null, 2));

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean);
  });
  console.log('Buttons:', buttons.slice(0, 30));

  await ctx.close();
  process.exit(0);
})().catch(console.error);
