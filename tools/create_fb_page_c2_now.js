const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== STARTING FACEBOOK PAGE CREATION: BANGLA (CHANNEL 2) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('No pages/create page found!');
    process.exit(1);
  }

  // Intercept GraphQL responses to monitor page creation
  p.on('response', async resp => {
    if (resp.url().includes('graphql')) {
      try {
        const text = await resp.text();
        if (text.includes('additional_profile_plus_create') || text.includes('error_message') || text.includes('page_create')) {
          console.log('GRAPHQL RESPONSE:', text.slice(0, 500));
        }
      } catch (e) {}
    }
  });

  // 1. Fill Page Name
  console.log('Typing Page Name: Simple History Teller Bangla...');
  const nameInput = p.locator('input[type="text"]').first();
  await nameInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.waitForTimeout(300);
  await p.keyboard.type('Simple History Teller Bangla', { delay: 40 });
  await p.waitForTimeout(500);

  // 2. Fill Category
  console.log('Typing Category: Digital creator...');
  const catInput = p.locator('input[aria-label*="Category"]').first();
  await catInput.click();
  await p.keyboard.type('Digital creator', { delay: 50 });
  await p.waitForTimeout(2000);

  // Select category option from dropdown
  console.log('Selecting category option...');
  const option = p.locator('div[role="listbox"] div[role="option"], ul[role="listbox"] li, div[role="option"]').first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
    await p.waitForTimeout(1000);
  } else {
    await p.evaluate(() => {
      const opt = document.querySelector('[role="option"]');
      if (opt) opt.click();
    });
    await p.waitForTimeout(1000);
  }

  // 3. Fill Bio
  console.log('Typing Bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click();
  await p.keyboard.type('🏛️ অ্যানিমেশনের মাধ্যমে জানুন রোমাঞ্চকর ইতিহাস! ⏰ প্রতি ২ দিনে নতুন পর্ব 📺 YouTube: @SimpleHistoryTellerBangla', { delay: 25 });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_c2_filled_now.png' });
  console.log('Saved tools/fb_c2_filled_now.png');

  // 4. Click Create Page
  console.log('Clicking Create Page button...');
  const createBtn = p.locator('div[aria-label="Create Page"], div[role="button"]:has-text("Create Page")').first();
  await createBtn.click({ force: true });
  console.log('Clicked Create Page, waiting 15s for Facebook to process...');
  await p.waitForTimeout(15000);

  await p.screenshot({ path: 'tools/fb_c2_after_create_submit.png' });
  console.log('Saved tools/fb_c2_after_create_submit.png. URL:', p.url());

  // 5. Check if we moved to Step 1 (Contact info)
  const textInputs = p.locator('input[type="text"]');
  const countInputs = await textInputs.count();
  console.log('Text inputs count on wizard:', countInputs);
  if (countInputs >= 1) {
    try {
      console.log('Filling website...');
      await textInputs.nth(0).fill('https://youtube.com/@SimpleHistoryTellerBangla');
      await p.waitForTimeout(400);
      if (countInputs >= 3) {
        console.log('Filling email...');
        await textInputs.nth(2).fill('bmajnu981@gmail.com');
        await p.waitForTimeout(400);
      }
    } catch (e) {
      console.log('Contact fill info:', e.message);
    }
  }

  // Next to Images step
  let nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Clicking Next to Step 2 (Images)...');
    await nextBtn.click({ force: true });
    await p.waitForTimeout(4000);
  }

  // 6. Upload Avatar & Cover Banner
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  const fileInputs = p.locator('input[type="file"]');
  const fileCount = await fileInputs.count();
  console.log('File inputs count on images step:', fileCount);

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

  await p.screenshot({ path: 'tools/fb_c2_images_attached.png' });
  console.log('Saved tools/fb_c2_images_attached.png');

  // Advance remaining wizard steps
  for (let step = 2; step <= 6; step++) {
    console.log(`Advancing wizard step ${step}...`);
    const actionBtn = p.locator('div[aria-label="Next"][role="button"], div[aria-label="Done"][role="button"], div[role="button"]:has-text("Next"), div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip")').first();
    if (await actionBtn.isVisible().catch(() => false)) {
      await actionBtn.click({ force: true });
      await p.waitForTimeout(3500);
    }
  }

  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/fb_c2_live_success.png' });
  console.log('Saved tools/fb_c2_live_success.png. Final URL:', p.url());

  // Copy to artifacts
  fs.copyFileSync('tools/fb_c2_live_success.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png');
  console.log('Artifact updated: fb_page_c2_live.png');

  process.exit(0);
})();
