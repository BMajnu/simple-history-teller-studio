const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Connecting to Flow Google on persistent profile...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to https://flow.google.com/...');
  await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  const title = await page.title();
  const url = page.url();
  console.log(`Flow Title: ${title} | URL: ${url}`);

  await page.screenshot({ path: path.join(__dirname, 'flow_google_probe.png') });
  console.log('Saved flow_google_probe.png');

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean);
  });
  console.log('Buttons/Links in Flow:', buttons.slice(0, 30));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Flow probe error:', err);
  process.exit(1);
});
