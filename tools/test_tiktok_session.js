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
  console.log('Navigating to TikTok upload page...');
  await page.goto('https://www.tiktok.com/creator-center/upload', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('TikTok current URL:', page.url());
  console.log('TikTok page title:', await page.title());

  await page.screenshot({ path: 'tools/tiktok_upload_state.png' });
  console.log('Saved tools/tiktok_upload_state.png');

  // Check if logged in or needs login
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  console.log('Is logged in / has upload UI:', bodyText.includes('Select video') || bodyText.includes('Upload video') || bodyText.includes('Post'));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
