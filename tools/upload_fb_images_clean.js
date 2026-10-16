const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No create page found');
    process.exit(1);
  }

  // Inspect current state
  await p.screenshot({ path: 'tools/fb_step2_current.png' });
  console.log('Saved tools/fb_step2_current.png');

  const fileInputs = await p.locator('input[type="file"]').count();
  console.log('Current file inputs count:', fileInputs);

  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_en.jpg');

  // Let's set both sequentially
  const inputs = p.locator('input[type="file"]');
  if (fileInputs >= 1) {
    console.log('Setting avatar on input 0...');
    await inputs.nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(4000);
  }

  const fileInputsAfter = await p.locator('input[type="file"]').count();
  console.log('File inputs count after avatar:', fileInputsAfter);
  if (fileInputsAfter >= 2) {
    console.log('Setting cover on input 1...');
    await inputs.nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/fb_step2_after_files.png' });
  console.log('Saved tools/fb_step2_after_files.png');

  // Next
  const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  await nextBtn.click({ force: true });
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/fb_step3_screen.png' });
  console.log('Saved tools/fb_step3_screen.png');

  process.exit(0);
})();
