const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();
  console.log('Navigating to Meta Business Suite Composer...');
  await p.goto('https://business.facebook.com/latest/composer', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await p.waitForTimeout(5000);

  const data = await p.evaluate(() => {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
      accept: el.accept,
      id: el.id,
      name: el.name,
      multiple: el.multiple,
      outerHTML: el.outerHTML
    }));

    const allButtons = Array.from(document.querySelectorAll('button, div[role="button"]'))
      .map(b => (b.innerText || '').trim())
      .filter(t => t.length > 0 && t.length < 50);

    return { fileInputs, allButtons: Array.from(new Set(allButtons)) };
  });

  console.log('File Inputs:', JSON.stringify(data.fileInputs, null, 2));
  console.log('Buttons:', JSON.stringify(data.allButtons, null, 2));

  await browser.close();
  process.exit(0);
})();
