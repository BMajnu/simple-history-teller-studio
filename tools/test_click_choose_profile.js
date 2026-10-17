const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

(async () => {
  console.log('Connecting to Chrome CDP or launching...');
  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing CDP');
  } catch (e) {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
    console.log('Launched Chrome');
  }

  const p = ctx.pages()[0] || await ctx.newPage();
  
  // Make sure we cancel any unsaved cover photo changes
  const cancelBtn = p.locator('div[role="button"]:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    console.log('Canceling cover photo preview...');
    await cancelBtn.click();
    await p.waitForTimeout(1500);
  }

  // Go to Bangla page if not already there
  if (!p.url().includes('61595477341365')) {
    await p.goto('https://www.facebook.com/61595477341365', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(4000);
  }

  // Click the profile camera icon
  console.log('Clicking profile photo camera button...');
  await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"]'));
    const cam = btns.find(b => {
      const a = (b.getAttribute('aria-label') || '').toLowerCase();
      return a.includes('profile') && (a.includes('picture') || a.includes('photo') || a.includes('update') || a.includes('actions'));
    });
    if (cam) cam.click();
  });
  await p.waitForTimeout(2000);

  // Click "Choose profile picture"
  console.log('Clicking "Choose profile picture"...');
  const chooseOption = p.locator('div[role="menuitem"]:has-text("Choose profile picture"), span:has-text("Choose profile picture")').first();
  if (await chooseOption.isVisible().catch(() => false)) {
    await chooseOption.click();
    await p.waitForTimeout(3000);
  } else {
    console.log('Choose option not visible by locator, clicking via evaluate...');
    await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
      const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
      if (c) c.click();
    });
    await p.waitForTimeout(3000);
  }

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'fb_choose_profile_modal.png') });
  console.log('Saved fb_choose_profile_modal.png');

  // Inspect what is inside this modal
  const modalInfo = await p.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return 'No dialog found';
    return {
      text: dialog.innerText.slice(0, 500),
      buttons: Array.from(dialog.querySelectorAll('div[role="button"], button, input')).map(b => ({
        tag: b.tagName,
        type: b.type,
        text: b.innerText,
        ariaLabel: b.getAttribute('aria-label')
      }))
    };
  });
  console.log('Modal Info:', JSON.stringify(modalInfo, null, 2));

  process.exit(0);
})();
