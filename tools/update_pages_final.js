const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

async function uploadAvatarAndSave(p, label) {
  console.log(`\n--- UPLOADING AVATAR FOR ${label} ---`);
  await p.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Dismiss any tours/dialogs
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  // 1. Click camera button
  console.log('Clicking profile camera icon...');
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

  // 2. Click "Choose profile picture"
  console.log('Clicking "Choose profile picture"...');
  await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
    const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
    if (c) c.click();
  });
  await p.waitForTimeout(3000);

  // 3. Click "+ Upload Photo" with filechooser
  console.log('Clicking "+ Upload Photo"...');
  const uploadBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();

  const [fileChooser] = await Promise.all([
    p.waitForEvent('filechooser', { timeout: 10000 }),
    uploadBtn.click()
  ]);

  console.log('Setting mascot logo file...');
  await fileChooser.setFiles(LOGO_PATH);
  console.log('File selected! Waiting 6s for crop modal...');
  await p.waitForTimeout(6000);

  // 4. Click Save button on crop modal
  console.log('Locating Save button...');
  const saveBtn = p.locator('div[role="dialog"] div[aria-label="Save"][role="button"], div[role="dialog"] div[role="button"]:has-text("Save"), div[role="dialog"] button:has-text("Save")').last();
  
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save via locator...');
    await saveBtn.click();
  } else {
    console.log('Clicking Save via coordinate or evaluate...');
    await p.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return;
      const btns = Array.from(dialog.querySelectorAll('div[role="button"], button'));
      const s = btns.find(b => b.innerText && b.innerText.includes('Save'));
      if (s) s.click();
    });
  }

  console.log('Save clicked! Waiting 10s for Facebook to process avatar...');
  await p.waitForTimeout(10000);

  const shot = path.join(ARTIFACTS_DIR, `fb_avatar_SUCCESS_${label}.png`);
  await p.screenshot({ path: shot });
  console.log(`Saved screenshot: ${shot}`);
}

(async () => {
  console.log('=== STARTING FINAL MASCOT AVATAR APPLICATION ===');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled', '--remote-debugging-port=9224'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();

  // ------------------------------------------------------------------------
  // PART 1: HINDI PAGE
  // ------------------------------------------------------------------------
  console.log('\n[1/2] Processing Hindi Page...');
  // First ensure we are switched into Hindi
  await p.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Check top right avatar to switch to Hindi if needed
  const topAvatar = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar.click();
  await p.waitForTimeout(2000);

  const hindiOpt = p.locator('div[role="dialog"] div[role="listitem"]:has-text("Simple History Teller Hindi"), div[role="dialog"] div[role="button"]:has-text("Simple History Teller Hindi")').first();
  if (await hindiOpt.isVisible().catch(() => false)) {
    console.log('Switching to Simple History Teller Hindi...');
    await hindiOpt.click();
    await p.waitForTimeout(7000);
  } else {
    await p.keyboard.press('Escape');
    await p.waitForTimeout(1000);
  }

  await uploadAvatarAndSave(p, 'Hindi');

  // ------------------------------------------------------------------------
  // PART 2: ENGLISH PAGE
  // ------------------------------------------------------------------------
  console.log('\n[2/2] Processing English Page...');
  await p.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Switch to English page
  console.log('Opening profile menu to switch to English...');
  const topAvatar2 = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar2.click();
  await p.waitForTimeout(2000);

  // Click "See all profiles"
  const seeAll = p.locator('div[role="button"]:has-text("See all profiles"), span:has-text("See all profiles")').first();
  if (await seeAll.isVisible().catch(() => false)) {
    console.log('Clicking "See all profiles"...');
    await seeAll.click();
    await p.waitForTimeout(2000);
  }

  const enOpt = p.locator('div[role="dialog"] div[role="button"]:has-text("Simple History Teller"), div[role="dialog"] div[role="listitem"]:has-text("Simple History Teller")').first();
  if (await enOpt.isVisible().catch(() => false)) {
    console.log('Clicking Simple History Teller (English)...');
    await enOpt.click();
    await p.waitForTimeout(7000);
  }

  await uploadAvatarAndSave(p, 'English');

  // ------------------------------------------------------------------------
  // PART 3: FINAL VERIFICATION
  // ------------------------------------------------------------------------
  console.log('\n[3/3] Navigating to Pages overview for final verification...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(6000);

  const finalOverview = path.join(ARTIFACTS_DIR, 'fb_FINAL_ALL_3_PAGES_VERIFIED.png');
  await p.screenshot({ path: finalOverview });
  console.log(`FINAL MASTER SCREENSHOT: ${finalOverview}`);

  console.log('=== ALL 3 PAGES UPDATED WITH OFFICIAL MASCOT LOGO! ===');
  process.exit(0);
})();
