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
  await page.bringToFront();

  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const switchBtn = page.locator('button:has-text("Switch account"), a:has-text("Switch account")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking Switch account...');
    await switchBtn.click();
    await page.waitForTimeout(4000);
  }

  await page.screenshot({ path: 'tools/yt_switch_account_screen.png' });
  console.log('URL:', page.url());

  const accounts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => el.innerText && el.innerText.trim()).filter(t => t && t.includes('@gmail.com'));
  });
  console.log('Detected accounts:', Array.from(new Set(accounts)));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
