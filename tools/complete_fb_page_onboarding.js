const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  console.log('=== COMPLETING FACEBOOK PAGE ONBOARDING ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No page create tab found');
    process.exit(1);
  }

  // Fill Website
  const webInput = p.locator('input[type="text"]').first();
  if (await webInput.isVisible().catch(() => false)) {
    console.log('Filling website...');
    await webInput.fill('https://youtube.com/@SimpleHistoryTellerOfficial');
    await p.waitForTimeout(300);
  }

  // Fill Email
  const emailInput = p.locator('input[type="text"]').nth(2);
  if (await emailInput.isVisible().catch(() => false)) {
    console.log('Filling email...');
    await emailInput.fill('bmajnu980@gmail.com');
    await p.waitForTimeout(300);
  }

  // Click Next
  console.log('Clicking Next on Step 1...');
  const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  await nextBtn.click({ force: true });
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/fb_page_step2_images.png' });
  console.log('Saved tools/fb_page_step2_images.png');

  // Inspect file inputs on Step 2 (Profile photo and Cover photo)
  const fileInputs = await p.locator('input[type="file"]').count();
  console.log('File inputs count on Step 2:', fileInputs);

  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_en.jpg');

  if (fileInputs >= 2) {
    console.log('Uploading Profile photo and Cover photo...');
    await p.locator('input[type="file"]').nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(3000);
    await p.locator('input[type="file"]').nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(3000);
  } else if (fileInputs === 1) {
    console.log('Uploading photo to input 0...');
    await p.locator('input[type="file"]').first().setInputFiles(avatarPath);
    await p.waitForTimeout(3000);
  }

  await p.screenshot({ path: 'tools/fb_page_images_uploaded.png' });
  console.log('Saved tools/fb_page_images_uploaded.png');

  // Click Next
  const nextBtn2 = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    console.log('Clicking Next on Step 2...');
    await nextBtn2.click({ force: true });
    await p.waitForTimeout(4000);
  }

  // Check Step 3/4/5
  for (let step = 3; step <= 5; step++) {
    const btn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`Clicking button for step ${step}...`);
      await btn.click({ force: true });
      await p.waitForTimeout(3000);
    }
  }

  await p.screenshot({ path: 'tools/fb_page_onboarding_finished.png' });
  console.log('Saved tools/fb_page_onboarding_finished.png. URL now:', p.url());

  process.exit(0);
})();
