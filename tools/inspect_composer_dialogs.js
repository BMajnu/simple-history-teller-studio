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

  await page.goto('https://www.facebook.com/groups/1803711656387813/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Click composer
  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post...")').first();
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  const dialogs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="dialog"]')).map(d => ({
      ariaLabel: d.getAttribute('aria-label'),
      innerText: d.innerText.substring(0, 150),
      hasTextbox: !!d.querySelector('div[role="textbox"]'),
      postBtns: Array.from(d.querySelectorAll('[role="button"], button')).filter(b => b.innerText.includes('Post')).map(b => ({
        text: b.innerText,
        role: b.getAttribute('role'),
        ariaLabel: b.getAttribute('aria-label')
      }))
    }));
  });

  console.log('All dialogs on page:', JSON.stringify(dialogs, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
