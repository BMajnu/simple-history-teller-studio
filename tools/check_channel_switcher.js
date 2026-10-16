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
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/yt_channel_switcher.png' });
  console.log('Saved tools/yt_channel_switcher.png');

  const channels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytd-account-item-renderer, #channel-title, a[href*="/channel/"]')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('Channels listed:', channels);

  await ctx.close();
})();
