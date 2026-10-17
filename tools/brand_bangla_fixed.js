const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const ROOT = path.resolve(__dirname, '..');
const AVATAR_PATH = path.resolve(ROOT, 'banner_assets', 'channel_avatar_logo_1791472337414.jpg');
const BANNER_PATH = path.resolve(ROOT, 'banner_assets', 'banner_simple_history_teller_bn.jpg');

async function main() {
  console.log('=== BRANDING BANGLA PAGE: SWITCH & UPLOAD ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  
  // Go directly to page URL
  console.log('Navigating to Bangla page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595477341365', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Check for the "Switch" dialog or Switch button
  const dialogSwitchBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Switch"), div[role="dialog"] [role="button"]:has-text("Switch"), div[role="button"]:has-text("Switch Now")').first();
  if (await dialogSwitchBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Switch button in dialog...');
    await dialogSwitchBtn.click({ force: true });
    console.log('Waiting 8s for context switch to Page profile...');
    await page.waitForTimeout(8000);
  }

  const switchedShot = path.join(ARTIFACT_DIR, 'fb_bn_page_switched.png');
  await page.screenshot({ path: switchedShot });
  console.log('Saved:', switchedShot);
  console.log('Current URL after switch:', page.url());

  // Check if "Welcome to your new Page" take a tour modal appears
  const closeTourBtn = page.locator('div[aria-label="Close"], div[role="button"]:has-text("Not now"), div[role="button"]:has-text("Not Now"), div[aria-label="Not now"]').first();
  if (await closeTourBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Dismissing tour modal...');
    await closeTourBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }

  // 1. UPLOAD AVATAR
  console.log('Looking for Avatar camera button...');
  const avatarCamera = page.locator('div[aria-label*="profile picture"][role="button"], div[aria-label*="Profile picture"][role="button"], div[role="button"]:has(svg[aria-label*="profile picture"])').first();
  
  if (await avatarCamera.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking avatar camera...');
    await avatarCamera.click({ force: true });
    await page.waitForTimeout(2000);

    const uploadPhotoOption = page.locator('div[role="menuitem"]:has-text("Upload photo"), div[role="button"]:has-text("Upload Photo"), span:has-text("Upload photo"), span:has-text("Upload Photo")').first();
    if (await uploadPhotoOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking Upload Photo menuitem...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        uploadPhotoOption.click({ force: true })
      ]);
      await fileChooser.setFiles(AVATAR_PATH);
    } else {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(AVATAR_PATH);
    }

    console.log('Waiting for Avatar edit modal...');
    await page.waitForTimeout(4000);
    const saveBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
    if (await saveBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save Avatar...');
      await saveBtn.click({ force: true });
      await page.waitForTimeout(6000);
    }
  }

  // 2. UPLOAD COVER BANNER
  console.log('Looking for Cover Photo button...');
  const coverBtn = page.locator('div[role="button"]:has-text("Add cover photo"), div[role="button"]:has-text("Edit cover photo"), div[aria-label*="cover photo"][role="button"]').first();

  if (await coverBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Cover Photo button...');
    await coverBtn.click({ force: true });
    await page.waitForTimeout(2000);

    const uploadCoverOption = page.locator('div[role="menuitem"]:has-text("Upload photo"), div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadCoverOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Triggering Cover file chooser...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        uploadCoverOption.click({ force: true })
      ]);
      await fileChooser.setFiles(BANNER_PATH);
    } else {
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 0) {
        await fileInputs.last().setInputFiles(BANNER_PATH);
      }
    }

    console.log('Waiting 5s for cover preview...');
    await page.waitForTimeout(5000);
    const saveChangesBtn = page.locator('div[role="button"]:has-text("Save changes"), div[aria-label="Save changes"]').first();
    if (await saveChangesBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save Changes for Cover...');
      await saveChangesBtn.click({ force: true });
      await page.waitForTimeout(6000);
    }
  }

  await page.waitForTimeout(4000);
  const finalShot = path.join(ARTIFACT_DIR, 'fb_bn_page_branded_final.png');
  await page.screenshot({ path: finalShot });
  console.log('Saved final screenshot:', finalShot);

  await ctx.close();
  console.log('Done!');
}

main().catch(console.error);
