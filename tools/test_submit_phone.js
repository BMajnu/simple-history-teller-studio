const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PHONE = '01833933521';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to English channel verify URL
  console.log('Navigating to verify URL...');
  await page.goto('https://www.youtube.com/verify_phone_number?f=Q0hBTk5FTF9GRUFUVVJFU19GRUFUVVJFX0NVU1RPTV9USFVNQk5BSUxT', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Type phone number
  const phoneInput = page.locator('input:not([readonly])[type="tel"], input:not([readonly])[type="text"]').first();
  await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
  await phoneInput.click();
  await phoneInput.fill(PHONE);
  await page.waitForTimeout(1000);

  // Click NEXT
  const nextBtn = page.locator('button:has-text("NEXT"), button:has-text("Next"), tp-yt-paper-button:has-text("NEXT")').first();
  console.log('Clicking NEXT...');
  await nextBtn.click({ force: true });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/yt_verify_after_submit_phone.png' });
  console.log('Saved tools/yt_verify_after_submit_phone.png');

  const pageText = await page.innerText('body');
  console.log('Page response text:', pageText.substring(0, 400));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
