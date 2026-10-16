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

  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post...")').first();
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  const testText = 'Hello World Test Link: https://youtu.be/ibG0M13m7I0';
  await page.evaluate((text) => {
    const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
    if (el) {
      el.focus();
      document.execCommand('insertText', false, text);
    }
  }, testText);
  await page.waitForTimeout(3000);

  // Dump all buttons / clickable elements in dialog
  const elements = await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return { hasDialog: false };
    const all = Array.from(dialog.querySelectorAll('[role="button"], button')).map(b => ({
      tag: b.tagName,
      role: b.getAttribute('role'),
      ariaLabel: b.getAttribute('aria-label'),
      text: b.innerText.trim(),
      className: b.className.substring(0, 50),
      disabled: b.getAttribute('aria-disabled')
    }));
    return { hasDialog: true, buttons: all };
  });

  console.log('Dialog Elements:', JSON.stringify(elements, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
