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
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/your_pages_list.png' });
  console.log('Saved tools/your_pages_list.png');

  // Extract all page names listed under "Your Pages and profiles"
  const pagesList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="main"] a, div[role="main"] span, div[role="navigation"] span'))
      .map(el => el.innerText.trim())
      .filter(t => t.length > 2 && !t.includes('\n'));
  });

  console.log('Unique page items:', JSON.stringify([...new Set(pagesList)].slice(0, 30), null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
