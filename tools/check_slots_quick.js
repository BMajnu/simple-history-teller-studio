const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled']
  });

  for (let s = 0; s <= 5; s++) {
    const page = await ctx.newPage();
    try {
      await page.goto(`https://aistudio.google.com/u/${s}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2500);
      const title = await page.title();
      const text = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label*="@"], button[title*="@"], [aria-label*="Google Account"]');
        return btn ? (btn.getAttribute('aria-label') || btn.innerText).trim() : 'no account button';
      });
      console.log(`Slot /u/${s}/: [${title}] ${text}`);
    } catch(e) {
      console.log(`Slot /u/${s}/ error:`, e.message);
    } finally {
      await page.close();
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
