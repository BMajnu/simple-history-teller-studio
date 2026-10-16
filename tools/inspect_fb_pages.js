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

  // Check English page
  console.log('Checking English Facebook Page (History Teller)...');
  await page.goto('https://www.facebook.com/profile.php?id=61595202872996', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_en_page_status.png' });

  const enText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('EN Page text snippet:', enText.substring(0, 400).replace(/\n+/g, ' '));

  // Check Hindi page
  console.log('Checking Hindi Facebook Page (Simple History Teller Hindi)...');
  await page.goto('https://www.facebook.com/profile.php?id=61595333157867', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_hi_page_status.png' });

  const hiText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('HI Page text snippet:', hiText.substring(0, 400).replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
