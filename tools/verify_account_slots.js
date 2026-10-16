const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const slots = [1, 2, 3, 4, 5];
  for (const s of slots) {
    const page = await ctx.newPage();
    try {
      await page.goto(`https://aistudio.google.com/u/${s}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      const email = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label*="@"], button[title*="@"]');
        return btn ? (btn.getAttribute('aria-label') || btn.innerText).slice(0, 50) : 'unknown';
      });
      console.log(`Slot /u/${s}/:`, email);
    } catch(e) {
      console.log(`Slot /u/${s}/ error:`, e.message);
    } finally {
      await page.close();
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
