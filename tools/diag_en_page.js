const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--remote-debugging-port=9224'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();
  console.log('Navigating to English page: https://www.facebook.com/61595615845321 ...');
  await p.goto('https://www.facebook.com/61595615845321', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'diag_en_page_landing.png') });
  console.log('Saved diag_en_page_landing.png');

  // Print all buttons
  const btns = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], button, a[role="link"]')).map(b => ({
      tag: b.tagName,
      text: (b.innerText || '').trim().replace(/\n/g, ' '),
      aria: b.getAttribute('aria-label')
    })).filter(b => b.text || b.aria);
  });

  console.log('Buttons on page:', JSON.stringify(btns, null, 2));
  process.exit(0);
})();
