const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

const pageId = process.argv[2] || '61595615845321';
const pageName = process.argv[3] || 'Simple History Teller';

(async () => {
  console.log(`\n======================================================`);
  console.log(`Updating Profile Photo (ONLY) for: ${pageName} (${pageId})`);
  console.log(`Mascot Logo: ${LOGO_PATH}`);

  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing Chrome CDP');
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
    console.log('Launched persistent Chrome');
  }

  const p = ctx.pages()[0] || await ctx.newPage();

  // Cancel any cover photo discard/cancel prompts if open
  const cancelBtn = p.locator('div[role="button"]:has-text("Cancel Changes"), div[role="button"]:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    console.log('Canceling cover photo prompt...');
    await cancelBtn.click().catch(() => {});
    await p.waitForTimeout(1000);
  }

  console.log(`Navigating to https://www.facebook.com/${pageId} ...`);
  await p.goto(`https://www.facebook.com/${pageId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // Check if we need to switch into the page
  const switchBtn = p.locator('div[role="button"]:has-text("Switch")').last();
  if (await switchBtn.isVisible().catch(() => false)) {
    const t = await switchBtn.innerText().catch(() => '');
    if (t.trim() === 'Switch') {
      console.log('Clicking Switch button...');
      await switchBtn.click();
      console.log('Waiting 8s for page reload after profile switch...');
      await p.waitForTimeout(8000);
    }
  }

  // Dismiss any tours/dialogs
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1500);

  // Check if Creator Dashboard prompt or similar needs closing
  const closeBtn = p.locator('div[aria-label="Close"], div[aria-label="Not now"], div[role="button"]:has-text("Not now")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await p.waitForTimeout(1000);
  }

  console.log('Locating Profile photo camera button...');
  // Find camera button in DOM
  let camFound = false;
  for (let retry = 0; retry < 5; retry++) {
    camFound = await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div[role="button"]'));
      const cam = btns.find(b => {
        const a = (b.getAttribute('aria-label') || '').toLowerCase();
        return a.includes('profile') && (a.includes('picture') || a.includes('photo') || a.includes('update') || a.includes('actions'));
      });
      if (cam) {
        cam.scrollIntoView();
        cam.click();
        return true;
      }
      return false;
    });

    if (camFound) {
      console.log('Clicked profile camera button!');
      break;
    }
    console.log(`Retry ${retry + 1}: camera button not found yet, waiting 2s...`);
    await p.waitForTimeout(2000);
  }

  await p.waitForTimeout(2500);

  // Look for "Choose profile picture"
  console.log('Locating "Choose profile picture" menu item...');
  let chooseFound = false;
  for (let retry = 0; retry < 5; retry++) {
    chooseFound = await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
      const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
      if (c) {
        c.click();
        return true;
      }
      return false;
    });

    if (chooseFound) {
      console.log('Clicked "Choose profile picture"!');
      break;
    }
    await p.waitForTimeout(1500);
  }

  await p.waitForTimeout(3000);

  // Look for "+ Upload Photo" button in dialog
  console.log('Locating "+ Upload Photo" button in dialog...');
  const uploadBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();
  
  if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found "+ Upload Photo" button, intercepting filechooser...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      uploadBtn.click()
    ]);
    console.log('FileChooser received! Setting logo file...');
    await fileChooser.setFiles(LOGO_PATH);
  } else {
    console.log('Trying evaluate click for Upload Photo...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      p.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return false;
        const b = Array.from(dialog.querySelectorAll('div[role="button"], span')).find(el => el.innerText && el.innerText.includes('Upload Photo'));
        if (b) {
          b.click();
          return true;
        }
        return false;
      })
    ]);
    await fileChooser.setFiles(LOGO_PATH);
  }

  console.log('File selected! Waiting 6s for adjustment/crop modal...');
  await p.waitForTimeout(6000);

  // Click Save button
  console.log('Locating Save button...');
  let saved = false;
  for (let retry = 0; retry < 5; retry++) {
    saved = await p.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return false;
      const btns = Array.from(dialog.querySelectorAll('div[role="button"], button'));
      const s = btns.find(b => b.innerText && b.innerText.trim() === 'Save');
      if (s) {
        s.click();
        return true;
      }
      return false;
    });

    if (saved) {
      console.log('Save button clicked successfully!');
      break;
    }
    await p.waitForTimeout(1500);
  }

  console.log('Waiting 10s for Facebook to save profile picture...');
  await p.waitForTimeout(10000);

  const finalShot = path.join(ARTIFACTS_DIR, `fb_ONLY_AVATAR_SAVED_${pageId}.png`);
  await p.screenshot({ path: finalShot });
  console.log(`Saved screenshot: ${finalShot}`);

  process.exit(0);
})();
