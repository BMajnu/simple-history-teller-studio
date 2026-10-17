const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const ROOT = path.resolve(__dirname, '..');
const AVATAR_PATH = path.resolve(ROOT, 'banner_assets', 'channel_avatar_logo_1791472337414.jpg');

async function main() {
  console.log('=== UPLOADING BANGLA AVATAR ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595477341365', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Click avatar camera
  console.log('Clicking avatar camera...');
  const avatarCamera = page.locator('div[aria-label*="profile picture"][role="button"], div[aria-label*="Profile picture"][role="button"], div[role="button"]:has(svg[aria-label*="profile picture"])').first();
  await avatarCamera.click({ force: true });
  await page.waitForTimeout(1500);

  const chooseOption = page.locator('span:has-text("Choose profile picture"), div[role="menuitem"]:has-text("Choose profile picture")').first();
  if (await chooseOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking Choose profile picture...');
    await chooseOption.click({ force: true });
    await page.waitForTimeout(2000);
  }

  // Click + Upload Photo button
  console.log('Clicking + Upload Photo button...');
  const uploadBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), span:has-text("Upload Photo")').first();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    uploadBtn.click({ force: true })
  ]);

  console.log('Setting file on fileChooser:', AVATAR_PATH);
  await fileChooser.setFiles(AVATAR_PATH);
  console.log('Waiting 5s for crop modal...');
  await page.waitForTimeout(5000);

  // Click Save button in crop modal
  const saveBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
  if (await saveBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
    console.log('Clicking Save Avatar button...');
    await saveBtn.click({ force: true });
    console.log('Waiting 8s for avatar upload to save...');
    await page.waitForTimeout(8000);
  }

  const finalShot = path.join(ARTIFACT_DIR, 'fb_bn_live_complete.png');
  await page.screenshot({ path: finalShot });
  console.log('Saved:', finalShot);

  await ctx.close();
  console.log('🎉 Bangla Page Avatar upload complete!');
}

main().catch(console.error);
