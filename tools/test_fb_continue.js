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
  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const fbBtn = page.locator('button:has-text("Continue with Facebook"), div[role="button"]:has-text("Continue with Facebook")').first();
  if (await fbBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue with Facebook"...');
    await fbBtn.click();
    console.log('Waiting 10s for auth redirect...');
    await page.waitForTimeout(10000);
  } else {
    console.log('FB btn not visible');
  }

  await page.screenshot({ path: 'tools/ig_after_fb_modal_click.png' });
  console.log('URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('Snippet:\n', text.replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
