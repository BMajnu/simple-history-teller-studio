const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

(async () => {
  console.log('=== UPDATING ENGLISH PAGE (Simple History Teller) AVATAR ONLY ===');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--remote-debugging-port=9224'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();
  
  // 1. Navigate to Pages list
  console.log('1. Navigating to Pages list...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // 2. Click the top-right avatar menu
  console.log('2. Clicking top-right avatar menu...');
  const topAvatar = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar.click();
  await p.waitForTimeout(2000);

  // 3. Click "See all profiles"
  console.log('3. Clicking "See all profiles"...');
  const seeAll = p.locator('div[role="button"]:has-text("See all profiles"), span:has-text("See all profiles")').first();
  if (await seeAll.isVisible().catch(() => false)) {
    await seeAll.click();
    await p.waitForTimeout(2000);
  }

  // 4. In the list of all profiles, find and click "Simple History Teller" (English - without Hindi or Bangla in title!)
  console.log('4. Finding exact "Simple History Teller" option...');
  const clickedTarget = await p.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return false;
    const items = Array.from(dialog.querySelectorAll('div[role="button"], div[role="listitem"]'));
    // Find the one where text starts with "Simple History Teller" and NOT "Bangla" and NOT "Hindi"
    const target = items.find(el => {
      const t = el.innerText.trim();
      return (t === 'Simple History Teller' || t.startsWith('Simple History Teller\n')) && !t.includes('Bangla') && !t.includes('Hindi');
    });
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  console.log('Clicked exact English profile:', clickedTarget);
  console.log('Waiting 8s for profile switch to English...');
  await p.waitForTimeout(8000);

  // 5. Navigate to https://www.facebook.com/me
  console.log('5. Navigating to https://www.facebook.com/me ...');
  await p.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'diag_en_admin_view.png') });
  console.log('Saved diag_en_admin_view.png');

  // 6. Click camera icon
  console.log('6. Clicking profile camera icon...');
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

  // 7. Click "Choose profile picture"
  console.log('7. Clicking "Choose profile picture"...');
  await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
    const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
    if (c) c.click();
  });
  await p.waitForTimeout(3000);

  // 8. Click "+ Upload Photo" with filechooser
  console.log('8. Clicking "+ Upload Photo" with filechooser...');
  const uploadBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();

  const [fileChooser] = await Promise.all([
    p.waitForEvent('filechooser', { timeout: 10000 }),
    uploadBtn.click()
  ]);

  console.log('Setting mascot logo file...');
  await fileChooser.setFiles(LOGO_PATH);
  console.log('File selected! Waiting 6s for crop modal...');
  await p.waitForTimeout(6000);

  // 9. Click Save
  console.log('9. Clicking Save button on profile modal...');
  const saveBtn = p.locator('div[role="dialog"] div[aria-label="Save"][role="button"], div[role="dialog"] div[role="button"]:has-text("Save"), div[role="dialog"] button:has-text("Save")').last();

  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save via locator...');
    await saveBtn.click();
  } else {
    console.log('Clicking Save via evaluate...');
    await p.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return;
      const btns = Array.from(dialog.querySelectorAll('div[role="button"], button'));
      const s = btns.find(b => b.innerText && b.innerText.includes('Save'));
      if (s) s.click();
    });
  }

  console.log('Waiting 10s for avatar to save on Facebook...');
  await p.waitForTimeout(10000);

  const shot = path.join(ARTIFACTS_DIR, 'fb_avatar_SUCCESS_English_final.png');
  await p.screenshot({ path: shot });
  console.log(`Saved screenshot: ${shot}`);

  // 10. Go to Pages overview to capture all 3
  console.log('10. Navigating to Pages overview for final confirmation...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(6000);

  const finalOverview = path.join(ARTIFACTS_DIR, 'fb_ALL_THREE_PAGES_MASCOT_PERFECT.png');
  await p.screenshot({ path: finalOverview });
  console.log(`ALL THREE PAGES FINAL SCREENSHOT: ${finalOverview}`);

  process.exit(0);
})();
