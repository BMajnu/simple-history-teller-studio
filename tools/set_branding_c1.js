const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_en.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  console.log('Ensuring clean state on Studio Profile page...');
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  // 1. Upload Profile Picture / Avatar
  console.log('1. Setting Profile Picture / Logo...');
  const profileInput = page.locator('ytcp-profile-image-upload input[type="file"]').first();
  await profileInput.setInputFiles(LOGO_PATH);
  await page.waitForTimeout(3000);

  // Click Done on profile crop dialog
  console.log('Checking for profile crop Done button...');
  const pDoneBtn = page.locator('#done-button button, #done-button, button:has-text("Done")').first();
  if (await pDoneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Done on Profile crop...');
    await pDoneBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // 2. Upload Banner Image
  console.log('2. Setting Banner Image...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  await bannerInput.setInputFiles(BANNER_PATH);
  await page.waitForTimeout(3000);

  // Click Done on banner crop dialog
  console.log('Checking for banner crop Done button...');
  const bDoneBtn = page.locator('ytcp-banner-editor #done-button button, ytcp-banner-editor #done-button, button:has-text("Done")').first();
  if (await bDoneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Done on Banner crop...');
    await bDoneBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // 3. Publish changes
  console.log('3. Checking Publish button...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  const isEnabled = await pubBtn.isEnabled().catch(() => false);
  console.log('Publish enabled:', isEnabled);
  if (isEnabled) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting for save...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_new_branding_applied.png' });
  console.log('Saved verification screenshot: tools/c1_new_branding_applied.png');
  process.exit(0);
})();
