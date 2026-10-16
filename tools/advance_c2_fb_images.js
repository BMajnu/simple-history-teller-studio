const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== ADVANCING TO STEP 2 & UPLOADING IMAGES ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('No create page found');
    process.exit(1);
  }

  // 1. Remove the floating black toast overlay from DOM
  await p.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('was created. You can now add images'));
    toasts.forEach(t => t.remove());
  });
  await p.waitForTimeout(500);

  // 2. Click the Next button at (265, 911)
  console.log('Clicking Next button at (265, 911)...');
  await p.mouse.click(265, 911);
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/fb_c2_step2_reached.png' });
  console.log('Saved tools/fb_c2_step2_reached.png');

  // 3. Step 2 (Images): Upload Avatar & Cover Photo
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  const fileInputs = p.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('File inputs count on Step 2:', count);

  if (count >= 1) {
    console.log('Uploading avatar on input 0...');
    await fileInputs.nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(4000);
  }

  const countAfter = await p.locator('input[type="file"]').count();
  console.log('File inputs count after avatar:', countAfter);
  if (countAfter >= 2) {
    console.log('Uploading cover banner on input 1...');
    await p.locator('input[type="file"]').nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/fb_c2_images_rendered.png' });
  console.log('Saved tools/fb_c2_images_rendered.png');

  // 4. Click Next through all remaining wizard steps
  for (let s = 2; s <= 6; s++) {
    console.log(`Advancing wizard step ${s}...`);
    // Remove any toasts if they pop up
    await p.evaluate(() => {
      Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('was created')).forEach(t => t.remove());
    });
    
    // Find Next, Done, Skip button
    const btn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await p.waitForTimeout(3500);
    } else {
      // Click at (265, 911)
      await p.mouse.click(265, 911);
      await p.waitForTimeout(3500);
    }
  }

  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/fb_c2_live_page_final.png' });
  console.log('Saved tools/fb_c2_live_page_final.png. Final URL:', p.url());

  fs.copyFileSync('tools/fb_c2_live_page_final.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png');
  console.log('Artifact updated: fb_page_c2_live.png');

  process.exit(0);
})();
