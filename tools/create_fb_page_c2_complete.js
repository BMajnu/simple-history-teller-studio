const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  console.log('=== CREATING FACEBOOK PAGE: SIMPLE HISTORY TELLER BANGLA ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No pages/create page found');
    process.exit(1);
  }

  // 1. Fill Page Name
  console.log('Filling Page Name: Simple History Teller Bangla...');
  const nameInput = p.locator('input[type="text"]').first();
  await nameInput.click({ force: true });
  await p.keyboard.type('Simple History Teller Bangla', { delay: 40 });
  await p.waitForTimeout(500);

  // 2. Fill Category
  console.log('Filling Category: Digital creator...');
  const catInput = p.locator('input[aria-label*="Category"]').first();
  await catInput.click({ force: true });
  await p.keyboard.type('Digital creator', { delay: 50 });
  await p.waitForTimeout(2000);

  // Select category option
  console.log('Selecting category option...');
  const option = p.locator('div[role="listbox"] div[role="option"], ul[role="listbox"] li, div[role="option"]').first();
  if (await option.isVisible().catch(() => false)) {
    await option.click({ force: true });
    await p.waitForTimeout(1000);
  } else {
    await p.evaluate(() => {
      const opt = document.querySelector('[role="option"]');
      if (opt) opt.click();
    });
    await p.waitForTimeout(1000);
  }

  // 3. Fill Bio
  console.log('Filling Bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click({ force: true });
  await p.keyboard.type('🏛️ অ্যানিমেশনের মাধ্যমে জানুন রোমাঞ্চকর ইতিহাস! ⏰ প্রতি ২ দিনে নতুন পর্ব 📺 YouTube: @SimpleHistoryTellerBangla', { delay: 20 });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_c2_filled_verified.png' });
  console.log('Saved tools/fb_c2_filled_verified.png');

  // 4. Click Create Page
  console.log('Clicking Create Page...');
  const createBtn = p.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Clicked Create Page, waiting 12s for Facebook to create Page...');
  await p.waitForTimeout(12000);

  await p.screenshot({ path: 'tools/fb_c2_created_step1.png' });
  console.log('Saved tools/fb_c2_created_step1.png. URL:', p.url());

  // 5. Onboarding wizard - Step 1: Website & Contact
  console.log('Looking for Contact fields...');
  const textInputs = p.locator('input[type="text"]');
  const countInputs = await textInputs.count();
  console.log('Text inputs count on wizard:', countInputs);
  if (countInputs >= 1) {
    try {
      await textInputs.nth(0).fill('https://youtube.com/@SimpleHistoryTellerBangla');
      await p.waitForTimeout(300);
      if (countInputs >= 3) {
        await textInputs.nth(2).fill('bmajnu981@gmail.com');
        await p.waitForTimeout(300);
      }
    } catch (e) {
      console.log('Error filling website/email:', e.message);
    }
  }

  // Click Next to step 2 (Images)
  console.log('Clicking Next to Step 2...');
  let nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click({ force: true });
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/fb_c2_step2_images.png' });
  console.log('Saved tools/fb_c2_step2_images.png');

  // 6. Upload Avatar & Cover Banner
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  const fileInputs = p.locator('input[type="file"]');
  const fileCount = await fileInputs.count();
  console.log('File inputs count on Step 2:', fileCount);

  if (fileCount >= 1) {
    console.log('Setting avatar photo...');
    await fileInputs.nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(4000);
  }
  const fileCountAfter = await fileInputs.count();
  if (fileCountAfter >= 2) {
    console.log('Setting cover banner photo...');
    await fileInputs.nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(4000);
  }

  await p.screenshot({ path: 'tools/fb_c2_images_uploaded.png' });
  console.log('Saved tools/fb_c2_images_uploaded.png');

  // Click Next through remaining wizard steps
  for (let step = 2; step <= 6; step++) {
    console.log(`Advancing wizard step ${step}...`);
    const actionBtn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await actionBtn.isVisible().catch(() => false)) {
      await actionBtn.click({ force: true });
      await p.waitForTimeout(3500);
    }
  }

  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/fb_c2_live_final.png' });
  console.log('Saved tools/fb_c2_live_final.png. Final URL:', p.url());

  process.exit(0);
})();
