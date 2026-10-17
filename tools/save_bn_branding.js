const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const ROOT = path.resolve(__dirname, '..');
const AVATAR_PATH = path.resolve(ROOT, 'banner_assets', 'channel_avatar_logo_1791472337414.jpg');

async function main() {
  console.log('=== SAVING BANGLA BRANDING CHANGES ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595477341365', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // 1. Save Cover changes if visible
  const saveChangesBtn = page.locator('div[role="button"]:has-text("Save changes"), [aria-label="Save changes"]').first();
  if (await saveChangesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Save changes for cover photo...');
    await saveChangesBtn.click({ force: true });
    await page.waitForTimeout(4000);
  }

  // 2. Click avatar camera or Choose profile picture
  console.log('Clicking avatar camera button...');
  const avatarCamera = page.locator('div[aria-label*="profile picture"][role="button"], div[aria-label*="Profile picture"][role="button"], div[role="button"]:has(svg[aria-label*="profile picture"])').first();
  if (await avatarCamera.isVisible({ timeout: 4000 }).catch(() => false)) {
    await avatarCamera.click({ force: true });
    await page.waitForTimeout(1500);

    const chooseOption = page.locator('span:has-text("Choose profile picture"), div[role="menuitem"]:has-text("Choose profile picture")').first();
    const uploadPhotoBtn = page.locator('div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();

    if (await chooseOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Choose profile picture...');
      await chooseOption.click({ force: true });
      await page.waitForTimeout(2000);
    }

    console.log('Setting file on file input...');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(AVATAR_PATH);
      await page.waitForTimeout(5000);

      const saveModalBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
      if (await saveModalBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Saving avatar in dialog...');
        await saveModalBtn.click({ force: true });
        await page.waitForTimeout(6000);
      }
    }
  }

  await page.waitForTimeout(3000);
  const shot = path.join(ARTIFACT_DIR, 'fb_bn_saved_final.png');
  await page.screenshot({ path: shot });
  console.log('Saved:', shot);

  await ctx.close();
  console.log('Bangla branding saved!');
}

main().catch(console.error);
