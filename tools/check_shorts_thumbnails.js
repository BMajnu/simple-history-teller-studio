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
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const rows = await page.locator('ytcp-video-row').all();
  console.log('Total video rows found:', rows.length);

  for (let i = 0; i < rows.length; i++) {
    const text = await rows[i].innerText();
    const titleMatch = text.split('\n')[0];
    console.log(`Row ${i}: ${titleMatch}`);
  }

  // Find Part 4
  const part4Row = page.locator('ytcp-video-row').filter({ hasText: '৪র্থ পর্ব' }).first();
  if (await part4Row.isVisible()) {
    console.log('Part 4 row is visible. Hovering and clicking Details...');
    await part4Row.hover();
    const editBtn = part4Row.locator('ytcp-icon-button#edit-button, button[aria-label*="Details"], #details-btn').first();
    await editBtn.click({ force: true });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tools/part4_details_page.png' });
    console.log('Part 4 edit URL:', page.url());
  }

  await ctx.close();
})();
