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
  console.log('=== CREATING PAGE 1: SIMPLE HISTORY TELLER BANGLA ===');
  console.log('Avatar exists:', fs.existsSync(AVATAR_PATH), AVATAR_PATH);
  console.log('Banner exists:', fs.existsSync(BANNER_PATH), BANNER_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to https://www.facebook.com/pages/create/ ...');
  await page.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const initShot = path.join(ARTIFACT_DIR, 'fb_create_bn_init.png');
  await page.screenshot({ path: initShot });
  console.log('Saved:', initShot);

  // 1. Fill Page Name
  console.log('Typing Page Name: Simple History Teller Bangla...');
  const nameInput = page.locator('label:has-text("Page name") input, input[type="text"]:visible').first();
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.click({ force: true });
  await page.keyboard.type('Simple History Teller Bangla', { delay: 60 });
  await page.waitForTimeout(1000);

  // 2. Fill Category
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
    console.log('Trying keyboard Enter for category...');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }

  // 3. Fill Bio
  console.log('Typing Bio...');
  const bioInput = page.locator('textarea:visible').first();
  if (await bioInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await bioInput.click({ force: true });
    await page.keyboard.type('🏛️ অ্যানিমেশনের মাধ্যমে জানুন রোমাঞ্চকর ইতিহাস! ⏰ প্রতি ২ দিনে নতুন পর্ব 📺 YouTube: @SimpleHistoryTellerBangla', { delay: 30 });
    await page.waitForTimeout(1500);
  }

  const filledShot = path.join(ARTIFACT_DIR, 'fb_create_bn_filled.png');
  await page.screenshot({ path: filledShot });
  console.log('Saved:', filledShot);

  // 4. Click Create Page
  console.log('Clicking Create Page button...');
  const createBtn = page.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Waiting 12s for Facebook page creation API...');
  await page.waitForTimeout(12000);

  const step1Shot = path.join(ARTIFACT_DIR, 'fb_create_bn_step1.png');
  await page.screenshot({ path: step1Shot });
  console.log('Saved:', step1Shot);

  // 5. Contact fields (Website & Email)
  console.log('Checking for Contact info fields...');
  const textInputs = page.locator('input[type="text"]');
  const countInputs = await textInputs.count();
  console.log('Found', countInputs, 'text inputs on wizard');
  if (countInputs >= 1) {
    try {
      await textInputs.nth(0).fill('https://youtube.com/@SimpleHistoryTellerBangla');
      await page.waitForTimeout(500);
      if (countInputs >= 3) {
        await textInputs.nth(2).fill('badiuzzaman.majnu@gmail.com');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.warn('Contact info warning:', e.message);
    }
  }

  // Click Next to Step 2 (Images)
  console.log('Clicking Next to Step 2 (Photos)...');
  const nextBtn1 = page.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn1.isVisible({ timeout: 4000 }).catch(() => false)) {
    await nextBtn1.click({ force: true });
    await page.waitForTimeout(4000);
  }

  const step2Shot = path.join(ARTIFACT_DIR, 'fb_create_bn_step2.png');
  await page.screenshot({ path: step2Shot });
  console.log('Saved:', step2Shot);

  // 6. Upload Avatar & Cover Banner
  console.log('Looking for file inputs on Step 2...');
  const fileInputs = page.locator('input[type="file"]');
  const fileCount = await fileInputs.count();
  console.log('File inputs count:', fileCount);

  if (fileCount >= 1) {
    console.log('Uploading Profile Picture (Avatar)...');
    await fileInputs.nth(0).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(5000);
  }
  const fileCountAfter = await fileInputs.count();
  if (fileCountAfter >= 2) {
    console.log('Uploading Cover Photo (Banner)...');
    await fileInputs.nth(1).setInputFiles(BANNER_PATH);
    await page.waitForTimeout(5000);
  }

  const imagesUploadedShot = path.join(ARTIFACT_DIR, 'fb_create_bn_images_uploaded.png');
  await page.screenshot({ path: imagesUploadedShot });
  console.log('Saved:', imagesUploadedShot);

  // 7. Click Next / Done through remaining wizard steps
  for (let s = 1; s <= 5; s++) {
    console.log(`Advancing wizard step ${s}...`);
    const actionBtn = page.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await actionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await actionBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }
  }

  await page.waitForTimeout(5000);
  const finalShot = path.join(ARTIFACT_DIR, 'fb_create_bn_final.png');
  await page.screenshot({ path: finalShot });
  console.log('Final screenshot saved:', finalShot);
  console.log('Current URL:', page.url());

  await ctx.close();
  console.log('🎉 Page 1 (Bangla) creation complete!');
}

main().catch(err => {
  console.error('Error creating Bangla page:', err);
  process.exit(1);
});
