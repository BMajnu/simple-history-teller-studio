const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== UPLOADING IMAGES ON STEP 2 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('FB create page not found');
    process.exit(1);
  }

  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  console.log('Avatar exists:', fs.existsSync(avatarPath), avatarPath);
  console.log('Banner exists:', fs.existsSync(bannerPath), bannerPath);

  // Inspect file inputs
  const inputsInfo = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map((el, idx) => ({
      index: idx,
      accept: el.accept,
      id: el.id,
      className: el.className
    }));
  });
  console.log('File inputs available:', inputsInfo);

  const fileLocators = p.locator('input[type="file"]');
  const count = await fileLocators.count();
  console.log('Count of input[type="file"]:', count);

  if (count >= 1) {
    console.log('Uploading avatar to input 0...');
    await fileLocators.nth(0).setInputFiles(avatarPath);
    console.log('Avatar uploaded, waiting 5s...');
    await p.waitForTimeout(5000);
  }

  // Check count again (sometimes the second input renders only after or was already there)
  const countAfter = await p.locator('input[type="file"]').count();
  console.log('Count of input[type="file"] after avatar:', countAfter);

  if (countAfter >= 2) {
    console.log('Uploading banner to input 1...');
    await p.locator('input[type="file"]').nth(1).setInputFiles(bannerPath);
    console.log('Banner uploaded, waiting 5s...');
    await p.waitForTimeout(5000);
  } else {
    console.log('Only 1 input found. Checking if there is another file input or button...');
  }

  console.log('Taking screenshot...');
  // Use timeout: 10000 for screenshot
  try {
    await p.screenshot({ path: 'tools/fb_c2_step2_images_done.png', timeout: 10000 });
    console.log('Screenshot saved to tools/fb_c2_step2_images_done.png');
  } catch (err) {
    console.warn('Screenshot warning:', err.message);
  }

  // Now let us click Next to go to Step 3
  console.log('Looking for Next button on Step 2...');
  const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Clicking Next on Step 2...');
    await nextBtn.click();
    await p.waitForTimeout(4000);
  } else {
    console.log('Next button not directly visible, trying mouse click at (265, 893)...');
    await p.mouse.click(265, 893);
    await p.waitForTimeout(4000);
  }

  const step3Text = await p.innerText('body');
  console.log('Page text snippet after Step 2 Next:\n', step3Text.substring(0, 300));

  process.exit(0);
})();
