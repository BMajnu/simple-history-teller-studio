const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const ROOT = path.resolve(__dirname, '..');
const AVATAR_PATH = path.resolve(ROOT, 'banner_assets', 'channel_avatar_logo_1791472337414.jpg');

async function main() {
  console.log('=== FINISHING BANGLA BRANDING ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595477341365', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // 1. Dismiss "Welcome to your new Page!" modal
  console.log('Checking for Use Page modal...');
  const usePageBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Use Page"), div[role="button"]:has-text("Use Page")').first();
  if (await usePageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Use Page button...');
    await usePageBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // Also check if any close icon (X) or Not now is open
  const closeBtn = page.locator('div[role="dialog"] div[aria-label="Close"], div[aria-label="Close"][role="button"]').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Clicking Close on dialog...');
    await closeBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }

  // 2. Check for Save changes button on cover photo
  console.log('Checking for Save changes on cover photo...');
  const saveCoverBtn = page.locator('div[role="button"]:has-text("Save changes"), div[aria-label="Save changes"]').first();
  if (await saveCoverBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Saving cover photo changes...');
    await saveCoverBtn.click({ force: true });
    await page.waitForTimeout(4000);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fb_bn_after_cover_saved.png') });

  // 3. Upload Avatar Logo
  console.log('Looking for Avatar camera button...');
  const avatarCamera = page.locator('div[aria-label*="profile picture"][role="button"], div[aria-label*="Profile picture"][role="button"], div[role="button"]:has(svg[aria-label*="profile picture"])').first();

  if (await avatarCamera.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking avatar camera button...');
    await avatarCamera.click({ force: true });
    await page.waitForTimeout(2500);

    const uploadOption = page.locator('div[role="menuitem"]:has-text("Upload photo"), div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking Upload photo menu item...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        uploadOption.click({ force: true })
      ]);
      await fileChooser.setFiles(AVATAR_PATH);
    } else {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(AVATAR_PATH);
    }

    console.log('Waiting for Avatar crop/save modal...');
    await page.waitForTimeout(5000);

    const saveAvatarBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
    if (await saveAvatarBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save Avatar...');
      await saveAvatarBtn.click({ force: true });
      await page.waitForTimeout(6000);
    }
  }

  await page.waitForTimeout(5000);
  const finalShot = path.join(ARTIFACT_DIR, 'fb_bn_complete_branded.png');
  await page.screenshot({ path: finalShot });
  console.log('Saved final screenshot:', finalShot);

  await ctx.close();
  console.log('🎉 Bangla page branding complete!');
}

main().catch(console.error);
