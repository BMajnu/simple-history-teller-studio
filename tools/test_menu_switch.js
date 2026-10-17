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
  console.log('Navigating to facebook.com...');
  await p.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Click top right avatar
  console.log('Clicking top right avatar...');
  const topAvatar = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar.click();
  await p.waitForTimeout(2000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'diag_top_menu_open.png') });
  console.log('Saved diag_top_menu_open.png');

  // Print all items in this menu
  const menuItems = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="dialog"] div[role="button"], div[role="dialog"] div[role="listitem"], div[role="menu"] div[role="menuitem"]')).map(el => el.innerText.trim().replace(/\n/g, ' '));
  });
  console.log('Menu items:', menuItems);

  process.exit(0);
})();
