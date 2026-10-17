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
  console.log('Navigating to Bangla page...');
  await p.goto('https://www.facebook.com/61595477341365', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Click Photo/video button to open composer
  console.log('Clicking Photo/video button in composer...');
  const pvBtn = p.locator('div[role="button"]:has-text("Photo/video")').first();
  if (await pvBtn.isVisible().catch(() => false)) {
    await pvBtn.click();
    await p.waitForTimeout(3000);
  } else {
    const mindBox = p.locator('div[role="button"]:has-text("What\'s on your mind?")').first();
    await mindBox.click();
    await p.waitForTimeout(3000);
  }

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'fb_composer_modal_inspection.png') });
  console.log('Saved fb_composer_modal_inspection.png');

  // Print all buttons / inputs inside dialog
  const dialogDetails = await p.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return 'No dialog found';
    return {
      text: dialog.innerText.slice(0, 800),
      buttons: Array.from(dialog.querySelectorAll('div[role="button"], button, input')).map(b => ({
        tag: b.tagName,
        text: (b.innerText || '').trim().replace(/\n/g, ' '),
        aria: b.getAttribute('aria-label'),
        type: b.type
      }))
    };
  });

  console.log('Composer Dialog Details:', JSON.stringify(dialogDetails, null, 2));
  process.exit(0);
})();
