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
  console.log('Navigating to studio...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/debug_page_state.png' });
  console.log('Saved tools/debug_page_state.png');

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button, ytcp-icon-button')).map(b => ({
      id: b.id,
      text: b.innerText.trim(),
      aria: b.getAttribute('aria-label')
    })).filter(b => b.text || b.aria || b.id).slice(0, 30);
  });
  console.log('Found buttons:', buttons);

  await ctx.close();
})();
