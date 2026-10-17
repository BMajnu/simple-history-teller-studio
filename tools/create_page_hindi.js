const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const ROOT = path.resolve(__dirname, '..');
const AVATAR_PATH = path.resolve(ROOT, 'banner_assets', 'channel_avatar_logo_1791472337414.jpg');
const BANNER_PATH = path.resolve(ROOT, 'banner_assets', 'banner_simple_history_teller_hi.jpg');

async function main() {
  console.log('=== CREATING & BRANDING PAGE 3: SIMPLE HISTORY TELLER HINDI ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Ensure on personal profile or navigate to pages/create
  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // If redirected or page cannot be created because on a Page, switch back
  const switchBack = page.locator('div[role="button"]:has-text("Switch to Badiuzzaman"), div[aria-label*="Switch to Badiuzzaman"]').first();
  if (await switchBack.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Switching back to Badiuzzaman Majnu...');
    await switchBack.click({ force: true });
    await page.waitForTimeout(6000);
    await page.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
  }

  // Fill Page Name
  console.log('Typing Page Name: Simple History Teller Hindi...');
  const nameInput = page.locator('label:has-text("Page name") input, input[type="text"]:visible').first();
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.click({ force: true });
  await page.keyboard.type('Simple History Teller Hindi', { delay: 60 });
  await page.waitForTimeout(1000);

  // Fill Category
  console.log('Typing Category: Digital creator...');
  const catInput = page.locator('input[aria-label*="Category"]').first();
  await catInput.waitFor({ state: 'visible', timeout: 10000 });
  await catInput.click({ force: true });
  await page.keyboard.type('Digital creator', { delay: 70 });
  await page.waitForTimeout(2500);

  // Select category option
  const option = page.locator('div[role="listbox"] div[role="option"], ul[role="listbox"] li, div[role="option"]').first();
  if (await option.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking category dropdown option...');
    await option.click({ force: true });
    await page.waitForTimeout(1500);
  } else {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }

  // Fill Bio
  console.log('Typing Bio...');
  const bioInput = page.locator('textarea:visible').first();
  if (await bioInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await bioInput.click({ force: true });
    await page.keyboard.type('🏛️ एनिमेशन और सरल अंदाज़ में मानव इतिहास के रहस्यमयी और अनसुने किस्से! ⏰ हर २ दिन में नया एपिसोड 📺 YouTube: @SimpleHistoryTellerHindi', { delay: 25 });
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fb_create_hi_filled.png') });

  // Click Create Page
  console.log('Clicking Create Page button...');
  const createBtn = page.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Waiting 14s for Facebook page creation API...');
  await page.waitForTimeout(14000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fb_create_hi_step1.png') });

  // 3. Navigate to Your Pages
  console.log('Navigating to Your Pages...');
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const hiPageCard = page.locator('span:text-is("Simple History Teller Hindi")').first();
  if (await hiPageCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Simple History Teller Hindi page card...');
    await hiPageCard.click({ force: true });
    await page.waitForTimeout(5000);
  }

  // Switch into Page mode
  const dialogSwitchBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Switch"), div[role="dialog"] [role="button"]:has-text("Switch"), div[role="button"]:has-text("Switch Now")').first();
  if (await dialogSwitchBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Switch button in dialog...');
    await dialogSwitchBtn.click({ force: true });
    await page.waitForTimeout(8000);
  }

  // Dismiss "Welcome to your new Page!" modal
  const usePageBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Use Page"), div[role="button"]:has-text("Use Page")').first();
  if (await usePageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Use Page button...');
    await usePageBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  const closeTourBtn = page.locator('div[role="dialog"] div[aria-label="Close"], div[aria-label="Close"][role="button"]').first();
  if (await closeTourBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeTourBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }

  console.log('Current URL on Hindi page:', page.url());

  // 4. UPLOAD COVER BANNER
  console.log('Looking for Cover Photo button...');
  const coverBtn = page.locator('div[role="button"]:has-text("Add cover photo"), div[role="button"]:has-text("Edit cover photo"), div[aria-label*="cover photo"][role="button"]').first();
  if (await coverBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Cover Photo button...');
    await coverBtn.click({ force: true });
    await page.waitForTimeout(2000);

    const uploadCoverOption = page.locator('div[role="menuitem"]:has-text("Upload photo"), div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadCoverOption.isVisible({ timeout: 3000 }).catch(() => false)) {
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

    console.log('Waiting 5s for cover photo upload...');
    await page.waitForTimeout(5000);
    const saveChangesBtn = page.locator('div[role="button"]:has-text("Save changes"), div[aria-label="Save changes"]').first();
    if (await saveChangesBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save changes for cover photo...');
      await saveChangesBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }
  }

  // 5. UPLOAD AVATAR
  console.log('Looking for Avatar camera button...');
  const avatarCamera = page.locator('div[aria-label*="profile picture"][role="button"], div[aria-label*="Profile picture"][role="button"], div[role="button"]:has(svg[aria-label*="profile picture"])').first();
  if (await avatarCamera.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking avatar camera button...');
    await avatarCamera.click({ force: true });
    await page.waitForTimeout(2000);

    const chooseOption = page.locator('span:has-text("Choose profile picture"), div[role="menuitem"]:has-text("Choose profile picture")').first();
    if (await chooseOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Choose profile picture...');
      await chooseOption.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const uploadBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), span:has-text("Upload Photo")').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking + Upload Photo in dialog...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        uploadBtn.click({ force: true })
      ]);
      await fileChooser.setFiles(AVATAR_PATH);
    } else {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(AVATAR_PATH);
    }

    console.log('Waiting 5s for crop modal...');
    await page.waitForTimeout(5000);

    const saveBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
    if (await saveBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save Avatar button...');
      await saveBtn.click({ force: true });
      await page.waitForTimeout(8000);
    }
  }

  // Final check to save cover photo changes if still visible
  const saveCoverAfter = page.locator('div[role="button"]:has-text("Save changes"), [aria-label="Save changes"]').first();
  if (await saveCoverAfter.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Save changes for cover photo (final)...');
    await saveCoverAfter.click({ force: true });
    await page.waitForTimeout(4000);
  }

  await page.waitForTimeout(4000);
  const finalShot = path.join(ARTIFACT_DIR, 'fb_hi_live_complete.png');
  await page.screenshot({ path: finalShot });
  console.log('Saved final screenshot:', finalShot);

  await ctx.close();
  console.log('🎉 Hindi Page creation and branding complete!');
}

main().catch(console.error);
