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
  console.log('=== BRANDING PAGE: SIMPLE HISTORY TELLER BANGLA ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click on Simple History Teller Bangla
  console.log('Clicking on Simple History Teller Bangla page...');
  const pageCard = page.locator('span:has-text("Simple History Teller Bangla")').first();
  await pageCard.click({ force: true });
  await page.waitForTimeout(5000);

  // Check if a "Switch" button appears to manage the page
  const switchBtn = page.locator('div[role="button"]:has-text("Switch"), div[aria-label*="Switch"]').first();
  if (await switchBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Switch into page mode...');
    await switchBtn.click({ force: true });
    await page.waitForTimeout(6000);
  }

  const pageLandingShot = path.join(ARTIFACT_DIR, 'fb_bn_page_landing.png');
  await page.screenshot({ path: pageLandingShot });
  console.log('Saved:', pageLandingShot);
  console.log('Page URL:', page.url());

  // 1. UPLOAD AVATAR
  console.log('Looking for Profile Picture update button...');
  const avatarBtn = page.locator('div[role="button"][aria-label*="Update profile picture"], div[role="button"][aria-label*="choose profile picture"], div[role="button"][aria-label*="profile picture"], svg[aria-label*="Update profile picture"]').first();
  
  if (await avatarBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Avatar camera button...');
    await avatarBtn.click({ force: true });
    await page.waitForTimeout(2000);

    const uploadOption = page.locator('div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Setting file on upload photo input...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        uploadOption.click({ force: true })
      ]);
      await fileChooser.setFiles(AVATAR_PATH);
    } else {
      // Fallback: look for file input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(AVATAR_PATH);
    }

    console.log('Waiting for Avatar modal to load...');
    await page.waitForTimeout(4000);
    const saveAvatarBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
    if (await saveAvatarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clicking Save Avatar button...');
      await saveAvatarBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }
  } else {
    // Try file input directly if present
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('Uploading avatar via file input directly...');
      await fileInput.setInputFiles(AVATAR_PATH);
      await page.waitForTimeout(4000);
      const saveAvatarBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="button"][aria-label="Save"]').first();
      if (await saveAvatarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveAvatarBtn.click({ force: true });
        await page.waitForTimeout(5000);
      }
    }
  }

  // 2. UPLOAD COVER BANNER
  console.log('Looking for Cover Photo button...');
  const coverBtn = page.locator('div[role="button"]:has-text("Add cover photo"), div[role="button"]:has-text("Edit cover photo"), div[role="button"][aria-label*="cover photo"]').first();

  if (await coverBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Cover photo button...');
    await coverBtn.click({ force: true });
    await page.waitForTimeout(2000);

    const uploadCoverOption = page.locator('div[role="button"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
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

    console.log('Waiting for Cover Photo to position...');
    await page.waitForTimeout(5000);
    const saveCoverBtn = page.locator('div[role="button"]:has-text("Save changes"), div[aria-label="Save changes"]').first();
    if (await saveCoverBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      console.log('Clicking Save Changes for cover photo...');
      await saveCoverBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }
  }

  await page.waitForTimeout(4000);
  const finalBrandedShot = path.join(ARTIFACT_DIR, 'fb_bn_page_branded.png');
  await page.screenshot({ path: finalBrandedShot });
  console.log('Saved:', finalBrandedShot);

  await ctx.close();
  console.log('Done branding Bangla page.');
}

main().catch(console.error);
