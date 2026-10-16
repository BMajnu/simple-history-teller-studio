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

  await page.goto('https://www.youtube.com/verify_phone_number?f=Q0hBTk5FTF9GRUFUVVJFU19GRUFUVVJFX0NVU1RPTV9USFVNQk5BSUxT', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  console.log('Frames count:', page.frames().length);
  for (let i = 0; i < page.frames().length; i++) {
    const frame = page.frames()[i];
    console.log(`Frame ${i} URL:`, frame.url());
    const count = await frame.locator('input').count();
    console.log(`Frame ${i} input count:`, count);
    if (count > 0) {
      for (let j = 0; j < count; j++) {
        const info = await frame.locator('input').nth(j).evaluate(el => ({
          id: el.id,
          placeholder: el.placeholder,
          outerHTML: el.outerHTML.substring(0, 150)
        }));
        console.log(`  Frame ${i} Input ${j}:`, info);
      }
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
