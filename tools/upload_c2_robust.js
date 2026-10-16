const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_bn.jpg');

const CHANNEL_ID = 'UCOzERwa3GJqO00B8LMTPtDg';
const EMAIL = 'bmajnu981@gmail.com';

(async () => {
  console.log('=== ROBUST BRANDING UPLOAD FOR CHANNEL 2 (Bangla: bmajnu981) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  page.on('dialog', async d => {
    console.log('Dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // Switch to bmajnu981
  console.log('Switching account to bmajnu981...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    await switchItem.click();
    await page.waitForTimeout(2000);
    const item = page.locator(`ytd-account-item-renderer:has-text("${EMAIL}")`).first();
    if (await item.count() > 0) {
      await item.click();
      await page.waitForTimeout(4000);
    }
  }

  // Open Channel 2 Studio Profile
  console.log('Navigating to Channel 2 Studio Profile...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Clear overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  // 1. Upload Logo
  console.log('1. Setting Profile Logo...');
  const profileInput = page.locator('ytcp-profile-image-upload input[type="file"]').first();
  await profileInput.setInputFiles(LOGO_PATH);
  console.log('Waiting for Profile crop dialog...');
  await page.waitForSelector('ytcp-image-cropper, ytcp-dialog', { timeout: 15000 }).catch(() => console.log('Cropper selector timeout'));
  await page.waitForTimeout(2000);

  const pDone = page.locator('ytcp-dialog #done-button button, ytcp-image-cropper #done-button button, #done-button button, #done-button').first();
  if (await pDone.isVisible().catch(() => false)) {
    console.log('Clicking Done on Profile modal...');
    await pDone.click({ force: true });
    await page.waitForTimeout(3000);
  } else {
    console.log('Profile Done button not found directly, checking any visible Done button...');
    const allDone = page.locator('button:has-text("Done")');
    for (let i = 0; i < await allDone.count(); i++) {
      if (await allDone.nth(i).isVisible()) {
        await allDone.nth(i).click({ force: true });
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // 2. Upload Banner
  console.log('2. Setting Banner Image...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  await bannerInput.setInputFiles(BANNER_PATH);
  console.log('Waiting for Banner crop editor...');
  await page.waitForSelector('ytcp-banner-editor', { timeout: 15000 }).catch(() => console.log('Banner editor timeout'));
  await page.waitForTimeout(2000);

  const bDone = page.locator('ytcp-banner-editor #done-button button, ytcp-banner-editor #done-button').first();
  if (await bDone.isVisible().catch(() => false)) {
    console.log('Clicking Done on Banner modal...');
    await bDone.click({ force: true });
    await page.waitForTimeout(3000);
  } else {
    console.log('Banner Done button fallback...');
    const allDone = page.locator('button:has-text("Done")');
    for (let i = 0; i < await allDone.count(); i++) {
      if (await allDone.nth(i).isVisible()) {
        await allDone.nth(i).click({ force: true });
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // 3. Publish
  console.log('3. Publishing Channel 2...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  const isEnabled = await pubBtn.isEnabled().catch(() => false);
  console.log('Publish enabled:', isEnabled);
  if (isEnabled) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 8s for YouTube to save...');
    await page.waitForTimeout(8000);
  }

  await page.screenshot({ path: 'tools/c2_robust_published.png' });
  console.log('Saved Channel 2 verification screenshot.');

  // Check public view
  console.log('Verifying public channel view...');
  await page.goto('https://www.youtube.com/@SimpleHistoryTellerBangla', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/c2_public_updated_live.png' });
  console.log('Channel 2 public screenshot saved!');

  await page.close();
  process.exit(0);
})();
