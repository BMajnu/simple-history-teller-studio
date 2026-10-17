const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

(async () => {
  console.log('=== UPDATING HINDI PAGE AVATAR ===');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--remote-debugging-port=9224'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();
  console.log('1. Navigating to facebook.com...');
  await p.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Click top right avatar
  console.log('2. Clicking top right avatar to open switch menu...');
  const topAvatar = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar.click();
  await p.waitForTimeout(2000);

  // Click "Simple History Teller Hindi"
  console.log('3. Clicking "Simple History Teller Hindi" in menu...');
  const hindiOption = p.locator('div[role="dialog"] div[role="listitem"]:has-text("Simple History Teller Hindi"), div[role="dialog"] div[role="button"]:has-text("Simple History Teller Hindi")').first();
  await hindiOption.click();
  console.log('Waiting 8s for profile switch to Hindi...');
  await p.waitForTimeout(8000);

  // 4. Navigate to profile page
  console.log('4. Navigating to https://www.facebook.com/me ...');
  await p.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // Dismiss any tours/dialogs
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  // 5. Click profile camera icon
  console.log('5. Clicking profile camera button...');
  const cameraClicked = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"]'));
    const cam = btns.find(b => {
      const a = (b.getAttribute('aria-label') || '').toLowerCase();
      return a.includes('profile') && (a.includes('picture') || a.includes('photo') || a.includes('update') || a.includes('actions'));
    });
    if (cam) {
      cam.click();
      return true;
    }
    return false;
  });
  console.log('Camera clicked:', cameraClicked);
  await p.waitForTimeout(2500);

  // 6. Click "Choose profile picture"
  console.log('6. Clicking "Choose profile picture"...');
  const chooseClicked = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
    const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
    if (c) {
      c.click();
      return true;
    }
    return false;
  });
  console.log('Choose clicked:', chooseClicked);
  await p.waitForTimeout(3000);

  // 7. Click "+ Upload Photo" in dialog
  console.log('7. Clicking "+ Upload Photo" with filechooser...');
  const uploadBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();
  
  const [fileChooser] = await Promise.all([
    p.waitForEvent('filechooser', { timeout: 10000 }),
    uploadBtn.click()
  ]);

  console.log('FileChooser intercepted! Setting mascot logo...');
  await fileChooser.setFiles(LOGO_PATH);

  console.log('File selected! Waiting 6s for crop modal...');
  await p.waitForTimeout(6000);

  // 8. Click Save
  console.log('8. Clicking Save button on profile modal...');
  const saved = await p.evaluate(() => {
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
  console.log('Save clicked:', saved);

  console.log('Waiting 10s for Facebook to save profile picture...');
  await p.waitForTimeout(10000);

  const shotPath = path.join(ARTIFACTS_DIR, 'fb_HINDI_ONLY_AVATAR_SAVED.png');
  await p.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  process.exit(0);
})();
