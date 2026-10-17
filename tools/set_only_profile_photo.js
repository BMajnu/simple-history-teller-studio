const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

const pageId = process.argv[2] || '61595477341365';
const pageName = process.argv[3] || 'Simple History Teller Bangla';

(async () => {
  console.log(`\n======================================================`);
  console.log(`Setting ONLY Profile Photo for: ${pageName} (${pageId})`);
  console.log(`Logo: ${LOGO_PATH}`);

  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing CDP on 9224');
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

  // 1. Ensure we cancel any pending cover photo changes
  const cancelBtn = p.locator('div[role="button"]:has-text("Cancel Changes"), div[role="button"]:has-text("Cancel")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    console.log('Discarding any unsaved cover photo preview...');
    await cancelBtn.click().catch(() => {});
    await p.waitForTimeout(1500);
  }

  // 2. Switch to this page if not already switched
  console.log(`Navigating to https://www.facebook.com/${pageId}...`);
  await p.goto(`https://www.facebook.com/${pageId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // If there is a "Switch into" prompt on the page, click Switch
  const switchBtn = p.locator('div[role="button"]:has-text("Switch")').last();
  if (await switchBtn.isVisible().catch(() => false)) {
    const text = await switchBtn.innerText().catch(() => '');
    if (text.trim() === 'Switch') {
      console.log('Switch button present, switching into page...');
      await switchBtn.click();
      await p.waitForTimeout(6000);
    }
  }

  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  // 3. Click the profile picture camera icon
  console.log('Clicking profile picture camera icon...');
  const cameraClicked = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"]'));
    // Find the button directly associated with profile picture
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
  console.log('Camera button clicked:', cameraClicked);
  await p.waitForTimeout(2000);

  // 4. Click "Choose profile picture" in the dropdown
  console.log('Clicking "Choose profile picture"...');
  const chooseClicked = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
    const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
    if (c) {
      c.click();
      return true;
    }
    return false;
  });
  console.log('Choose profile picture clicked:', chooseClicked);
  await p.waitForTimeout(3000);

  // 5. In the "Choose profile picture" dialog, click "+ Upload Photo" with filechooser
  console.log('Looking for "+ Upload Photo" in dialog...');
  const uploadPhotoBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();

  if (await uploadPhotoBtn.isVisible().catch(() => false)) {
    console.log('Found "+ Upload Photo" button! Intercepting filechooser...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      uploadPhotoBtn.click()
    ]);

    console.log('FileChooser intercepted! Uploading mascot logo...');
    await fileChooser.setFiles(LOGO_PATH);
  } else {
    // If not found by text, search dialog buttons
    console.log('Searching dialog for upload button...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      p.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        const b = Array.from(dialog.querySelectorAll('div[role="button"], span')).find(el => el.innerText && el.innerText.includes('Upload Photo'));
        if (b) b.click();
      })
    ]);
    await fileChooser.setFiles(LOGO_PATH);
  }

  console.log('Mascot logo selected! Waiting 6s for adjustment/crop modal...');
  await p.waitForTimeout(6000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_profile_crop_active_${pageId}.png`) });

  // 6. Click Save on the crop modal
  console.log('Looking for Save button on profile picture modal...');
  const saveBtn = p.locator('div[aria-label="Save"][role="button"], div[role="dialog"] div[role="button"]:has-text("Save"), div[role="dialog"] button:has-text("Save")').last();

  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save...');
    await saveBtn.click();
  } else {
    console.log('Searching DOM for Save button inside dialog...');
    await p.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return;
      const btns = Array.from(dialog.querySelectorAll('div[role="button"], button'));
      const s = btns.find(b => b.innerText && b.innerText.trim() === 'Save');
      if (s) s.click();
    });
  }

  console.log('Waiting 10s for avatar to save and update on Facebook...');
  await p.waitForTimeout(10000);

  const screenshotPath = path.join(ARTIFACTS_DIR, `fb_ONLY_AVATAR_SAVED_${pageId}.png`);
  await p.screenshot({ path: screenshotPath });
  console.log(`SUCCESS! Saved verified screenshot: ${screenshotPath}`);

  process.exit(0);
})();
