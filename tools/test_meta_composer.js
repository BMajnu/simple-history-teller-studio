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
  console.log('Navigating to Meta Business Suite Composer...');
  await p.goto('https://business.facebook.com/latest/composer', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await p.waitForTimeout(6000);

  const shot = path.join(ARTIFACTS_DIR, 'meta_composer_state.png');
  await p.screenshot({ path: shot });
  console.log('Saved screenshot:', shot);
  console.log('Current URL:', p.url());

  const info = await p.evaluate(() => {
    return {
      title: document.title,
      buttons: Array.from(document.querySelectorAll('div[role="button"], button')).map(b => (b.innerText || '').trim().replace(/\n/g, ' ')).filter(t => t.length > 0).slice(0, 30)
    };
  });
  console.log('Composer info:', JSON.stringify(info, null, 2));

  process.exit(0);
})();
