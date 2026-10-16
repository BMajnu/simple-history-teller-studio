const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== UPLOADING IMAGES FOR SIMPLE HISTORY TELLER BANGLA ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('No create page tab found!');
    process.exit(1);
  }

  // Dismiss toast if any
  const closeToast = p.locator('div[aria-label="Close"], i[data-visualcompletion]').first();
  if (await closeToast.isVisible().catch(() => false)) {
    await closeToast.click().catch(() => {});
  }

  // Scroll left sidebar down to find Next button
  console.log('Scrolling left pane to click Next...');
  const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  await nextBtn.scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await nextBtn.click({ force: true });
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/fb_c2_step2_screen.png' });
  console.log('Saved tools/fb_c2_step2_screen.png');

  // Step 2: Upload Avatar and Cover Photo
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  const fileInputs = p.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('File inputs found:', count);

  if (count >= 1) {
    console.log('Uploading Profile avatar...');
    await fileInputs.nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(4000);
  }

  const countAfter = await p.locator('input[type="file"]').count();
  console.log('File inputs after avatar:', countAfter);
  if (countAfter >= 2) {
    console.log('Uploading Cover photo banner...');
    await p.locator('input[type="file"]').nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/fb_c2_step2_uploaded.png' });
  console.log('Saved tools/fb_c2_step2_uploaded.png');

  // Click Next through remaining wizard steps
  for (let s = 2; s <= 5; s++) {
    const btn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`Clicking wizard step ${s}...`);
      await btn.click({ force: true });
      await p.waitForTimeout(3000);
    }
  }

  // Final URL and screenshot of the live page
  await p.waitForTimeout(4000);
  console.log('Final Page URL:', p.url());
  await p.screenshot({ path: 'tools/fb_page_c2_live_final.png' });
  console.log('Saved tools/fb_page_c2_live_final.png');

  fs.copyFileSync('tools/fb_page_c2_live_final.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png');
  console.log('Artifact updated: fb_page_c2_live.png');

  process.exit(0);
})();
