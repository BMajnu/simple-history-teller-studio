const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

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

  // Find Add photo/video button
  const addBtn = await p.locator('text="Add photo/video"').first();
  console.log('Found Add photo/video button:', await addBtn.count());

  // Listen for filechooser
  let fileChooserPromise = p.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null);

  await addBtn.click();
  console.log('Clicked Add photo/video');
  await p.waitForTimeout(2000);

  const fileChooser = await fileChooserPromise;
  if (fileChooser) {
    console.log('File chooser triggered directly!');
  } else {
    console.log('No direct file chooser. Checking if a menu popped up...');
    const menuItems = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll('div[role="menuitem"], div[role="button"], span, div'));
      return Array.from(new Set(els.map(e => (e.innerText || '').trim()).filter(t => t.length > 0 && t.length < 40 && (t.toLowerCase().includes('video') || t.toLowerCase().includes('photo') || t.toLowerCase().includes('desktop') || t.toLowerCase().includes('upload')))));
    });
    console.log('Candidate menu items:', menuItems);
  }

  const shot = path.join(ARTIFACTS_DIR, 'after_add_media_click.png');
  await p.screenshot({ path: shot });
  console.log('Saved screenshot:', shot);

  await browser.close();
  process.exit(0);
})();
