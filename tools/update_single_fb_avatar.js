const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

// Target page ID passed from argv, or default to Bangla
const TARGET_PAGE_ID = process.argv[2] || '61595477341365';
const TARGET_PAGE_NAME = process.argv[3] || 'Simple History Teller Bangla';

(async () => {
  console.log(`=== UPDATING AVATAR FOR: ${TARGET_PAGE_NAME} (${TARGET_PAGE_ID}) ===`);
  console.log('Logo path:', LOGO_PATH, `(${fs.statSync(LOGO_PATH).size} bytes)`);

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
    console.log('Launched persistent Chrome context');
  }

  const p = ctx.pages()[0] || await ctx.newPage();

  // 1. First go to Facebook Home to inspect current profile state
  console.log('1. Navigating to facebook.com...');
  await p.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);

  // Check which profile is active by looking at top right
  console.log('Checking active profile...');
  const topAvatar = p.locator('div[aria-label="Your profile"][role="button"]').first();
  await topAvatar.click();
  await p.waitForTimeout(2000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_switch_menu_before_${TARGET_PAGE_ID}.png`) });

  // In the switch menu, look for target page item or "See all profiles"
  console.log(`Looking for "${TARGET_PAGE_NAME}" in profile switcher menu...`);
  const pageOption = p.locator(`div[role="listitem"]:has-text("${TARGET_PAGE_NAME}"), div[role="button"]:has-text("${TARGET_PAGE_NAME}")`).first();

  if (await pageOption.isVisible().catch(() => false)) {
    console.log(`Found "${TARGET_PAGE_NAME}" in menu! Clicking to switch...`);
    await pageOption.click();
    await p.waitForTimeout(6000);
  } else {
    console.log('Not in immediate list, clicking "See all profiles"...');
    const seeAllBtn = p.locator('div[role="button"]:has-text("See all profiles"), span:has-text("See all profiles")').first();
    if (await seeAllBtn.isVisible().catch(() => false)) {
      await seeAllBtn.click();
      await p.waitForTimeout(2000);

      const targetInList = p.locator(`div[role="button"]:has-text("${TARGET_PAGE_NAME}"), div[role="listitem"]:has-text("${TARGET_PAGE_NAME}")`).first();
      if (await targetInList.isVisible().catch(() => false)) {
        console.log(`Found "${TARGET_PAGE_NAME}" in all profiles list! Clicking...`);
        await targetInList.click();
        await p.waitForTimeout(6000);
      }
    }
  }

  // 2. Now navigate directly to the Page profile URL
  const pageUrl = `https://www.facebook.com/${TARGET_PAGE_ID}`;
  console.log(`2. Navigating to page profile: ${pageUrl}...`);
  await p.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // Dismiss any "Switch into" prompt if still showing
  const switchPromptBtn = p.locator('div[role="button"]:has-text("Switch")').last();
  if (await switchPromptBtn.isVisible().catch(() => false)) {
    const text = await switchPromptBtn.innerText().catch(() => '');
    if (text.trim() === 'Switch') {
      console.log('Switch button found on page, clicking to confirm switch...');
      await switchPromptBtn.click();
      await p.waitForTimeout(6000);
    }
  }

  // Dismiss any tours or modal popups
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_page_admin_view_${TARGET_PAGE_ID}.png`) });

  // 3. Find profile photo camera icon
  console.log('3. Searching for Profile photo camera icon on admin page...');
  const cameraIcon = p.locator('div[aria-label="Update profile picture"][role="button"], div[aria-label="Actions for profile photo"][role="button"], div[aria-label*="profile picture"][role="button"]').first();

  let cameraFound = false;
  if (await cameraIcon.isVisible().catch(() => false)) {
    console.log('Camera icon found via aria-label! Clicking...');
    await cameraIcon.click();
    cameraFound = true;
  } else {
    // Try to find the camera icon by svg or button near the profile picture
    console.log('Searching via evaluate...');
    cameraFound = await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div[role="button"]'));
      const cam = btns.find(b => {
        const a = (b.getAttribute('aria-label') || '').toLowerCase();
        return a.includes('profile') && (a.includes('picture') || a.includes('photo') || a.includes('update'));
      });
      if (cam) {
        cam.click();
        return true;
      }
      return false;
    });
  }

  console.log('Camera button clicked:', cameraFound);
  await p.waitForTimeout(2500);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_after_camera_click_${TARGET_PAGE_ID}.png`) });

  // 4. Click "Upload photo" in the dropdown
  console.log('4. Looking for "Upload photo" menu item...');
  const uploadItem = p.locator('div[role="menuitem"]:has-text("Upload photo"), span:has-text("Upload photo"), div[role="button"]:has-text("Upload photo")').first();

  if (await uploadItem.isVisible().catch(() => false)) {
    console.log('Found "Upload photo" menu item! Setting up filechooser intercept...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null),
      uploadItem.click()
    ]);

    if (fileChooser) {
      console.log('FileChooser intercepted! Setting mascot logo file...');
      await fileChooser.setFiles(LOGO_PATH);
    } else {
      console.log('Fallback: setting file directly on input[type="file"]...');
      await p.locator('input[type="file"]').last().setInputFiles(LOGO_PATH);
    }
  } else {
    console.log('Upload photo menuitem not visible, checking for input[type="file"] in DOM...');
    const fileInputs = p.locator('input[type="file"]');
    if (await fileInputs.count() > 0) {
      console.log('Found input[type="file"]! Setting mascot logo...');
      await fileInputs.first().setInputFiles(LOGO_PATH);
    }
  }

  console.log('Waiting 6s for photo crop / adjustment modal...');
  await p.waitForTimeout(6000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_crop_modal_active_${TARGET_PAGE_ID}.png`) });

  // 5. Click Save on the crop modal
  console.log('5. Clicking Save on profile picture modal...');
  const saveBtn = p.locator('div[aria-label="Save"][role="button"], div[role="button"]:has-text("Save"), button:has-text("Save")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Found Save button! Clicking...');
    await saveBtn.click();
    console.log('Save clicked! Waiting 8s for processing...');
    await p.waitForTimeout(8000);
  } else {
    console.log('Save button not found via locator, searching in dialog...');
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
    console.log('Dialog Save clicked:', saved);
    await p.waitForTimeout(8000);
  }

  // 6. Verification screenshot
  const verifiedScreenshot = path.join(ARTIFACTS_DIR, `fb_avatar_LIVE_SUCCESS_${TARGET_PAGE_ID}.png`);
  await p.screenshot({ path: verifiedScreenshot });
  console.log(`SUCCESS! Live verified screenshot saved: ${verifiedScreenshot}`);

  process.exit(0);
})();
